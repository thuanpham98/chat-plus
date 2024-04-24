import { MessageModel } from "@/domain/chat";
import {
  Group,
  MessageData,
  MessageIndexDbInteractionReponseGetListMessages,
  MessageIndexDbInteractionRequest,
} from "./message-index-db-interaction";

let isStart = false;
let portMessage: MessagePort;
let db: IDBDatabase;
const dataQuery = new Map<bigint, MessageModel & { timestamp: number }>();
let shouldReQuery = true;
let receiver: string;

self.addEventListener("message", async function (event) {
  if (!isStart) {
    const data = new Uint8Array(event.data as ArrayBuffer);
    if (!data || data.byteLength === 0) {
      return;
    }
    try {
      const message = MessageIndexDbInteractionRequest.fromBinary(data, {
        readUnknownField: false,
      });
      if (message.eventType === "init") {
        isStart = true;
        portMessage = event.ports[0];
        portMessage.onmessage = handlerMessageFromPort;
        const indexDbReq = indexedDB.open("my-db", 4);

        indexDbReq.onsuccess = () => {
          db = indexDbReq.result;
          useDatabase(db);
          console.debug("Database opened successfully");
        };
        indexDbReq.onblocked = () => {
          console.debug("Please close all other tabs with this site open!");
        };
        indexDbReq.onupgradeneeded = function () {
          db = indexDbReq.result;
          console.debug("Database needs upgrade or creation");
          const objectStore = db.createObjectStore("message", {
            keyPath: "id",
          });
          objectStore.createIndex("timestamp", "timestamp", {
            unique: false,
          });
          useDatabase(db);
        };
        indexDbReq.onerror = (event) => {
          console.error("Error opening database:", event.target);
        };
      }
    } catch (error) {
      console.error(error);
      return;
    }
    return;
  }
});

function useDatabase(database: IDBDatabase) {
  database.onversionchange = () => {
    database.close();
    console.error(
      "A new version of this page is ready. Please reload or close this tab!",
    );
  };
}

async function handlerMessageFromPort(event: MessageEvent) {
  const data = new Uint8Array(event.data as ArrayBuffer);
  if (!data || data.byteLength === 0) {
    return;
  }
  const message = MessageIndexDbInteractionRequest.fromBinary(data, {
    readUnknownField: false,
  });
  if (message.eventType === "create") {
    db
      .transaction(["message"], "readwrite", {
        durability: "strict",
      })
      .objectStore("message")
      .add({
        ...message.data,
        timestamp: new Date(message.data.createAt).getTime(),
      }).onsuccess = () => {
      shouldReQuery = true;
      dataQuery.clear();
    };
  }

  if (message.eventType === "delete") {
    db.transaction(["message"], "readwrite", {
      durability: "strict",
    })
      .objectStore("message")
      .delete(message.data.id);
  }

  if (message.eventType === "list") {
    if (receiver !== message.data.receiver) {
      shouldReQuery = true;
      receiver = message.data.receiver;
      dataQuery.clear();
    }
    if (!shouldReQuery) {
      const listMessage: Array<MessageData> = [];
      for (
        let i = message.page * message.pageSize;
        i < (message.page + BigInt(1)) * message.pageSize;
        i++
      ) {
        const tmp = dataQuery.get(BigInt(i));
        tmp &&
          listMessage.push(
            MessageData.create({
              id: tmp.id,
              content: tmp.content,
              createAt: tmp.createAt,
              group: tmp.group
                ? Group.create({
                    id: tmp.group.id,
                    name: tmp.group.name,
                  })
                : undefined,
              receiver: tmp.receiver,
              sender: tmp.sender,
              type: tmp.type.valueOf(),
            }),
          );
      }
      const dataTransfer =
        MessageIndexDbInteractionReponseGetListMessages.toBinary(
          MessageIndexDbInteractionReponseGetListMessages.create({
            eventType: "list",
            messages: listMessage.reverse(),
          }),
        );
      portMessage.postMessage(dataTransfer, [dataTransfer.buffer]);
      return;
    }
    const upperBound = new Date();
    const lowerBound = new Date(upperBound);
    lowerBound.setDate(upperBound.getDate() - 14);
    const keyRange = IDBKeyRange.bound(
      lowerBound.getTime(),
      upperBound.getTime(),
    );

    db
      .transaction(["message"], "readwrite")
      .objectStore("message")
      .index("timestamp")
      .openCursor(keyRange, "prev").onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        const v = cursor.value as MessageModel & { timestamp: number };
        if (
          (v.receiver === message.data.receiver &&
            v.sender === message.data.sender) ||
          (v.receiver === message.data.sender &&
            v.sender === message.data.receiver)
        ) {
          dataQuery.set(BigInt(dataQuery.size), cursor.value);
        }
        cursor.continue();
      } else {
        // console.debug(dataQuery);
        shouldReQuery = false;
        // [dataQuery.entries()].sort(
        //   ([a], [b]) => b[1].timestamp - a[1].timestamp,
        // );
        // console.debug(dataQuery);
        const listMessage: Array<MessageData> = [];
        for (
          let i = message.page * message.pageSize;
          i < (message.page + BigInt(1)) * message.pageSize;
          i++
        ) {
          // BigInt(dataQuery.size - 1) -
          const tmp = dataQuery.get(BigInt(i));
          tmp &&
            listMessage.push(
              MessageData.create({
                id: tmp.id,
                content: tmp.content,
                createAt: tmp.createAt,
                group: tmp.group
                  ? Group.create({
                      id: tmp.group.id,
                      name: tmp.group.name,
                    })
                  : undefined,
                receiver: tmp.receiver,
                sender: tmp.sender,
                type: tmp.type.valueOf(),
              }),
            );
        }
        const dataTransfer =
          MessageIndexDbInteractionReponseGetListMessages.toBinary(
            MessageIndexDbInteractionReponseGetListMessages.create({
              eventType: "list",
              messages: listMessage.reverse(),
            }),
          );
        portMessage.postMessage(dataTransfer, [dataTransfer.buffer]);
      }
    };
  }
}

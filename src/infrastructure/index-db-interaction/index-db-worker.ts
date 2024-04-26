import { MessageModel } from "@/domain/chat";
import {
  Group,
  MessageData,
  MessageIndexDbInteractionReponseGetListMessages,
  MessageIndexDbInteractionRequest,
} from "./message-index-db-interaction";
import { UserModel } from "@/domain/auth";
import dayjs from "dayjs";

let isStart = false;
let portMessage: MessagePort;
let db: IDBDatabase;
const dataQuery = new Map<bigint, MessageModel & { timestamp: number }>();

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
          useDatabase(db, message.token);
          console.debug("Database opened successfully");
        };

        indexDbReq.onblocked = () => {
          console.debug("Please close all other tabs with this site open!");
        };

        indexDbReq.onupgradeneeded = function () {
          db = indexDbReq.result;

          if (db.objectStoreNames.contains("message")) {
            db.deleteObjectStore("message");
          }

          const objectStore = db.createObjectStore("message", {
            keyPath: "id",
          });

          objectStore.createIndex("timestamp", "timestamp", {
            unique: false,
          });

          useDatabase(db, message.token);
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

async function useDatabase(database: IDBDatabase, token?: string) {
  database.onversionchange = () => {
    database.close();
    console.error(
      "A new version of this page is ready. Please reload or close this tab!",
    );
  };
  try {
    const retFriends = await fetch(
      "http://localhost:6969/api/v1/user/friends",
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Cookie: token,
        },
      },
    );
    const rawFriends = await retFriends.json();
    let friends: UserModel[] = [];
    if (rawFriends.data.data && rawFriends.data.data.length > 0) {
      friends = friends.concat(rawFriends.data.data as UserModel[]);
    }
    await Promise.all(friends.map((f) => syncMessageWithsFriends(token, f.id)));
  } catch (error) {
    console.error(error);
  }
  const dataTransfer = MessageIndexDbInteractionReponseGetListMessages.toBinary(
    MessageIndexDbInteractionReponseGetListMessages.create({
      eventType: "done-sync",
      messages: [],
    }),
  );

  portMessage.postMessage(dataTransfer, [dataTransfer.buffer]);
}

async function handlerMessageFromPort(event: MessageEvent) {
  const data = new Uint8Array(event.data as ArrayBuffer);
  if (!data || data.byteLength === 0) {
    return;
  }
  const message = MessageIndexDbInteractionRequest.fromBinary(data, {
    readUnknownField: false,
  });
  if (message.eventType === "reset-db") {
    if (db.objectStoreNames.contains("message")) {
      db.transaction(["message"], "readwrite").objectStore("message").clear();
    }
  }
  if (message.eventType === "create") {
    db
      .transaction(["message"], "readwrite")
      .objectStore("message")
      .add({
        ...message.data,
        timestamp: new Date(message.data.createAt).getTime(),
      }).onsuccess = () => {
      console.debug("done save");
    };
  }

  if (message.eventType === "delete") {
    db.transaction(["message"], "readwrite")
      .objectStore("message")
      .delete(message.data.id);
  }

  if (message.eventType === "list") {
    const upperBound = new Date();
    const lowerBound = new Date(upperBound);
    lowerBound.setDate(upperBound.getDate() - 14);
    lowerBound.setHours(0);
    lowerBound.setMinutes(0);
    lowerBound.setSeconds(0);
    lowerBound.setMilliseconds(0);
    upperBound.setHours(23);
    upperBound.setMinutes(59);
    upperBound.setSeconds(59);
    upperBound.setMilliseconds(999);
    const keyRange = IDBKeyRange.bound(
      lowerBound.getTime(),
      upperBound.getTime(),
    );

    db
      .transaction(["message"], "readonly")
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
        // [dataQuery.entries()].sort(
        //   ([a], [b]) => b[1].timestamp - a[1].timestamp,
        // );
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
        dataQuery.clear();
      }
    };
  }
}

async function syncMessageWithsFriends(token: string, friendId: string) {
  let done = false;
  let page = 0;
  const today = new Date();

  const timeZoneConvert = `${today.getTimezoneOffset() > 0 ? "-" : "+"}${-~~(
    today.getTimezoneOffset() / 600
  )}${(-today.getTimezoneOffset() / 60) % 10}:00`;

  while (!done) {
    await new Promise<void>((rev) => {
      fetch("http://localhost:6969/api/v1/message/list", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Cookie: token,
        },
        body: JSON.stringify({
          page: page,
          page_size: 10,
          receiver: friendId,
          to:
            dayjs(new Date().setHours(23, 59, 59, 999)).format(
              "YYYY-MM-DDTHH:mm:ss.SSS",
            ) + `${timeZoneConvert}`,
          from:
            dayjs(Date.now() - 1000 * 3600 * 24 * 14).format(
              "YYYY-MM-DDTHH:mm:ss.SSS",
            ) + `${timeZoneConvert}`,
        }),
      })
        .then((ret) => {
          return ret.json();
        })
        .then(async (data) => {
          if (data?.data?.code === 0) {
            const message: MessageModel[] =
              data.data?.data?.map((m): MessageModel => {
                return {
                  id: m?.id ?? "",
                  content: m?.content ?? "",
                  createAt: m?.create_at ?? "",
                  receiver: m?.receiver ?? "",
                  sender: m?.sender ?? "",
                  type: m?.type ?? 0,
                  group: m?.group
                    ? {
                        id: m.group.id,
                        name: m.group.name,
                      }
                    : undefined,
                };
              }) ?? [];
            // update mesage into db --------------------
            if (message.length > 0) {
              const tx = db.transaction(["message"], "readwrite");
              Promise.all(
                message.map((mes) =>
                  tx.objectStore("message").put({
                    ...mes,
                    timestamp: new Date(mes.createAt).getTime(),
                  }),
                ),
              ).catch((e) => {
                console.error(e);
                tx.abort();
              });
            }
            // update mesage into db --------------------
            if (message.length < 10) {
              done = true;
            } else {
              page++;
            }
          } else {
            done = true;
          }
        })
        .finally(() => {
          rev();
        });
    });
  }
}

import { RdModule } from "@radts/reactjs";
import {
  MessageIndexDbInteractionReponseGetListMessages,
  MessageIndexDbInteractionRequest,
} from "./message-index-db-interaction";
import { MessageModel } from "@/domain/chat";
import { Subject, take, tap } from "rxjs";

export class IndexDbInteraction extends RdModule {
  public readonly key: symbol;

  public getName(): string {
    return this.key.description ?? "IndexDbInteraction";
  }

  private worker: Worker;
  private channel: MessageChannel;
  private messageSubject: Subject<MessageModel[]>;

  constructor() {
    super();
    this.key = Symbol("IndexDbInteraction");
    this.messageSubject = new Subject<MessageModel[]>();
    this.worker = new Worker("worker_interact_indexdb.js");
    this.channel = new MessageChannel();
    this.channel.port1.onmessageerror = (e) => {
      this.onErrorMessage(e);
    };
    this.channel.port1.onmessage = (e) => {
      this.onMessage(e);
    };
    this.onInit();
  }

  private onInit(): void {
    this.channel.port1.start();
    this.channel.port2.start();
    this.worker.onerror = (e) => {
      console.error(e);
    };
    const req = MessageIndexDbInteractionRequest.toBinary(
      MessageIndexDbInteractionRequest.create({
        eventType: "init",
        data: {},
      }),
    );
    this.worker.postMessage(req, [this.channel.port2, req.buffer]);
  }

  public dispose() {
    this.worker.terminate();
    this.channel.port1.close();
    this.channel.port2.close();
  }

  private onErrorMessage(e) {
    console.error(e);
    console.debug("lỗi không xử lý đc, hẹn lần sau nhé");
  }

  private async onMessage(event) {
    try {
      const message =
        MessageIndexDbInteractionReponseGetListMessages.fromBinary(event.data, {
          readUnknownField: "throw",
        });
      if (message.eventType === "list") {
        const listData: MessageModel[] = [];
        for (let i = 0; i < message.messages.length; i++) {
          listData.push({
            id: message.messages[i].id,
            content: message.messages[i].content,
            createAt: message.messages[i].createAt,
            group: message.messages[i].group
              ? {
                  id: message.messages[i].group.id,
                  name: message.messages[i].group.name,
                }
              : undefined,
            receiver: message.messages[i].receiver,
            sender: message.messages[i].sender,
            type: message.messages[i].type.valueOf(),
          });
        }
        this.messageSubject.next(listData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  public listenMessages(): Promise<MessageModel[]> {
    return new Promise((resole) => {
      const sub = this.messageSubject
        .pipe(
          take(1), // Chỉ nhận một giá trị đầu tiên
          tap((v) => {
            sub.unsubscribe(); // Hủy bỏ subscription sau khi nhận được giá trị đầu tiên
            resole(v);
          }),
        )
        .subscribe();
    });
  }

  public createMessage(message: MessageModel) {
    const data = MessageIndexDbInteractionRequest.toBinary(
      MessageIndexDbInteractionRequest.create({
        eventType: "create",
        data: {
          id: message.id,
          content: message.content,
          createAt: message.createAt,
          group: message.group
            ? {
                id: message.group.id,
                name: message.group.name,
              }
            : undefined,
          receiver: message.receiver,
          sender: message.sender,
          type: message.type.valueOf(),
        },
      }),
    );
    this.channel.port1.postMessage(data, [data.buffer]);
  }

  public deleteMessage(id: string) {
    const data = MessageIndexDbInteractionRequest.toBinary(
      MessageIndexDbInteractionRequest.create({
        eventType: "delete",
        data: {
          id: id,
        },
      }),
    );
    this.channel.port1.postMessage(data, [data.buffer]);
  }

  public listMessage(
    sender: string,
    receiver: string,
    page: bigint,
    pageSize: bigint,
  ) {
    const data = MessageIndexDbInteractionRequest.toBinary(
      MessageIndexDbInteractionRequest.create({
        eventType: "list",
        page: page,
        pageSize: pageSize,
        data: {
          receiver: receiver,
          sender: sender,
        },
      }),
    );
    this.channel.port1.postMessage(data, [data.buffer]);
  }
}

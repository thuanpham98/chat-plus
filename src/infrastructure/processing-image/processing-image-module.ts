import { RdModule } from "@radts/reactjs";
import { PriorityQueue } from "./priorrity-queue";
import { Subject, Subscription } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import {
  MessageProcessingImageEventType,
  MessageProcessingImageRequest,
  MessageProcessingImageResponse,
} from "./message-processing-image";

class PriorityQueueData {
  public path: string;
  constructor(path: string) {
    this.path = path;
  }
}

export class ProcessingImageModule extends RdModule {
  public readonly key: symbol;

  public getName(): string {
    return this.key.description ?? "ProcessingImageModule";
  }

  private tickets: Map<string, string>;
  private ticketsIgnore: Map<string, string>;
  private priorityQueue: PriorityQueue<PriorityQueueData>;
  private currentTicket: string;
  private observer: Subject<{
    path: string;
    ticket: string;
    data: Blob | null;
  }>;
  private worker: Worker;
  private isProcessing: boolean;
  private channel: MessageChannel;

  constructor() {
    super();
    this.key = Symbol("ProcessingImageModule");
    this.isProcessing = false;
    this.tickets = new Map<string, string>();
    this.ticketsIgnore = new Map<string, string>();
    this.priorityQueue = new PriorityQueue<PriorityQueueData>();
    this.currentTicket = "";
    this.observer = new Subject<{
      path: string;
      ticket: string;
      data: Blob | null;
    }>();
    this.worker = new Worker("worker_process_image.js");
    this.channel = new MessageChannel();
    this.channel.port1.onmessageerror = (e) => {
      this.onErrorMessage(e);
    };
    this.channel.port1.onmessage = (e) => {
      this.onMessage(e);
    };
    this.onInit();
  }

  public dispose() {
    this.worker.terminate();
    this.channel.port1.close();
    this.channel.port2.close();
  }

  private nextProcess() {
    if (
      this.tickets.size > 0 &&
      this.currentTicket.trim() === "" &&
      this.isProcessing
    ) {
      const ret = this.priorityQueue.dequeue();
      if (this.ticketsIgnore.has(ret.path)) {
        this.tickets.delete(ret.path);
        this.ticketsIgnore.delete(ret.path);
        this.nextProcess();
      }
      this.currentTicket = this.tickets.get(ret.path);
      this.tickets.delete(ret.path);

      const req = MessageProcessingImageRequest.toBinary(
        MessageProcessingImageRequest.create({
          path: ret.path,
          eventType: MessageProcessingImageEventType.START,
        }),
      );
      this.channel.port1.postMessage(req, [req.buffer]);
    }
  }

  private onInit(): void {
    this.channel.port1.start();
    this.channel.port2.start();
    this.worker.onerror = (e) => {
      console.error(e);
    };
    const req = MessageProcessingImageRequest.toBinary(
      MessageProcessingImageRequest.create({
        path: "start-module-processing-image",
        eventType: MessageProcessingImageEventType.INIT,
      }),
    );
    this.worker.postMessage(req, [this.channel.port2, req.buffer]);
  }

  private onErrorMessage(e) {
    console.error(e);
    this.observer.next({
      path: "",
      ticket: this.currentTicket,
      data: null,
    });
    console.debug("lỗi không xử lý đc, hẹn lần sau nhé");
  }

  private async onMessage(event) {
    try {
      const message = MessageProcessingImageResponse.fromBinary(event.data, {
        readUnknownField: "throw",
      });
      if (
        message.eventType === MessageProcessingImageEventType.END &&
        message.data.byteLength > 0
      ) {
        this.observer.next({
          path: "",
          ticket: this.currentTicket,
          data: new Blob([message.data], { type: message.typeImage }),
        });
      } else if (message.eventType === MessageProcessingImageEventType.ERROR) {
        this.observer.next({
          path: "",
          ticket: this.currentTicket,
          data: null,
        });
        console.debug("lỗi không xử lý đc, hẹn lần sau nhé");
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.currentTicket = "";
      this.nextProcess();
    }
  }

  public pushImage(path: string, weight: number): string {
    if (!this.tickets.has(path)) {
      this.priorityQueue.enqueue(new PriorityQueueData(path), weight);
      this.tickets.set(path, uuidv4());
    }
    return this.tickets.get(path);
  }

  public ignoreImage(path: string): boolean {
    if (!this.tickets.has(path)) {
      return false;
    }
    this.ticketsIgnore.set(path, this.tickets.get(path));
    return true;
  }

  public subcrise(
    calback: ({
      path,
      data,
      ticket,
    }: {
      path: string;
      ticket: string;
      data: Blob | null;
    }) => void,
  ): Subscription {
    return this.observer.subscribe(calback);
  }

  public startProcess() {
    if (!this.isProcessing) {
      this.isProcessing = true;
      this.nextProcess();
    }
  }

  public stopProcess() {
    this.isProcessing = false;
  }
}


import { RdModule } from "@radts/reactjs";
import { PriorityQueue } from "./priorrity-queue";
import { Subject, Subscription } from "rxjs";
import { v4 as uuidv4 } from "uuid";

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
    data: string;
  }>;
  private worker: Worker;
  private isProcessing: boolean;

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
      data: string;
    }>();
    this.worker = new Worker("worker_process_image.js");
    this.worker.onerror = (e) => {
      console.error(e);
    };
    this.worker.onmessageerror = (e) => {
      console.error(e);
    };

    this.worker.onmessage = (e) => {
      if (e.data.code === 0) {
        this.observer.next({
          path: "",
          ticket: this.currentTicket,
          data: e.data.value,
        });
      } else if (e.data.code === 1) {
        console.debug(
          "không thể push ảnh dạng buffer ra, nên save local rồi gửi path ra",
        );
        this.observer.next({
          path: e.data.value,
          ticket: this.currentTicket,
          data: null,
        });
      } else if (e.data.code === -1) {
        console.debug("lỗi không xử lý đc, hẹn lần sau nhé");
        this.observer.next({
          path: "",
          ticket: this.currentTicket,
          data: null,
        });
      }
      this.currentTicket = "";
      this.nextProcess();
    };
  }

  public dispose() {
    this.worker.terminate();
  }

  private nextProcess() {
    if (
      this.tickets.size > 0 &&
      this.currentTicket.trim() === "" &&
      this.isProcessing
    ) {
      console.debug(this);
      const ret = this.priorityQueue.dequeue();
      if (this.ticketsIgnore.has(ret.path)) {
        this.tickets.delete(ret.path);
        this.ticketsIgnore.delete(ret.path);
        this.nextProcess();
      }
      this.currentTicket = this.tickets.get(ret.path);
      this.tickets.delete(ret.path);
      this.worker.postMessage({ type: "processing", value: ret.path });
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
      data: string;
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


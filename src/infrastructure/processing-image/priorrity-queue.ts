import { MaxHeap } from "./max-heap";

export enum WeightQueuePriority {
  LEVEL1 = 1,
  LEVEL2 = 2,
  LEVEL3 = 3,
  LEVEL4 = 4,
  LEVEL5 = 5,
  LEVEL6 = 6,
  LEVEL7 = 7,
  LEVEL8 = 8,
  LEVEL9 = 9,
  LEVEL10 = 10,
}

export class PriorityQueue<T> {
  public maxHeap: MaxHeap<T>;

  constructor() {
    this.maxHeap = new MaxHeap<T>();
  }

  enqueue(data: T, num: number): void {
    this.maxHeap.insert(data, num);
  }

  dequeue(): T | undefined {
    return this.maxHeap.extractMax();
  }

  peek(): T | undefined {
    return this.maxHeap.peekMax();
  }

  isEmpty(): boolean {
    return this.maxHeap.isEmpty();
  }

  size(): number {
    return this.maxHeap.size();
  }
}

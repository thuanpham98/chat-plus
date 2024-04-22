class HeapNode<T> {
  data: T;
  weigh: number;
  index: number;

  constructor(data: T, weigh: number, index: number) {
    this.data = data;
    this.weigh = weigh;
    this.index = index;
  }
}

export class MaxHeap<T> {
  private heap: HeapNode<T>[];
  private counter: number;

  constructor() {
    this.counter = 0;
    this.heap = [];
  }

  private remapIndexes(): void {
    const oldHeap = [...this.heap]; // Tạo một bản sao của heap hiện tại

    // Khởi tạo lại heap và counter
    this.heap = [];
    this.counter = 0;

    // Gán lại index cho từng phần tử theo thứ tự của chúng trong bản sao
    for (const node of oldHeap) {
      node.index = this.generateIndex();
      this.heap.push(node);
    }
  }

  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private getLeftChildIndex(index: number): number {
    return 2 * index + 1;
  }

  private getRightChildIndex(index: number): number {
    return 2 * index + 2;
  }

  private swap(index1: number, index2: number): void {
    [this.heap[index1], this.heap[index2]] = [
      this.heap[index2],
      this.heap[index1],
    ];
  }

  private generateIndex(): number {
    if (this.counter === Number.MAX_SAFE_INTEGER - 1) {
      this.remapIndexes();
    }
    return this.counter++;
  }

  private siftUp(index: number): void {
    if (index === 0) return;

    const parentIndex = this.getParentIndex(index);
    const currentNode = this.heap[index];
    const parentNode = this.heap[parentIndex];

    if (
      currentNode.weigh > parentNode.weigh ||
      (currentNode.weigh === parentNode.weigh &&
        currentNode.index < parentNode.index)
    ) {
      this.swap(parentIndex, index);
      this.siftUp(parentIndex);
    }
  }

  private siftDown(index: number): void {
    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);
    let largest = index;

    if (
      leftChildIndex < this.heap.length &&
      this.isGreater(leftChildIndex, largest)
    ) {
      largest = leftChildIndex;
    }

    if (
      rightChildIndex < this.heap.length &&
      this.isGreater(rightChildIndex, largest)
    ) {
      largest = rightChildIndex;
    }

    if (largest !== index) {
      this.swap(index, largest);
      this.siftDown(largest);
    }
  }

  private isGreater(index1: number, index2: number): boolean {
    const node1 = this.heap[index1];
    const node2 = this.heap[index2];

    return (
      node1.weigh > node2.weigh ||
      (node1.weigh === node2.weigh && node1.index < node2.index)
    );
  }

  insert(data: T, num: number): void {
    const newIndex = this.generateIndex();
    const newNode = new HeapNode(data, num, newIndex);
    this.heap.push(newNode);
    this.siftUp(this.heap.length - 1);
  }

  extractMax(): T | undefined {
    if (this.heap.length === 0) return undefined;

    const max = this.heap[0].data;
    const last = this.heap.pop();

    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last;
      this.siftDown(0);
    }

    return max;
  }

  peekMax(): T | undefined {
    return this.heap.length > 0 ? this.heap[0].data : undefined;
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }
}

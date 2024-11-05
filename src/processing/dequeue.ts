export function* dequeue<T = unknown>(queue: Array<T>): Generator<T, void> {
  while (queue.length > 0) {
    const result = queue.shift();
    if (result) {
      yield result;
    }
  }
}

export async function* asyncDequeue<T = unknown>(
  queue: Array<Awaited<T>>,
): AsyncGenerator<T, void, void> {
  while (queue.length > 0) {
    const result = queue.shift();
    if (result) {
      yield await result;
    }
  }
}

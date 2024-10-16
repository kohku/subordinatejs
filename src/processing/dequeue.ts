export function* dequeue<T = unknown>(queue: Array<T>): Generator<T, void> {
  while (queue.length > 0){
    const result = queue.shift();
    if (result) {
      yield result;
    }
  }
}

export async function* asyncDequeue<T = unknown>(queue: Array<Awaited<T>>): AsyncGenerator<T, void, void> {
  while (queue.length > 0) {
    const result = queue.shift();
    if (result) {
      yield await result;
    }
  }
}


/*
export async function* asyncDequeue(queue: Array<Command>): AsyncGenerator<unknown, void, void> {
  while (queue.length > 0) {
    const command = queue.shift();
    if (command) {
      try {
        const result = await command();
        yield result;
      } catch {
        yield undefined;
      }
    }
  }
}
*/
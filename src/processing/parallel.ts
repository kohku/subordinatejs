import { Command, ProcessingOptions } from "types/processing";
import { dequeue } from "./dequeue";

export const executeParallel = <T = unknown>(
  queue: Array<Command<T>>,
  options?: Partial<ProcessingOptions>,
): Promise<Array<T | undefined>> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const iterator = dequeue(snapshot ? [...queue] : queue);

  const promises = [];

  let command = iterator.next();

  while(!command.done) {
    promises.push(command.value());

    command = iterator.next();
  }

  if (continueOnFailures) {
    return Promise.allSettled(promises).then((results) => (
      results.map((result) => (
        result.status === 'fulfilled'
        ? result.value
        : undefined
      ))
    ));
  }

  return Promise.all(promises);
};

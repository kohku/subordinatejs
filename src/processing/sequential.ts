import { Command, ProcessingOptions } from "types/processing";
import { asyncDequeue } from "./dequeue";

export const executeSequential = async <T = unknown>(
  queue: Array<Command<T>>,
  options?: Partial<ProcessingOptions>,
): Promise<Array<T | undefined>> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const values = [];
  const iterator = asyncDequeue(snapshot ? [...queue]: queue);

  let command = await iterator.next();

  while(!command.done) {
    try {
      const value = await command.value();
      values.push(value);
    } catch (e) {
      if (!continueOnFailures) {
        throw e;
      }
      values.push(undefined);
    }
    command = await iterator.next();
  }

  return values;
};

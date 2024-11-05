import { ChainedCommand, ProcessingOptions } from "processing/types";
import { asyncDequeue } from "./dequeue";

export const executeSequential = async <T = unknown>(
  queue: Array<ChainedCommand<T>>,
  options?: Partial<ProcessingOptions>,
  initialState?: unknown,
  initiator?: unknown,
): Promise<Array<T | undefined>> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const values: Array<T | undefined> = [];
  const iterator = asyncDequeue(snapshot ? [...queue] : queue);

  let command = await iterator.next();

  while (!command.done) {
    try {
      const value = await command.value(initialState, initiator);
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

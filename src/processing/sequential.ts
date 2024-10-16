import { Command, ProcessingOptions } from "types/processing";
import { asyncDequeue } from "./dequeue";

export const executeSequential = async (
  queue: Array<Command>,
  options?: Partial<ProcessingOptions>,
): Promise<unknown[]> => {
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


/*
import { Command, ProcessingOptions } from "types/processing";
import { asyncDequeue } from "./dequeue";

export const executeSequential = async (
  queue: Array<Command>,
  options?: Partial<ProcessingOptions>,
): Promise<unknown[]> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const values = [];
  const iterator = asyncDequeue(snapshot ? [...queue] : queue);

  let command = await iterator.next();

  while(!command.done) {
    values.push(command.value);
    command = await iterator.next();
  }

  return Promise.resolve(values);
};
*/
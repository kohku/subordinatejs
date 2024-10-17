import { Command, ProcessingOptions } from "types/processing";
import { promiseWhile } from "./promise-while";
import { dequeue } from "./dequeue";

export const executeRecursive = <T = unknown>(
  queue: Array<Command<T>>,
  options?: Partial<ProcessingOptions>,
): Promise<Array<T | undefined>> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const values: Array<T | undefined> = [];
  const iterator = dequeue(snapshot ? [...queue] : queue);

  let command = iterator.next();

  return promiseWhile(
    () => Promise.resolve(!!command.done),
    async () => {
      try {
        const task = command.value as Command<T>;
        const response = await Promise.resolve(task());
        values.push(response);
        command = iterator.next();
      } 
      catch (error) {
        values.push(undefined);
        if (!continueOnFailures) {
          throw error;
        }
        command = iterator.next();
      }
    }
  ).then(() => values);
}
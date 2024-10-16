import { promiseWhile } from "./promise-while";
import { dequeue } from "./dequeue";
import { Command, ProcessingOptions } from "types/processing";

export const executeRecursive = (
  queue: Array<Command>,
  options?: Partial<ProcessingOptions>,
): Promise<unknown[]> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const values: Array<unknown> = [];
  const iterator = dequeue(snapshot ? [...queue] : queue);

  let command = iterator.next();

  return promiseWhile(
    () => Promise.resolve(!!command.done),
    async () => {
      try {
        const task = command.value as Command;
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
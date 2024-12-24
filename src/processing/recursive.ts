import { ChainedCommand, ProcessingOptions } from "processing/types";
import { promiseWhile } from "./promise-while";
import { dequeue } from "./dequeue";

// reduce<U>(
//   callbackfn: (
//     previousValue: U,
//     currentValue: T,
//     currentIndex: number,
//     array: T[]
//   ) => U, 
//   initialValue: U
// ): U;

export const executeRecursive = async <T = void, Subject = unknown>(
  queue: Array<ChainedCommand<T>>,
  options?: Partial<ProcessingOptions>,
  initialState?: T,
  subject?: Subject,
): Promise<T | undefined> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  let value: T | undefined = undefined;
  const iterator = dequeue<ChainedCommand<T>>(snapshot ? [...queue] : queue);

  let command = iterator.next();

  if (command.done) {
    return value;
  }

  const task = command.value;
  value = await Promise.resolve(task({ subject, state: initialState }));

  command = iterator.next();

  await promiseWhile(
    () => Promise.resolve(!!command.done),
    async () => {
      try {
        const state = value;
        const task = command.value;
        if (task){
          value = await Promise.resolve(task({ subject, state }));
        }
        command = iterator.next();
      } catch (error) {
        value = undefined;
        if (!continueOnFailures) {
          throw error;
        }
        command = iterator.next();
      }
    },
  );

  return value;
};

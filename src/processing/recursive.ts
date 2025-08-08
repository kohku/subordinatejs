import { Commandable, ProcessingOptions } from 'processing/types';
import { promiseWhile } from './promise-while';
import { dequeue } from './dequeue';
import { ProcessingEvent } from './events';

export const executeRecursive = async <Return = void, Subject = unknown>(
  queue: Array<Commandable<unknown>>,
  options?: Partial<ProcessingOptions>,
  subject?: Subject,
  initialState?: unknown,
): Promise<Return | undefined> => {
  const snapshot = options?.snapshot ?? true;
  const eventEmitter = options?.eventEmitter;
  const continueOnFailures = options?.continueOnFailures ?? false;
  let value: unknown = initialState;
  const iterator = dequeue<Commandable<unknown>>(snapshot ? [...queue] : queue);

  let command = iterator.next();
  // Nothing to do
  if (command.done) {
    return undefined;
  }

  await promiseWhile(
    () => Promise.resolve(!!command.done),
    async (state: unknown) => {
      const { value: task } = command;
      try {
        if (task) {
          eventEmitter?.emit(ProcessingEvent.NextCommand, state, task);
          value = await Promise.resolve(task.execute({ subject, state }));
          eventEmitter?.emit(ProcessingEvent.CommandComplete, value, task);
        }
      } catch (error) {
        eventEmitter?.emit(ProcessingEvent.CommandFailed, error, state, task);
        if (!continueOnFailures) {
          throw error;
        }
        value = undefined;
      }
      command = iterator.next();
      return value;
    },
    initialState,
  );

  return value as Return;
};

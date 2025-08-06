import { Commandable, ProcessingOptions } from 'processing/types';
import { promiseWhile } from './promise-while';
import { dequeue } from './dequeue';
import { ProcessingEvent } from './events';

export const executeRecursive = async <T = void, Subject = unknown>(
  queue: Array<Commandable<T>>,
  options?: Partial<ProcessingOptions>,
  initialState?: T,
  subject?: Subject,
): Promise<T | undefined> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  let value: T | undefined = undefined;
  const iterator = dequeue<Commandable<T>>(snapshot ? [...queue] : queue);

  let command = iterator.next();
  options?.eventEmitter?.emit(ProcessingEvent.NextCommand, command);

  // Extract the first command to use the initial value
  if (command.done) {
    return value;
  }

  try {
    const task = command.value;
    value = await Promise.resolve(
      task.execute({ subject, state: initialState }),
    );
    options?.eventEmitter?.emit(ProcessingEvent.CommandComplete, value);
  } catch (error) {
    options?.eventEmitter?.emit(ProcessingEvent.CommandFailed, error);
    value = undefined;
    if (!continueOnFailures) {
      throw error;
    }
  }

  // Move to the next command
  command = iterator.next();
  options?.eventEmitter?.emit(ProcessingEvent.NextCommand, command);

  await promiseWhile(
    () => Promise.resolve(!!command.done),
    async () => {
      try {
        const state = value;
        const task = command.value;
        if (task) {
          value = await Promise.resolve(task.execute({ subject, state }));
          options?.eventEmitter?.emit(ProcessingEvent.CommandComplete, value);
        }
      } catch (error) {
        options?.eventEmitter?.emit(ProcessingEvent.CommandFailed, error);
        if (!continueOnFailures) {
          throw error;
        }
        value = undefined;
      }
      command = iterator.next();
      options?.eventEmitter?.emit(ProcessingEvent.NextCommand, command);
    },
  );

  return value;
};

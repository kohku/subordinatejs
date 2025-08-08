import { Commandable, ProcessingOptions } from 'processing/types';
import { asyncDequeue } from './dequeue';
import { ProcessingEvent } from './events';

export const executeSequential = async <Return = void, Subject = unknown>(
  queue: Array<Commandable<unknown>>,
  options?: Partial<ProcessingOptions>,
  subject?: Subject,
  initialState?: unknown,
): Promise<Return | undefined> => {
  const snapshot = options?.snapshot ?? true;
  const eventEmitter = options?.eventEmitter;
  const continueOnFailures = options?.continueOnFailures ?? false;
  let value: unknown = initialState;
  const iterator = asyncDequeue(snapshot ? [...queue] : queue);

  let command = await iterator.next();

  while (!command.done) {
    const task = command.value;
    try {
      eventEmitter?.emit(ProcessingEvent.NextCommand, value, task);
      value = await task.execute({
        subject,
        state: value,
      });
      eventEmitter?.emit(ProcessingEvent.CommandComplete, value, task);
    } catch (error) {
      eventEmitter?.emit(ProcessingEvent.CommandFailed, error, value, task);
      if (!continueOnFailures) {
        throw error;
      }
      value = undefined;
    }
    command = await iterator.next();
  }

  return value as Return;
};

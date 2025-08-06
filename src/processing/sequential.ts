import { Commandable, ProcessingOptions } from 'processing/types';
import { asyncDequeue } from './dequeue';
import { ProcessingEvent } from './events';

export const executeSequential = async <T = void, Subject = unknown>(
  queue: Array<Commandable<T>>,
  options?: Partial<ProcessingOptions>,
  initialState?: T,
  subject?: Subject,
): Promise<Array<T | undefined>> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const values: Array<T | undefined> = [];
  const iterator = asyncDequeue(snapshot ? [...queue] : queue);

  let command = await iterator.next();
  options?.eventEmitter?.emit(ProcessingEvent.NextCommand, command);

  while (!command.done) {
    try {
      const value = await command.value.execute({
        subject,
        state: initialState,
      });
      options?.eventEmitter?.emit(ProcessingEvent.CommandComplete, value);
      values.push(value);
    } catch (error) {
      options?.eventEmitter?.emit(ProcessingEvent.CommandFailed, error);
      if (!continueOnFailures) {
        throw error;
      }
      values.push(undefined);
    }
    command = await iterator.next();
    options?.eventEmitter?.emit(ProcessingEvent.NextCommand, command);
  }

  return values;
};

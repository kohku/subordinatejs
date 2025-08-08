import { Commandable, ProcessingOptions } from 'processing/types';
import { dequeue } from './dequeue';
import { ProcessingEvent } from './events';

export const executeParallel = <Return = void, Subject = unknown>(
  queue: Array<Commandable<Return>>,
  options?: Partial<ProcessingOptions>,
  subject?: Subject,
  initialState?: unknown,
): Promise<Array<Return | undefined>> => {
  const snapshot = options?.snapshot ?? true;
  const eventEmitter = options?.eventEmitter;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const iterator = dequeue(snapshot ? [...queue] : queue);

  const promises: Array<Promise<Return | undefined>> = [];

  let command = iterator.next();

  while (!command.done) {
    const { value: task } = command;
    eventEmitter?.emit(ProcessingEvent.NextCommand, initialState, task);
    promises.push(
      Promise.resolve(task.execute({ subject, state: initialState })),
    );

    command = iterator.next();
  }

  if (!continueOnFailures) {
    return Promise.all(promises)
      .then((results) => results.map((result) => {
        if (result instanceof Error) {
          eventEmitter?.emit(ProcessingEvent.CommandFailed, result);
        } else {
          eventEmitter?.emit(ProcessingEvent.CommandComplete, result);
        }
        return result;
    }));
  }

  return Promise.allSettled(promises).then((results) =>
    results.map((result) => {  
      if (result.status === 'fulfilled') {
        eventEmitter?.emit(
          ProcessingEvent.CommandComplete,
          result.value,
        );
        return result.value;
      } else if (result.status === 'rejected') {
        eventEmitter?.emit(
          ProcessingEvent.CommandFailed,
          result.reason,
        );
      }
      return undefined;
    }),
  );
};

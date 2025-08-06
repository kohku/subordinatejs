import { Commandable, ProcessingOptions } from 'processing/types';
import { dequeue } from './dequeue';
import { ProcessingEvent } from './events';

export const executeParallel = <T = void, Subject = unknown>(
  queue: Array<Commandable<T>>,
  options?: Partial<ProcessingOptions>,
  subject?: Subject,
): Promise<Array<T | undefined>> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const iterator = dequeue(snapshot ? [...queue] : queue);

  const promises = [];

  let command = iterator.next();
  options?.eventEmitter?.emit(ProcessingEvent.NextCommand, command);

  while (!command.done) {
    promises.push(
      Promise.resolve(command.value.execute({ subject, state: undefined })),
    );

    command = iterator.next();
    options?.eventEmitter?.emit(ProcessingEvent.NextCommand, command);
  }

  if (continueOnFailures) {
    return Promise.allSettled(promises).then((results) =>
      results.map((result) => {
        if (result.status === 'fulfilled') {
          options?.eventEmitter?.emit(
            ProcessingEvent.CommandComplete,
            result.value,
          );
          return result.value;
        }
        options?.eventEmitter?.emit(ProcessingEvent.CommandFailed, new Error());
        return undefined;
      }),
    );
  }

  return Promise.all(promises);
};

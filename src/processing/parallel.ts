import { ChainedCommand, ProcessingOptions } from "processing/types";
import { dequeue } from "./dequeue";

export const executeParallel = <T = void, Subject = unknown>(
  queue: Array<ChainedCommand<T>>,
  options?: Partial<ProcessingOptions>,
  subject?: Subject,
): Promise<Array<T | undefined>> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const iterator = dequeue(snapshot ? [...queue] : queue);

  const promises = [];

  let command = iterator.next();

  while (!command.done) {
    promises.push(Promise.resolve(command.value({ subject, state: undefined })));

    command = iterator.next();
  }

  if (continueOnFailures) {
    return Promise.allSettled(promises).then((results) =>
      results.map((result) =>
        result.status === "fulfilled" ? result.value : undefined,
      ),
    );
  }

  return Promise.all(promises);
};

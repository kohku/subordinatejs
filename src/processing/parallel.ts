import { StatelessCommand, ProcessingOptions } from "processing/types";
import { dequeue } from "./dequeue";

export const executeParallel = (
  queue: Array<StatelessCommand>,
  options?: Partial<ProcessingOptions>,
  initiator?: unknown,
): Promise<Array<unknown>> => {
  const snapshot = options?.snapshot ?? true;
  const continueOnFailures = options?.continueOnFailures ?? false;
  const iterator = dequeue(snapshot ? [...queue] : queue);

  const promises = [];

  let command = iterator.next();

  while (!command.done) {
    promises.push(Promise.resolve(command.value(initiator)));

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

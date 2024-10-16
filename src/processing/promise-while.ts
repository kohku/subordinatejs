import { Command, Condition } from "types/processing";

export const promiseWhile = (
  condition: Condition,
  fn: Command,
) => (
  new Promise<void>((resolve, reject) => {
    const loop = () => Promise.resolve(condition())
      .then((done) => {
        if (done) {
          resolve();
        } else {
          fn().then(loop, reject);
        }
      })
      .catch(reject);

    return loop();
  })
);
import { Condition } from 'processing/types';

export const promiseWhile = (
  condition: Condition,
  fn: () => Promise<void> | void,
) =>
  new Promise<void>((resolve, reject) => {
    const loop = () =>
      condition()
        .then((done) => {
          if (done) {
            resolve();
          } else {
            Promise.resolve(fn()).then(loop, reject);
          }
        })
        .catch(reject);

    return loop();
  });

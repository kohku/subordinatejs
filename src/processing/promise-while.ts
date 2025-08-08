import { Condition } from 'processing/types';

export const promiseWhile = <T = unknown>(
  condition: Condition,
  fn: (state?: T) => Promise<T | undefined>,
  initialState?: T
) =>
  new Promise<void>((resolve, reject) => {
    const loop = (state?: T) =>
      condition()
        .then((done) => {
          if (done) {
            resolve();
          } else {
            Promise.resolve(fn(state)).then(loop, reject);
          }
        })
        .catch(reject);

    return loop(initialState);
  });

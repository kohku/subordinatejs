import { executeRecursive } from './recursive';

jest.useFakeTimers({ advanceTimers: true });

const lambda = (name = '#', timeout = 1000) => ({
  execute: (): Promise<string> =>
    new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Inside lambda ${name}`);
        resolve(name);
      }, timeout);
    }),
});

describe('recursive', () => {
  let setTimeoutSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeAll(() => {
    setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    consoleLogSpy = jest.spyOn(console, 'log');
  });

  it('empty queue', async () => {
    const response = await executeRecursive<string>([]);
    expect(response).toBeUndefined();
  });

  it('iterates over the queue recursively, copy the queue', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) => lambda(el, (i + 1) * 250));
    const originalLength = theQueue.length;

    const response = await executeRecursive<string>(theQueue);

    expect(response).toEqual(list[list.length - 1]);
    // calling one set time out for each element in the list
    expect(setTimeoutSpy).toHaveBeenCalledTimes(list.length);
    expect(consoleLogSpy).toHaveBeenCalledTimes(list.length);
    // Keeps the queue
    expect(theQueue.length).toBe(originalLength);
  });

  it('iterates over the queue recursively, empty the queue', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) => lambda(el, (i + 1) * 250));

    jest.spyOn(global, 'setTimeout');
    jest.spyOn(Promise, 'resolve');

    const response = await executeRecursive<string>(theQueue, {
      snapshot: false,
    });

    expect(response).toEqual(list[list.length - 1]);
    // calling one set time out for each element in the list
    expect(setTimeoutSpy).toHaveBeenCalledTimes(list.length);
    expect(consoleLogSpy).toHaveBeenCalledTimes(list.length);
    // empty the queue
    expect(theQueue.length).toBe(0);
  });

  it('iterates over the queue recursively, continue on failures', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) =>
      el !== '3'
        ? lambda(el, (i + 1) * 250)
        : { execute: () => Promise.reject() },
    );

    const response = await executeRecursive<string>(theQueue, {
      continueOnFailures: true,
    });

    expect(response).toEqual(undefined);
    // calling one set time out for each element in the list
    expect(setTimeoutSpy).toHaveBeenCalledTimes(list.length - 1);
    expect(consoleLogSpy).toHaveBeenCalledTimes(list.length - 1);
  });

  it('iterates over the queue recursively, stop on failures', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) =>
      el !== '2'
        ? lambda(el, (i + 1) * 250)
        : { execute: () => Promise.reject('Whooops') },
    );

    const response = executeRecursive<string>(theQueue, {
      continueOnFailures: false,
    });

    await expect(response).rejects.toMatch('Whooops');
  });
});

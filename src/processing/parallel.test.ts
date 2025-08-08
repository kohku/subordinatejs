import Observable from '../observable/index';
import { Commandable } from './types';
import { executeParallel } from './parallel';
jest.mock('../observable/index');

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

describe('parallel', () => {
  let eventEmitter: Observable;
  let eventEmitterSpy: jest.SpyInstance;
  let setTimeoutSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeAll(() => {
    setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    consoleLogSpy = jest.spyOn(console, 'log');
  });

  beforeEach(() => {
    eventEmitter = new Observable();
    eventEmitterSpy = jest.spyOn(eventEmitter, 'emit');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle empty queue', async () => {
    const response = await executeParallel([]);
    expect(response).toEqual([]);
    expect(eventEmitterSpy).not.toHaveBeenCalled();
  });

  it('should handle empty queue without emitting events', async () => {
    // no processing options arguments
    const response = await executeParallel(
      [],
      { eventEmitter },
      undefined,
      '0',
    );
    expect(response).toEqual([]);
    expect(eventEmitterSpy).not.toHaveBeenCalled();
  });

  it('pass the initial value to all commands', async () => {
    const theQueue: Array<Commandable<number>> = [
      {
        execute: ({ state }) => state + 1,
      },
      {
        execute: ({ state }) => state + 2,
      },
      {
        execute: ({ state }) => state + 3,
      },
    ];
    // no processing options arguments
    const response = await executeParallel<number, number>(
      theQueue,
      { eventEmitter },
      undefined,
      1,
    );
    expect(response).toEqual([2, 3, 4]);
    expect(eventEmitterSpy).toHaveBeenCalledTimes(6);
  });

  it('iterates over the queue in parallel, copy the queue', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) => lambda(el, (i + 1) * 250));
    const originalLength = theQueue.length;

    const response = await executeParallel(theQueue, { eventEmitter });

    expect(response).toEqual(list);
    // calling one set time out for each element in the list
    expect(setTimeoutSpy).toHaveBeenCalledTimes(list.length);
    expect(consoleLogSpy).toHaveBeenCalledTimes(list.length);
    // Keeps the queue
    expect(theQueue.length).toBe(originalLength);

    expect(eventEmitterSpy).toHaveBeenCalledTimes(6);
  });

  it('iterates over the queue in parallel, empty the queue', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) => lambda(el, (i + 1) * 250));

    const response = await executeParallel(theQueue, {
      snapshot: false,
      eventEmitter,
    });

    expect(response).toEqual(list);
    // calling one set time out for each element in the list
    expect(setTimeoutSpy).toHaveBeenCalledTimes(list.length);
    expect(consoleLogSpy).toHaveBeenCalledTimes(list.length);
    // empty the queue
    expect(theQueue.length).toBe(0);

    expect(eventEmitterSpy).toHaveBeenCalledTimes(6);
  });

  it('iterates over the queue in parallel, continue on failures', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) =>
      el !== '2'
        ? lambda(el, (i + 1) * 250)
        : { execute: () => Promise.reject() },
    );

    const response = await executeParallel(theQueue, {
      continueOnFailures: true,
      eventEmitter,
    });

    expect(response).toEqual(['1', undefined, '3']);
    // calling one set time out for each element in the list
    expect(setTimeoutSpy).toHaveBeenCalledTimes(list.length - 1);
    expect(consoleLogSpy).toHaveBeenCalledTimes(list.length - 1);
  });

  it('iterates over the queue in parallel, stop on failures', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) =>
      el !== '2'
        ? lambda(el, (i + 1) * 250)
        : { execute: () => Promise.reject('Whooops') },
    );

    const response = executeParallel(theQueue, {
      continueOnFailures: false,
      eventEmitter
    });

    await expect(response).rejects.toMatch('Whooops');
  });
});

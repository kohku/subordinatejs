import Observable from '../observable/index';
import { ProcessingEvent } from './events';
import { executeSequential } from './sequential';
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

describe('sequential', () => {
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
    const response = await executeSequential<string>([]);
    expect(response).toBeUndefined();
    expect(eventEmitterSpy).not.toHaveBeenCalled();
  });

  it('should handle empty queue without emitting events', async () => {
    // no processing options arguments
    const response = await executeSequential<string>([], { eventEmitter });
    expect(response).toBeUndefined();
    expect(eventEmitterSpy).not.toHaveBeenCalled();
  });

  it('iterates over the queue sequentially, copy the queue', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i, arr) =>
      lambda(el, (arr.length - i) * 250),
    );
    const originalLength = theQueue.length;

    const response = await executeSequential<string>(
      theQueue,
      {
        eventEmitter,
      },
      undefined,
      '0',
    );

    expect(response).toEqual(list[list.length - 1]);
    // calling one set time out for each element in the list
    expect(setTimeoutSpy).toHaveBeenCalledTimes(list.length);
    expect(consoleLogSpy).toHaveBeenCalledTimes(list.length);
    // Keeps the queue
    expect(theQueue.length).toBe(originalLength);

    expect(eventEmitterSpy).toHaveBeenCalledTimes(6);
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      1,
      ProcessingEvent.NextCommand,
      '0',
      theQueue[0],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      2,
      ProcessingEvent.CommandComplete,
      '1',
      theQueue[0],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      3,
      ProcessingEvent.NextCommand,
      '1',
      theQueue[1],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      4,
      ProcessingEvent.CommandComplete,
      '2',
      theQueue[1],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      5,
      ProcessingEvent.NextCommand,
      '2',
      theQueue[2],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      6,
      ProcessingEvent.CommandComplete,
      '3',
      theQueue[2],
    );
  });

  it('iterates over the queue sequentially, empty the queue', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) => lambda(el, (i + 1) * 250));

    const response = await executeSequential<string>(theQueue, {
      snapshot: false,
      eventEmitter,
    });

    expect(response).toEqual(list[list.length - 1]);
    // calling one set time out for each element in the list
    expect(setTimeoutSpy).toHaveBeenCalledTimes(list.length);
    expect(consoleLogSpy).toHaveBeenCalledTimes(list.length);
    // empty the queue
    expect(theQueue.length).toBe(0);

    expect(eventEmitterSpy).toHaveBeenCalledTimes(6);
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      1,
      ProcessingEvent.NextCommand,
      undefined,
      expect.anything(),
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      2,
      ProcessingEvent.CommandComplete,
      '1',
      expect.anything(),
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      3,
      ProcessingEvent.NextCommand,
      '1',
      expect.anything(),
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      4,
      ProcessingEvent.CommandComplete,
      '2',
      expect.anything(),
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      5,
      ProcessingEvent.NextCommand,
      '2',
      expect.anything(),
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      6,
      ProcessingEvent.CommandComplete,
      '3',
      expect.anything(),
    );
  });

  it('iterates over the queue sequentially, continue on failures', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) =>
      el !== '3'
        ? lambda(el, (i + 1) * 250)
        : { execute: () => Promise.reject('error') },
    );

    const response = await executeSequential<string>(theQueue, {
      continueOnFailures: true,
      eventEmitter,
    });

    expect(response).toEqual(undefined);
    // calling one set time out for each element in the list
    expect(setTimeoutSpy).toHaveBeenCalledTimes(list.length - 1);
    expect(consoleLogSpy).toHaveBeenCalledTimes(list.length - 1);

    expect(eventEmitterSpy).toHaveBeenCalledTimes(6);
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      1,
      ProcessingEvent.NextCommand,
      undefined,
      theQueue[0],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      2,
      ProcessingEvent.CommandComplete,
      '1',
      theQueue[0],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      3,
      ProcessingEvent.NextCommand,
      '1',
      theQueue[1],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      4,
      ProcessingEvent.CommandComplete,
      '2',
      theQueue[1],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      5,
      ProcessingEvent.NextCommand,
      '2',
      theQueue[2],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      6,
      ProcessingEvent.CommandFailed,
      'error',
      '2',
      theQueue[2],
    );
  });

  it('iterates over the queue sequentially, stop on failures', async () => {
    const list: string[] = ['1', '2', '3'];
    const theQueue = list.map((el, i) =>
      el !== '2'
        ? lambda(el, (i + 1) * 250)
        : { execute: () => Promise.reject('Whooops') },
    );

    const response = executeSequential<string>(theQueue, {
      continueOnFailures: false,
      eventEmitter,
    });

    await expect(response).rejects.toMatch('Whooops');

    expect(eventEmitterSpy).toHaveBeenCalledTimes(4);
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      1,
      ProcessingEvent.NextCommand,
      undefined,
      theQueue[0],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      2,
      ProcessingEvent.CommandComplete,
      '1',
      theQueue[0],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      3,
      ProcessingEvent.NextCommand,
      '1',
      theQueue[1],
    );
    expect(eventEmitterSpy).toHaveBeenNthCalledWith(
      4,
      ProcessingEvent.CommandFailed,
      'Whooops',
      '1',
      theQueue[1],
    );
  });
});

import { asyncDequeue, dequeue } from "./dequeue";

describe('dequeue', () => {
  it ('iterates over a list and get its values', async () => {
    const promises: Promise<unknown>[] = [];
    const list = [1, 2, 3];
    const queue = list.map((item) => () => Promise.resolve(item));

    const iterator = dequeue(queue);

    const nextSpy = jest.spyOn(iterator, 'next');

    let command = iterator.next();

    while (!command.done) {
      promises.push(command.value());
      command = iterator.next();
    }

    expect(nextSpy).toHaveBeenCalledTimes(list.length + 1);
    expect(queue.length).toEqual(0);
    await expect(Promise.all(promises)).resolves.toEqual(list);
  });

  it ('asynchronously iterates over a list and get its values', async () => {
    const values: number[] = [];
    const list = [1, 2, 3];
    const queue = list.map((item) => () => Promise.resolve(item));

    const iterator = asyncDequeue(queue);

    const nextSpy = jest.spyOn(iterator, 'next');

    let command = await iterator.next();

    while (!command.done) {
      const value = await command.value();
      values.push(value);
      command = await iterator.next();
    }

    expect(nextSpy).toHaveBeenCalledTimes(list.length + 1);
    expect(queue.length).toEqual(0);
    expect(values).toEqual(list);
  });
});
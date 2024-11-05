import { executeSequential } from "./sequential";

jest.useFakeTimers({ advanceTimers: true });

const lambda =
  (name = "#", timeout = 1000) =>
  (): Promise<string> =>
    new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Inside lambda ${name}`);
        resolve(name);
      }, timeout);
    });

describe("sequential", () => {
  beforeAll(() => {
    jest.spyOn(global, "setTimeout");
    jest.spyOn(Promise, "resolve");
  });

  it("iterates over the queue sequentially, copy the queue", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i, arr) =>
      lambda(el, (arr.length - i) * 250),
    );
    const originalLength = theQueue.length;

    const response = await executeSequential<string>(theQueue);

    expect(response).toEqual(list);
    // calling one set time out for each element in the list
    expect(setTimeout).toHaveBeenCalledTimes(list.length);
    // Promise.resolve is called in a sequentially manner, defined by sequential function
    expect(Promise.resolve).toHaveBeenCalledTimes(list.length * 2);
    // Keeps the queue
    expect(theQueue.length).toBe(originalLength);
  });

  it("iterates over the queue sequentially, empty the queue", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) => lambda(el, (i + 1) * 250));

    const response = await executeSequential<string>(theQueue, {
      snapshot: false,
    });

    expect(response).toEqual(list);
    // calling one set time out for each element in the list
    expect(setTimeout).toHaveBeenCalledTimes(list.length);
    // Promise.resolve is called in a sequentially manner, defined by sequential function
    expect(Promise.resolve).toHaveBeenCalledTimes(list.length * 2);
    // empty the queue
    expect(theQueue.length).toBe(0);
  });

  it("iterates over the queue sequentially, continue on failures", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) =>
      el !== "2" ? lambda(el, (i + 1) * 250) : () => Promise.reject(),
    );

    const response = await executeSequential<string>(theQueue, {
      continueOnFailures: true,
    });

    expect(response).toEqual(["1", undefined, "3"]);
    // calling one set time out for each element in the list
    expect(setTimeout).toHaveBeenCalledTimes(list.length - 1);
    // Promise.resolve is called in a sequentially manner, defined by sequential function
    expect(Promise.resolve).toHaveBeenCalledTimes(list.length * 2);
  });

  it("iterates over the queue sequentially, stop on failures", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) =>
      el !== "2" ? lambda(el, (i + 1) * 250) : () => Promise.reject("Whooops"),
    );

    const response = executeSequential<string>(theQueue, {
      continueOnFailures: false,
    });

    await expect(response).rejects.toMatch("Whooops");
  });
});

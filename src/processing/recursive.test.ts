import { executeRecursive } from "./recursive";

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

/*
  based on the this particular test the recursive
  pattern is described as follows:
  f(0) = 0
  f(1) = f(0) + 2 = 2
  f(2) = f(1) + 3 = 5
  f(3) = f(2) + 3 = 8
  f(n) = f(n-1) + 3
*/
const recursiveFn = (n: number): number => (n > 1 ? recursiveFn(n - 1) + 3 : 2);

describe("recursive", () => {
  beforeAll(() => {
    jest.spyOn(global, "setTimeout");
    jest.spyOn(Promise, "resolve");
  });

  it("iterates over the queue recursively, copy the queue", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) =>
      lambda(el, (i + 1) * 250),
    );
    const originalLength = theQueue.length;

    const response = await executeRecursive<string>(theQueue);

    expect(response).toEqual(list[list.length - 1]);
    // calling one set time out for each element in the list
    expect(setTimeout).toHaveBeenCalledTimes(list.length);
    // Promise.resolve is called in a recursively manner, defined by recursive function
    expect(Promise.resolve).toHaveBeenCalledTimes(recursiveFn(list.length));
    // Keeps the queue
    expect(theQueue.length).toBe(originalLength);
  });

  it("iterates over the queue recursively, empty the queue", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) =>
      lambda(el, (i + 1) * 250),
    );

    jest.spyOn(global, "setTimeout");
    jest.spyOn(Promise, "resolve");

    const response = await executeRecursive<string>(theQueue, {
      snapshot: false,
    });

    expect(response).toEqual(list[list.length - 1]);
    // calling one set time out for each element in the list
    expect(setTimeout).toHaveBeenCalledTimes(list.length);
    // Promise.resolve is called in a recursively manner, defined by recursive function
    expect(Promise.resolve).toHaveBeenCalledTimes(recursiveFn(list.length));
    // empty the queue
    expect(theQueue.length).toBe(0);
  });

  it("iterates over the queue recursively, continue on failures", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) =>
      el !== "3" ? lambda(el, (i + 1) * 250) : () => Promise.reject(),
    );

    const response = await executeRecursive<string>(theQueue, {
      continueOnFailures: true,
    });

    expect(response).toEqual(undefined);
    // calling one set time out for each element in the list
    expect(setTimeout).toHaveBeenCalledTimes(list.length - 1);
    // Promise.resolve is called in a recursively manner, defined by recursive function
    expect(Promise.resolve).toHaveBeenCalledTimes(recursiveFn(list.length));
  });

  it("iterates over the queue recursively, stop on failures", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) =>
      el !== "2" ? lambda(el, (i + 1) * 250) : () => Promise.reject("Whooops"),
    );

    const response = executeRecursive<string>(theQueue, {
      continueOnFailures: false,
    });

    await expect(response).rejects.toMatch("Whooops");
  });
});

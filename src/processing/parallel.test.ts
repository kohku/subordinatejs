import { executeParallel } from "./parallel";

jest.useFakeTimers({ advanceTimers: true });

const lambda =
  (name = "#", timeout = 1000) =>
  (): Promise<string> =>
    new Promise((resolve) => {
      setTimeout(() => {
        // console.log(`Inside lambda ${name}`);
        resolve(name);
      }, timeout);
    });

describe("parallel", () => {
  beforeAll(() => {
    jest.spyOn(global, "setTimeout");
    jest.spyOn(Promise, "resolve");
  });

  it("iterates over the queue in parallel, copy the queue", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) =>
      lambda(el, (i + 1) * 250),
    );
    const originalLength = theQueue.length;

    const response = await executeParallel(theQueue);

    expect(response).toEqual(list);
    // calling one set time out for each element in the list
    expect(setTimeout).toHaveBeenCalledTimes(list.length);
    // Promise.resolve is called in a in parallel manner, defined by recursive function
    expect(Promise.resolve).toHaveBeenCalledTimes(list.length * 2);
    // Keeps the queue
    expect(theQueue.length).toBe(originalLength);
  });

  it("iterates over the queue in parallel, empty the queue", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) =>
      lambda(el, (i + 1) * 250),
    );

    const response = await executeParallel(theQueue, {
      snapshot: false,
    });

    expect(response).toEqual(list);
    // calling one set time out for each element in the list
    expect(setTimeout).toHaveBeenCalledTimes(list.length);
    // Promise.resolve is called in a in parallel manner, defined by recursive function
    expect(Promise.resolve).toHaveBeenCalledTimes(list.length * 2);
    // empty the queue
    expect(theQueue.length).toBe(0);
  });

  it("iterates over the queue in parallel, continue on failures", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) =>
      el !== "2" ? lambda(el, (i + 1) * 250) : () => Promise.reject(),
    );

    const response = await executeParallel(theQueue, {
      continueOnFailures: true,
    });

    expect(response).toEqual(["1", undefined, "3"]);
    // calling one set time out for each element in the list
    expect(setTimeout).toHaveBeenCalledTimes(list.length - 1);
    // Promise.resolve is called in a in parallel manner, defined by recursive function
    expect(Promise.resolve).toHaveBeenCalledTimes(list.length * 2);
  });

  it("iterates over the queue in parallel, stop on failures", async () => {
    const list: string[] = ["1", "2", "3"];
    const theQueue = list.map((el, i) =>
      el !== "2" ? lambda(el, (i + 1) * 250) : () => Promise.reject("Whooops"),
    );

    const response = executeParallel(theQueue, {
      continueOnFailures: false,
    });

    await expect(response).rejects.toMatch("Whooops");
  });
});

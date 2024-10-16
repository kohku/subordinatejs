import { promiseWhile } from "./promise-while";

describe('promiseWhile', () => {
  it ('iterates on promise array', async () => {
    const values: Array<number> = [];
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
    ];

    const response = await promiseWhile(
      () => Promise.resolve(promises.length === 0),
      async () => {
        const next = promises.shift();
        if (next) { 
          const value = await next;
          values.push(value);
        }
      }
    ).then(() => values);

    expect(response.length).toEqual(2);
    expect(response).toContain(1);
    expect(response).toContain(2);
  });

  it ('iterates on lambda array', async () => {
    const values: Array<number> = [];
    const lambdas = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
    ];

    const response = await promiseWhile(
      () => Promise.resolve(lambdas.length === 0),
      async () => {
        const next = lambdas.shift();
        if (next) { 
          const value = await next();
          values.push(value);
        }
      }
    ).then(() => values);

    expect(response.length).toEqual(2);
    expect(response).toContain(1);
    expect(response).toContain(2);
  });

  it ('exits the loop if one of the steps is a rejected promise', async () => {
    const values: Array<number> = [];
    const lambdas = [
      () => Promise.reject('Whooops'),
      () => Promise.resolve(2),
    ];

    const loop = promiseWhile(
      () => Promise.resolve(lambdas.length === 0),
      async () => {
        const next = lambdas.shift();
        if (next) { 
          const value = await next();
          values.push(value);
        }
      }
    );

    await expect(loop).rejects.toMatch('Whooops');
  });

  it ('exits the loop if condition fails', async () => {
    const values: Array<number> = [];
    const lambdas = [
      () =>  Promise.reject('Whooops'),
      () => Promise.resolve(2),
    ];

    const loop = promiseWhile(
      () => Promise.reject("Whooops"),
      async () => {
        const next = lambdas.shift();
        if (next) { 
          const value = await next();
          values.push(value);
        }
      }
    );

    await expect(loop).rejects.toMatch('Whooops');
  });
});
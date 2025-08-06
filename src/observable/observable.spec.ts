import Observable from './observable';

describe('observable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('can instantiate a observable', () => {
    const observable = new Observable();
    expect(observable).toBeDefined();
    expect(observable).toBeInstanceOf(Observable);
  });

  it('emits', () => {
    const eventName = 'event1';
    const detail = 'detail';
    const observable = new Observable();

    const obs = observable.emit(eventName, detail);

    expect(obs).toEqual(observable);
  });

  it('emits event to registered listeners', () => {
    const eventName = 'event1';
    const detail = 'detail';
    const observable = new Observable();

    const listener = jest.fn();
    const listener2 = jest.fn();

    observable.subscribe(eventName, listener);
    observable.subscribe(eventName, listener2);
    observable.emit(eventName, detail);

    expect(listener).toHaveBeenCalledWith(detail);
    expect(listener2).toHaveBeenCalledWith(detail);
  });

  it("doesn't emit events to unregistered listeners", () => {
    const eventName = 'event1';
    const detail = 'detail';
    const observable = new Observable();

    const listener = jest.fn();

    observable.subscribe(eventName, listener);
    observable.unsubscribe(eventName, listener);

    observable.emit(eventName, detail);

    expect(listener).not.toHaveBeenCalled();
  });

  it('does nothing if unsubscribed not subscribed listeners', () => {
    const eventName = 'event1';
    const observable = new Observable();

    const listener = jest.fn();

    observable.unsubscribe(eventName, listener);
  });

  it('unsubscribe listeners for an event', () => {
    const eventName = 'event1';
    const detail = 'detail';
    const observable = new Observable();

    const listener = jest.fn();

    observable.subscribe(eventName, listener);
    observable.unsubscribe(eventName);

    observable.emit(eventName, detail);
    expect(listener).not.toHaveBeenCalled();
  });

  it('unsubscribe all listeners', () => {
    const eventName = 'event1';
    const detail = 'detail';
    const observable = new Observable();

    const listener = jest.fn();

    observable.subscribe(eventName, listener);
    observable.unsubscribe();

    observable.emit(eventName, detail);
    expect(listener).not.toHaveBeenCalled();
  });
});

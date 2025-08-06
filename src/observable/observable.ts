import { Callback } from 'processing/types';

interface DinamycEvent {
  [key: string]: Array<Callback>;
}

class Observable {
  private callbacks?: DinamycEvent;

  subscribe(event: string, fn: Callback): this {
    this.callbacks = this.callbacks ?? {};
    this.callbacks[event] = this.callbacks[event] ?? [];
    if (this.callbacks[event].indexOf(fn) < 0) {
      this.callbacks[event].push(fn);
    }
    return this;
  }

  unsubscribe(event?: string, fn?: Callback): this {
    this.callbacks = this.callbacks ?? {};

    // all
    if (!event) {
      this.callbacks = {};
      return this;
    }

    // specific event
    const callbacks = this.callbacks[event];
    if (!callbacks) {
      return this;
    }

    // remove all handlers
    if (!fn) {
      delete this.callbacks[event];
      return this;
    }

    // remove specific handler
    let cb;
    for (let i = 0; i < callbacks.length; i += 1) {
      cb = callbacks[i];
      if (cb === fn) {
        delete callbacks[i];
        callbacks.splice(i, 1);
        break;
      }
    }

    return this;
  }

  emit(event: string, ...args: unknown[]): this {
    this.callbacks = this.callbacks || {};
    let callbacks = this.callbacks[event];

    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (let i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i].apply(this, args);
      }
    }

    return this;
  }
}

export default Observable;

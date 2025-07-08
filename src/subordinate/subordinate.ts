import Observable from "observable/observable";
import { executeRecursive } from "processing/index";
import { Callback, ChainedCommandable, Commandable, ProcessingOptions, Task } from "processing/types";
import { ProcessingEvent } from "../processing/events";
import CommandWrapper from "./command-wrapper";

class Subordinate<Subject> {
  private eventEmitter = new Observable();
  private commandChain: Array<ChainedCommandable> = [];
  private commandStack: Array<ChainedCommandable> = [];
  private executor = executeRecursive;

  constructor(private subject?: Subject) {}

  addCommand(command: Task): this {
    const cmd = new CommandWrapper(command);
    this.commandChain.push(cmd);
    return this;
  }

  addTask(task: Array<Task>): this {
    if (Array.isArray(task)) {
      task.forEach((command) => this.addCommand(command));
    }
    return this;
  }

  removeTask(): this {
    return this;
  }

  subscribe(event: string, fn: Callback): this {
    this.eventEmitter.subscribe(event, fn);
    return this;
  }
  
  unsubscribe(event?: string, fn?: Callback): this {
    this.eventEmitter.unsubscribe(event, fn);
    return this;
  }

  async execute<T = void>(
    initialValue?: T,
    options?: Partial<ProcessingOptions>,
  ): Promise<T | undefined> {
    this.eventEmitter.emit(ProcessingEvent.Start);
    try {
      const value = await this.executor<T, Subject>(
        this.commandChain,
        {
          ...options,
          eventEmitter: this.eventEmitter,
        },
        initialValue,
        this.subject,
      );
      return value;
    }
    catch (error) {
      this.eventEmitter.emit(ProcessingEvent.Failed, error);
      throw error;
    }
    finally {
      this.eventEmitter.emit(ProcessingEvent.Complete);
    }
  }

  canUndo() {}

  undo(): this {
    return this;
  }
}

export default Subordinate;

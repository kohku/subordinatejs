import Observable from "observable/observable";
import { executeRecursive } from "processing/index";
import { ChainedCommandable, ProcessingOptions, Task } from "processing/types";
import { ProcessingEvent } from "../processing/events";
import CommandWrapper from "./command-wrapper";

class Subordinate<Subject> extends Observable {
  private commandChain: Array<ChainedCommandable> = [];
  private executor = executeRecursive

  constructor(private subject?: Subject) {
    super();
  }

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

  async execute<T = void>(
    initialValue?: T,
    options?: Partial<ProcessingOptions>,
  ): Promise<T | undefined> {
    this.emit(ProcessingEvent.Start);
    try {
      const value = await this.executor<T, Subject>(
        this.commandChain,
        {
          ...options,
          eventEmitter: this,
        },
        initialValue,
        this.subject,
      );
      return value;
    }
    catch (error) {
      this.emit(ProcessingEvent.Failed, error);
      throw error;
    }
    finally {
      this.emit(ProcessingEvent.Complete);
    }
  }

  canUndo() {}

  undo(): this {
    return this;
  }
}

export default Subordinate;

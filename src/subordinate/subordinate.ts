import Observable from "observable/observable";
import { executeRecursive } from "processing/index";
import { ProcessingOptions, Task } from "processing/types";
import { ProcessingEvent } from "../processing/events";

class Subordinate<Subject> extends Observable {
  private commandChain: Array<Task> = [];
  private executor = executeRecursive

  constructor(private subject?: Subject) {
    super();
  }

  addCommand(command: Task): this {
    this.commandChain.push(command);
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
    options?: Partial<Omit<ProcessingOptions, "eventEmitter">>,
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import Observable from "observable/observable";
import { executeRecursive } from "processing/recursive";
import { ProcessingOptions, Task } from "processing/types";

class Subordinate<Subject> extends Observable {
  private commandChain: Array<Task> = [];

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
    options?: Partial<ProcessingOptions>,
  ): Promise<T | undefined> {
    const value = await executeRecursive<T, Subject>(
      this.commandChain,
      options,
      initialValue,
      this.subject,
    );

    return value;
  }

  canUndo() {}

  undo(): this {
    return this;
  }
}

export default Subordinate;

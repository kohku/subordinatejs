/* eslint-disable @typescript-eslint/no-explicit-any */
import Observable from "observable/observable";
import { executeRecursive } from "processing/recursive";
import { ProcessingOptions, TaskCommand } from "processing/types";

class Subordinate extends Observable {
  private commandChain: Array<TaskCommand> = [];

  constructor(private initiator?: any) {
    super();
  }

  addTask(command: TaskCommand): this {
    this.commandChain.push(command);
    return this;
  }

  removeTask(): this {
    return this;
  }

  async execute<R>(
    initialState: unknown,
    options?: Partial<ProcessingOptions>,
  ): Promise<R | undefined> {
    const value = await executeRecursive<R>(
      this.commandChain,
      options,
      initialState,
      this.initiator,
    );

    return value;
  }

  canUndo() {}

  undo(): this {
    return this;
  }
}

export default Subordinate;

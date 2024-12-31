import { Task } from "processing/types";
import UndoableCommand from "./undoable-command";

class CommandWrapper extends UndoableCommand {
  constructor(
    private task: Task,
    private undoTask?: () => void,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute<Subject = unknown, State = unknown, Return = void>(args: {
    subject: Subject;
    state: State;
  }): Promise<Return> | Return {
    return this.task(args);
  }

  get canUndo(): boolean {
    return !!this.undoTask;
  }

  undo(): void {
    if (this.canUndo) {
      this.undoTask?.();
    }
  }
}

export default CommandWrapper;

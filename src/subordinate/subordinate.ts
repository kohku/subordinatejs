import Observable from "observable/observable";
import { Command } from "types/processing";


class Subordinate extends Observable {

  private commandChain: Array<Command> = [];
  private commandStack: Array<Command> = [];
  private redoStack: Array<Command> = [];

  enqueue<T = unknown>(command: Command<T>, undo?: Command<T>) {

  }

  dequeue() {

  }

  execute() {

  }

  canUndo() {

  }

  undo() {

  }
}

export default Subordinate;
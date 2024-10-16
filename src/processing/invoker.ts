import { Command } from "types/processing";

class Invoker {

  private commandChain: Array<Command> = [];
  private commandStack: Array<Command> = [];

  enqueue(command: Command, undoCommand?: Command) {
    this.commandChain.push(command);
  }

  dequeue(command: Command) {
    const index = this.commandChain.lastIndexOf(command);

    if (index >= 0) {
      this.commandChain.splice(index, 1);
    }
  }
  
  apply(command: Command) {

  }

  clear() {

  }

  canUndo() {

  }

  undo() {

  }

  undoAll() {

  }

  findLastAction(command: Command) {
    return this.commandStack.slice().reverse().find(command);
  }

  findActions(command: Command){
    return this.commandStack.filter(command);
  }
}

export default Invoker;

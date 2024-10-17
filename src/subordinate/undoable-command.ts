import CommandClass from "./command";

class UndoableCommand extends CommandClass {
  get canUndo() {
    return true;
  }

  undo() {}
}

export default UndoableCommand;
import CommandClass from './command';

class UndoableCommand extends CommandClass {
  get canUndo() {
    return false;
  }

  undo() {}
}

export default UndoableCommand;

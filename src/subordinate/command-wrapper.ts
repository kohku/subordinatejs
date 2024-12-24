// import { Command } from "types/processing";
// import UndoableCommand from "./undoable-command";
// import Subordinate from "./subordinate";

// class CommandWrapper extends UndoableCommand {
//   private executeWrapper: Command | ((args: unknown[]) => void);
//   private undoWrapper?: Command | (() => void);
//   // private validateWrapper: (actionsPerformed: Command[], actionsToPerform: Command[]) => void;

//   constructor({
//     subject,
//     execute,
//     undo,
//     // validate,
//   }: {
//     subject: Subordinate;
//     execute: Command | (() => void);
//     undo?: Command | (() => void);
//     // validate: (actionsPerformed: Command[], actionsToPerform: Command[]) => void;
//   }) {
//     super(subject);
//     this.executeWrapper =
//       typeof execute === "function" ? execute : super.execute;
//     this.undoWrapper = typeof undo === "function" ? undo : undefined;
//     // this.validateWrapper = typeof validate === 'function' ? validate : super.validate;
//   }

//   override execute<T>(...args: unknown[]): Promise<T> | T | void {
//     this.executeWrapper(args);
//   }

//   // override validate() {

//   // }

//   override get canUndo() {
//     return this.undoWrapper !== undefined;
//   }

//   override undo() {
//     if (this.canUndo) {
//       this.undoWrapper?.();
//     }
//   }
// }

// export default CommandWrapper;

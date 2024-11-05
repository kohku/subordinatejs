import Subordinate from "./subordinate";

class CommandClass {
  initiator?: Subordinate;

  constructor(initiator?: Subordinate) {
    this.initiator = initiator;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute<T = unknown>(...args: unknown[]): Promise<T> | T | void {}

  emit(message: string) {
    this.initiator?.broadcast(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(
    actionsPerformed: CommandClass[],
    actionsToPerform: CommandClass[],
  ) {}
}

export default CommandClass;

import { Commandable } from "processing/types";

class CommandClass implements Commandable {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute<Subject, State , Return>(_: {
    subject: Subject;
    state: State;
  }): Promise<Return> | Return {
    throw new Error("Method not implemented.");
  }
}

export default CommandClass;

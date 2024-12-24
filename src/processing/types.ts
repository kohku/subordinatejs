/* eslint-disable @typescript-eslint/no-explicit-any */
// import CommandClass from "src/subordinate/command";
// import CommandWrapper from "src/subordinate/command-wrapper";

export type Condition = (...args: unknown[]) => Promise<boolean>;

type CommandArgs<Subject, State> = {
  subject: Subject,
  state: State,
}

export type Command<Subject, State, Return> = ({
  subject,
  state,
}: CommandArgs<Subject, State>) => Promise<Return> | Return;

// For simplicity
export type Task = Command<any, any, any>;

// Retains the state between commands
export type ActionCommand<Subject, State, Return = void> = Command<Subject, State, Return>;

// Does not retain the state between commands
export type StatelessCommand<Subject, Return = void> = Command<Subject, void, Return>;

// Does not care about the subject
export type AnonynousCommand<State, Return = void> = Command<void, State, Return>

// Allow us to chain commands, without paying attention to subject and state
export type ChainedCommand<Return = void> = Command<any, any, Return>;

// Only cares about the return value
export type LambdaCommand<Return = void> = Command<void, void, Return>;

export type ProcessingOptions = {
  snapshot?: boolean;
  continueOnFailures?: boolean;
};

export type Commandable<Subject, State, Return> = Command<
  State,
  Return,
  Subject
>; //| CommandClass | CommandWrapper;

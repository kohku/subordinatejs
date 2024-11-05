/* eslint-disable @typescript-eslint/no-explicit-any */
// import CommandClass from "src/subordinate/command";
// import CommandWrapper from "src/subordinate/command-wrapper";

export type Condition = (...args: unknown[]) => Promise<boolean>;

export type Command<State, Return, Initiator = void> = (
  state: State,
  initiator: Initiator,
) => Promise<Return> | Return;

export type TaskCommand = Command<any, any, any>;

export type ChainedCommand<Return> = Command<any, Return, any>;

export type StatelessCommand = (
  initiator: unknown,
) => Promise<unknown> | unknown;

export type ProcessingOptions = {
  snapshot?: boolean;
  continueOnFailures?: boolean;
};

export type Commandable<State, Return, Initiator> = Command<
  State,
  Return,
  Initiator
>; //| CommandClass | CommandWrapper;

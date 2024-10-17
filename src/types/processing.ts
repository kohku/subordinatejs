export type Condition = () => Promise<boolean>

export type Command<T = unknown> = () => Promise<T>;

export type ProcessingOptions = {
  snapshot: boolean;
  continueOnFailures: boolean;
};

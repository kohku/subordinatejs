export type Condition = () => Promise<boolean>

export type Command = () => Promise<unknown>

export type GenericCommand<T> = () => Promise<T>

export type ProcessingOptions = {
  snapshot: boolean;
  continueOnFailures: boolean;
};

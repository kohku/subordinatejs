import { Command } from "../processing/types";
import Subordinate from "./subordinate";

describe("Subordinate", () => {
  it("can be instantiated", () => {
    const subordinate = new Subordinate();
    expect(subordinate).toBeInstanceOf(Subordinate);
  });

  it("can add tasks and execute", async () => {
    const multiply: Command<number, number, number> = (
      input: number,
      initiator: number,
    ): number => {
      return initiator * input;
    };

    const subordinate = new Subordinate(2);
    subordinate.addTask(multiply);

    const result = await subordinate.execute<number>(2);

    expect(typeof result).toBe('number');
    expect(result).toEqual(4)
  });
});

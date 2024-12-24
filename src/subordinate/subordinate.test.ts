import { ActionCommand, AnonynousCommand, StatelessCommand } from "../processing/types";
import Subordinate from "./subordinate";

describe("Subordinate", () => {
  it("can be instantiated", () => {
    const subordinate = new Subordinate();
    expect(subordinate).toBeInstanceOf(Subordinate);
  });

  it ("can add and execute tasks over a subject", async () => {
    type Subject = {
      background: string;
      color: string;
    };
    const subject: Subject = {
      background: 'white',
      color: 'black',
    };

    // Commands does know about previous commands
    const changeBackground = (color: string): StatelessCommand<Subject> => ({ subject }) => {
      subject.background = color;
    };

    // Commands does know about previous commands
    const changeColor = (color: string): StatelessCommand<Subject> => ({ subject }) => {
      subject.color = color;
    };

    const subordinate = new Subordinate(subject);
    subordinate.addTask([
      changeBackground('red'),
      changeColor('white'),
    ]);
    await subordinate.execute();

    expect(subject.background).toEqual('red');
    expect(subject.color).toEqual('white');
  });

  it("can add and execute tasks over a subject having a state between steps", async () => {
    type Shape = {
      width: number;
      height: number;
      color: string;
    }
    const square: Shape = { width: 10, height: 10, color: 'white'};

    const subordinate = new Subordinate(square);

    const grow: StatelessCommand<Shape, string> = ({ subject }) => {
      subject.width += 10;
      subject.height += 10;
      return subject.color;
    };

    const makeRedIfWhite: ActionCommand<Shape, string> = ({ subject, state }) => {
      if (state === 'white') {
        subject.color = 'red';
      }
    };

    subordinate.addTask([grow, makeRedIfWhite]);

    await subordinate.execute();
    expect(square.color).toEqual('red');
  });

  it ('can execute several anonymous steps passing state between them', async () => {
    const step: AnonynousCommand<number, number> = ({ state }) => {
      return state + 1;
    };
    const task = Array.from({ length: 10 }, () => step);

    const subordinate = new Subordinate();

    subordinate.addTask(task);

    const result = await subordinate.execute(0);

    expect(result).toEqual(10);
  });

  it ('can calculate the fibonacci sequence', async () => {
    const fibonacciStep: ActionCommand<{ value: number }, number[], number[]> = ({
      subject, state
    }) => {
      if (!Array.isArray(state)) {
        subject.value = 1;
        return [0, 1];
      }
      const current = state.length ? state[state.length - 1] : 1;
      const value = subject.value;
      state.push(value);
      subject.value = current + value;
      return state;
    };

    const subordinate = new Subordinate({ value: 0 });

    const task = Array.from({ length: 10 }, () => fibonacciStep);

    subordinate.addTask(task);

    const result = await subordinate.execute();

    expect(result).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
  });
});

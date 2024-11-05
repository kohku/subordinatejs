import {
  executeParallel,
  executeRecursive,
  executeSequential,
} from "./processing";
import { PerformanceMeter } from "./utils";

const lambda =
  (name = "#", timeout = 1000) =>
  (): Promise<string> =>
    new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Inside lambda ${name}`);
        resolve(name);
      }, timeout);
    });

const main = async () => {
  let response, seconds;
  const theQueue = [lambda("1", 1000), lambda("2", 3000), lambda("3", 1500)];

  const meter = new PerformanceMeter();

  meter.start();
  response = await executeRecursive(theQueue);
  seconds = meter.stop();
  console.log(`recursive: process completed ${seconds} seconds`);
  console.log("recursive response: ", response);

  meter.start();
  response = await executeParallel(theQueue);
  seconds = meter.stop();
  console.log(`parallel: process completed ${seconds} seconds`);
  console.log("parallel results: ", response);

  meter.start();
  response = await executeSequential(theQueue);
  seconds = meter.stop();
  console.log(`sequential: process completed ${seconds} seconds`);
  console.log("sequential results: ", response);
};

main();

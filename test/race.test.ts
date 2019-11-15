import * as async from "../lib";
import sleep from "./support/sleep";

describe("race", () => {
  it("should call each function in parallel and callback with first result", () => {
    let finished = 0;
    const tasks = [];

    const eachTest = i => async () => {
      await sleep(i * 10);
      finished++;
      return i;
    };

    for (let i = 0; i < 10; i++) {
      tasks[i] = eachTest(i);
    }

    return async.race(tasks).then(result => {
      expect(result).toEqual(0);
      expect(finished).toEqual(1);
      return sleep(120).then(() => {
        expect(finished).toEqual(10);
      });
    });
  });
  it("should callback with the first error", () => {
    const tasks = [];

    const eachTest = i => async next => {
      await sleep(100 - i * 15);
      throw new Error(`ERR${i}`);
    };

    for (let i = 0; i <= 5; i++) {
      tasks[i] = eachTest(i);
    }

    return async
      .race(tasks)
      .catch(err => err)
      .then(err => {
        expect(err).toBeTruthy();
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("ERR5");
      });
  });
  it("should callback when task is empty", () => {
    return async.race([]).then(result => {
      expect(typeof result).toEqual("undefined");
    });
  });
  it("should callback in error the task arg is not an Array", () => {
    const errors = [];

    const prom1 = async.race(null).catch(err => err);
    const prom2 = async.race({}).catch(err => err);

    return Promise.all([prom1, prom2]).then(errors => {
      expect(errors).toHaveLength(2);
      expect(errors[0]).toBeInstanceOf(TypeError);
      expect(errors[1]).toBeInstanceOf(TypeError);
    });
  });
});

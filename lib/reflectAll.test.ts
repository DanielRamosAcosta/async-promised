import * as async from ".";
import sleep from "./support/sleep";

describe("reflectAll", () => {
  it("with an object", () => {
    const tasks = {
      one: async () => {
        await sleep(200);
        return "one";
      },
      two: async () => {
        throw new Error("error");
      },
      three: async () => {
        await sleep(100);
        return "three";
      }
    };

    const reflectedFns = async.reflectAll(tasks);

    return async.auto(reflectedFns).then(results => {
      expect(results).toEqual({
        one: { value: "one" },
        two: { error: new Error("error") },
        three: { value: "three" }
      });
    });
  });

  it("with an array", () => {
    const tasks = [
      async () => {
        await sleep(200);
        return "one";
      },
      async () => {
        throw new Error("two");
      },
      async () => {
        await sleep(100);
        return "three";
      }
    ];

    const reflectedFns = async.reflectAll(tasks);

    return async.auto(reflectedFns).then(results => {
      expect(results).toEqual({
        0: { value: "one" },
        1: { error: new Error("two") },
        2: { value: "three" }
      });
    });
  });
});

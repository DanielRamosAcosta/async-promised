import * as async from "../lib";
import sleep from "./support/sleep";

describe("mapValues", () => {
  const obj = { a: 1, b: 2, c: 3 };

  describe("mapValuesLimit", () => {
    it("basics", () => {
      let running = 0;
      const concurrency = {
        a: 2,
        b: 2,
        c: 1
      };

      return async
        .mapValuesLimit(obj, 2, async (val, key) => {
          running++;
          await sleep(val * 15);
          expect(running).toEqual(concurrency[key]);
          running--;
          return key + val;
        })
        .then(result => {
          expect(running).toEqual(0);
          expect(result).toEqual({ a: "a1", b: "b2", c: "c3" });
        });
    });

    it("error", () => {
      return async
        .mapValuesLimit(obj, 1, async (val, key) => {
          if (key === "b") {
            throw new Error("fail");
          }
          return val;
        })
        .catch(err => err)
        .then(err => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toEqual("fail");
        });
    });
  });

  describe("mapValues", () => {
    it("basics", () => {
      let running = 0;
      const concurrency = {
        a: 3,
        b: 2,
        c: 1
      };

      return async
        .mapValues(obj, async (val, key) => {
          running++;
          await async.setImmediate("");
          expect(running).toEqual(concurrency[key]);
          running--;
          return key + val;
        })
        .then(result => {
          expect(running).toEqual(0);
          expect(result).toEqual({ a: "a1", b: "b2", c: "c3" });
        });
    });
  });

  describe("mapValuesSeries", () => {
    it("basics", () => {
      let running = 0;
      const concurrency = {
        a: 1,
        b: 1,
        c: 1
      };
      return async
        .mapValuesSeries(obj, async (val, key) => {
          running++;
          await async.setImmediate("");
          expect(running).toEqual(concurrency[key]);
          running--;
          return key + val;
        })
        .then(result => {
          expect(running).toEqual(0);
          expect(result).toEqual({ a: "a1", b: "b2", c: "c3" });
        });
    });
  });
});

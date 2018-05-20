import * as assert from "assert";
import * as async from "../lib";

describe("tryEach", () => {
  it("no callback", () => {
    return async.tryEach([]);
  });
  it("empty", () => {
    return async.tryEach([]).then(results => {
      expect(results).toEqual(undefined);
    });
  });

  // Removed "one task, multiple results". A promise can't return multiple values
  // https://github.com/caolan/async/blob/master/mocha_test/tryEach.js#L16

  it("one task", () => {
    const RESULT = "something";
    return async.tryEach([async () => RESULT]).then(results => {
      expect(results).toEqual(RESULT);
    });
  });
  it("two tasks, one failing", () => {
    const RESULT = "something";
    async
      .tryEach([
        async () => {
          throw new Error("Failure");
        },
        async () => {
          return RESULT;
        }
      ])
      .then(results => {
        expect(results).toEqual(RESULT);
      });
  });
  it("two tasks, both failing", () => {
    const ERROR_RESULT = new Error("Failure2");
    return async
      .tryEach([
        async () => {
          throw new Error("Should not stop here");
        },
        async () => {
          return ERROR_RESULT;
        }
      ])
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(ERROR_RESULT);
      });
  });
  it("two tasks, non failing", () => {
    const RESULT = "something";
    return async
      .tryEach([
        async () => {
          return RESULT;
        },
        async () => {
          assert.fail("Should not been called");
          return 1;
        }
      ])
      .then(results => {
        expect(results).toEqual(RESULT);
      });
  });
});

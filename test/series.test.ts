import assert from "assert";
import * as async from "../lib";
import { getFunctionsObjectPromised } from "./support/get-function-object";
import sleep from "./support/sleep";

describe("series", () => {
  it("series", () => {
    const callOrder = [];
    return async
      .series([
        async () => {
          await sleep(25);
          callOrder.push(1);
          return 1;
        },
        async () => {
          await sleep(50);
          callOrder.push(2);
          return 2;
        },
        async () => {
          await sleep(15);
          callOrder.push(3);
          return 3;
        }
      ])
      .then(results => {
        expect(results).toEqual([1, 2, 3]);
        expect(callOrder).toEqual([1, 2, 3]);
      });
  });

  it("with reflect", () => {
    const callOrder = [];
    async
      .series([
        async.reflect(async () => {
          await sleep(25);
          callOrder.push(1);
          return 1;
        }),
        async.reflect(async () => {
          await sleep(50);
          callOrder.push(2);
          return 2;
        }),
        async.reflect(async () => {
          await sleep(15);
          callOrder.push(3);
          return 3;
        })
      ])
      .then(results => {
        expect(results).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
        expect(callOrder).toEqual([1, 2, 3]);
      });
  });

  it("empty array", () => {
    async.series([]).then(results => {
      expect(results).toEqual([]);
    });
  });

  it("error", () => {
    return async
      .series([
        async () => {
          throw new Error("fail");
        },
        async () => {
          assert(false, "should not be called");
        }
      ])
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(new Error("fail"));
      });
  });

  it("error with reflect", () => {
    return async
      .series([
        async.reflect(async () => {
          throw new Error("fail1");
        }),
        async.reflect(async () => {
          throw new Error("fail2");
        }),
        async.reflect(async () => {
          return 1;
        })
      ])
      .then(results => {
        expect(results).toEqual([
          { error: new Error("fail1") },
          { error: new Error("fail2") },
          { value: 1 }
        ]);
      });
  });

  // Removed 'no callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/mocha_test/series.js#L118

  it("object", () => {
    const callOrder = [];
    return async.series(getFunctionsObjectPromised(callOrder)).then(results => {
      expect(results).toEqual({
        one: 1,
        three: 3,
        two: 2
      });
      expect(callOrder).toEqual([1, 2, 3]);
    });
  });

  it("call in another context @nycinvalid @nodeonly", done => {
    const vm = require("vm");
    const sandbox = {
      async,
      done
    };

    const testFunc = () => {
      async
        .series([
          () => {
            return Promise.resolve(0);
          }
        ])
        .then(() => {
          done();
        });
    };

    vm.runInNewContext(`(${testFunc})()`, sandbox);
  });

  // Issue 10 on github: https://github.com/caolan/async/issues#issue/10
  xit("falsy return values", () => {
    async function taskFalse() {
      return false;
    }
    async function taskUndefined() {
      return undefined;
    }
    async function taskEmpty() {}
    async function taskNull() {
      return null;
    }

    return async
      .series([taskFalse, taskUndefined, taskEmpty, taskNull])
      .then(results => {
        expect(results).toHaveLength(4);
        expect(results[0]).toEqual(false);
        expect(results[1]).toEqual(undefined);
        expect(results[2]).toEqual(undefined);
        expect(results[3]).toEqual(null);
      });
  });
});

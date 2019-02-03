import assert from "assert";
import vm from "vm";
import * as pasync from "../lib";
import { getFunctionsObjectPromised } from "./support/get-function-object";
import sleep from "./support/sleep";

describe("parallel", () => {
  it("parallel", () => {
    const callOrder: number[] = [];

    return pasync
      .parallel([
        async () => {
          await sleep(50);
          callOrder.push(1);
          return 1;
        },
        async () => {
          await sleep(100);
          callOrder.push(2);
          return 2;
        },
        async () => {
          await sleep(25);
          callOrder.push(3);
          return 3;
        }
      ])
      .then(results => {
        expect(callOrder).toEqual([3, 1, 2]);
        expect(results).toEqual([1, 2, 3]);
      });
  });

  it("parallel empty array", () => {
    return pasync.parallel([]).then(results => {
      expect(results).toEqual([]);
    });
  });

  it("parallel error", () => {
    return pasync
      .parallel([
        async () => {
          throw new Error("error");
        },
        async () => {
          throw new Error("error2");
        }
      ])
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(new Error("error"));
      });
  });

  // Removed 'parallel no callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/test/parallel.js#L82

  it("parallel object", () => {
    const callOrder: number[] = [];

    return pasync
      .parallel(getFunctionsObjectPromised(callOrder))
      .then(results => {
        expect(callOrder).toEqual([3, 1, 2]);
        expect(results).toEqual({
          one: 1,
          two: 2,
          three: 3
        });
      });
  });

  // Issue 10 on github: https://github.com/caolan/async/issues#issue/10
  it("paralel falsy return values", () => {
    async function taskFalse() {
      await sleep(10);
      return false;
    }
    async function taskUndefined() {
      await sleep(10);
      return undefined;
    }
    async function taskEmpty() {
      await sleep(10);
    }
    async function taskNull() {
      await sleep(10);
      return null;
    }

    return pasync
      .parallel([taskFalse, taskUndefined, taskEmpty, taskNull])
      .then(results => {
        expect(results.length).toEqual(4);
        assert.strictEqual(results[0], false);
        assert.strictEqual(results[1], undefined);
        assert.strictEqual(results[2], undefined);
        assert.strictEqual(results[3], null);
      });
  });

  it("parallel limit", () => {
    const callOrder: number[] = [];
    return pasync
      .parallelLimit(
        [
          async () => {
            await sleep(50);
            callOrder.push(1);
            return 1;
          },
          async () => {
            await sleep(100);
            callOrder.push(2);
            return 2;
          },
          async () => {
            await sleep(25);
            callOrder.push(3);
            return 3;
          }
        ],
        2
      )
      .then(results => {
        expect(callOrder).toEqual([1, 3, 2]);
        expect(results).toEqual([1, 2, 3]);
      });
  });

  it("parallel limit empty array", () => {
    return pasync.parallelLimit([], 2).then(results => {
      expect(results).toEqual([]);
    });
  });

  it("parallel limit error", () => {
    return pasync
      .parallelLimit(
        [
          async () => {
            throw new Error("error");
          },
          async () => {
            throw new Error("error2");
          }
        ],
        1
      )
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(new Error("error"));
      });
  });

  // Removed 'parallel no callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/test/parallel.js#L194

  it("parallel limit object", () => {
    const callOrder: number[] = [];
    return pasync
      .parallelLimit(getFunctionsObjectPromised(callOrder), 2)
      .then(results => {
        expect(callOrder).toEqual([1, 3, 2]);
        expect(results).toEqual({
          one: 1,
          two: 2,
          three: 3
        });
      });
  });

  it("parallel call in another context @nycinvalid @nodeonly", done => {
    const sandbox = {
      async: pasync,
      done
    };

    const fn = `
      ((() => {
        async.parallel([() => Promise.resolve()])
          .then(() => {
            done();
          })
          .catch(err => {
            done(err)
          })
      })())
    `;

    vm.runInNewContext(fn, sandbox);
  });

  it("parallel error with reflect", () => {
    return pasync
      .parallel([
        pasync.reflect(async () => {
          throw new Error("error");
        }),
        pasync.reflect(async () => {
          throw new Error("error2");
        }),
        pasync.reflect(async () => {
          return 2;
        })
      ])
      .then(results => {
        expect(results).toEqual([
          { error: new Error("error") },
          { error: new Error("error2") },
          { value: 2 }
        ]);
      });
  });

  it("parallel object with reflect all (values and errors)", () => {
    const tasks = {
      async one() {
        await sleep(200);
        return "one";
      },
      async two() {
        throw new Error("two");
      },
      async three() {
        await sleep(100);
        return "three";
      }
    };

    return pasync.parallel(pasync.reflectAll(tasks)).then(results => {
      expect(results).toEqual({
        one: { value: "one" },
        two: { error: new Error("two") },
        three: { value: "three" }
      });
    });
  });

  it("parallel empty object with reflect all", () => {
    const tasks = {};

    return pasync.parallel(pasync.reflectAll(tasks)).then(results => {
      expect(results).toEqual({});
    });
  });

  it("parallel empty object with reflect all (errors)", () => {
    const tasks = {
      async one() {
        throw new Error("one");
      },
      async two() {
        throw new Error("two");
      },
      async three() {
        throw new Error("three");
      }
    };

    return pasync.parallel(pasync.reflectAll(tasks)).then(results => {
      expect(results).toEqual({
        one: { error: new Error("one") },
        two: { error: new Error("two") },
        three: { error: new Error("three") }
      });
    });
  });

  it("parallel empty object with reflect all (values)", () => {
    const tasks = {
      async one() {
        return "one";
      },
      async two() {
        return "two";
      },
      async three() {
        return "three";
      }
    };

    return pasync.parallel(pasync.reflectAll(tasks)).then(results => {
      expect(results).toEqual({
        one: { value: "one" },
        two: { value: "two" },
        three: { value: "three" }
      });
    });
  });

  it("parallel does not continue replenishing after error", done => {
    let counter = 0;
    const delay = 10;
    async function funcToCall() {
      counter++;
      if (counter === 3) {
        throw new Error("Test Error");
      }
      await sleep(delay);
    }

    const arr = [
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall
    ];

    const limit = 3;
    const maxTime = 10 * arr.length;

    pasync.parallelLimit(arr, limit).catch(err => {
      if (err.message !== "Test Error") {
        return Promise.reject(err);
      }
    });

    setTimeout(() => {
      expect(counter).toEqual(3);
      done();
    }, maxTime);
  });
});

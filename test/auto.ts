import * as async from "../lib";
import sleep from "./support/sleep";

describe("auto", () => {
  it("basics", () => {
    const callOrder = [];
    return async
      .auto({
        task1: [
          "task2",
          async results => {
            await sleep(25);
            callOrder.push("task1");
          }
        ],
        async task2() {
          callOrder.push("task2");
          await sleep(50);
        },
        task3: [
          "task2",
          async results => {
            callOrder.push("task3");
          }
        ],
        task4: [
          "task1",
          "task2",
          async results => {
            callOrder.push("task4");
          }
        ],
        task5: [
          "task2",
          async results => {
            await sleep(0);
            callOrder.push("task5");
          }
        ],
        task6: [
          "task2",
          async results => {
            callOrder.push("task6");
          }
        ]
      })
      .then(() => {
        expect(callOrder).toEqual([
          "task2",
          "task3",
          "task6",
          "task5",
          "task1",
          "task4"
        ]);
      });
  });

  it("auto concurrency", () => {
    const concurrency = 2;
    const runningTasks = [];

    function makeCallback(taskName) {
      return async () => {
        runningTasks.push(taskName);
        const result = runningTasks.slice(0);
        runningTasks.splice(runningTasks.indexOf(taskName), 1);
        return result;
      };
    }

    return async
      .auto(
        {
          task1: ["task2", makeCallback("task1")],
          task2: makeCallback("task2"),
          task3: ["task2", makeCallback("task3")],
          task4: ["task1", "task2", makeCallback("task4")],
          task5: ["task2", makeCallback("task5")],
          task6: ["task2", makeCallback("task6")]
        },
        concurrency
      )
      .then(results => {
        Object.keys(results)
          .map(key => results[key])
          .forEach(result => {
            expect(result.length).toBeLessThan(concurrency + 1);
          });
      });
  });

  it("auto petrify", () => {
    const callOrder = [];
    return async
      .auto({
        task1: [
          "task2",
          async results => {
            await sleep(100);
            callOrder.push("task1");
          }
        ],
        async task2() {
          await sleep(200);
          callOrder.push("task2");
        },
        task3: [
          "task2",
          async results => {
            callOrder.push("task3");
          }
        ],
        task4: [
          "task1",
          "task2",
          async results => {
            callOrder.push("task4");
          }
        ]
      })
      .then(() => {
        expect(callOrder).toEqual(["task2", "task3", "task1", "task4"]);
      });
  });

  it("auto results", () => {
    const callOrder = [];
    return async
      .auto({
        task1: [
          "task2",
          async results => {
            expect(results.task2).toEqual("task2");
            await sleep(25);
            callOrder.push("task1");
            return ["task1a", "task1b"];
          }
        ],
        async task2() {
          await sleep(50);
          callOrder.push("task2");
          return "task2";
        },
        task3: [
          "task2",
          async results => {
            expect(results.task2).toEqual("task2");
            callOrder.push("task3");
          }
        ],
        task4: [
          "task1",
          "task2",
          async results => {
            expect(results.task1).toEqual(["task1a", "task1b"]);
            expect(results.task2).toEqual("task2");
            callOrder.push("task4");
            return "task4";
          }
        ]
      })
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(results => {
        expect(callOrder).toEqual(["task2", "task3", "task1", "task4"]);
        expect(results).toEqual({
          task1: ["task1a", "task1b"],
          task2: "task2",
          task3: undefined,
          task4: "task4"
        });
      });
  });

  it("auto empty object", () => {
    return async.auto({});
  });

  it("auto error", () => {
    return async
      .auto({
        async task1() {
          throw new Error("testerror");
        },
        task2: [
          "task1",
          async () => {
            throw new Error("task2 should not be called");
          }
        ],
        async task3() {
          throw new Error("testerror2");
        }
      })
      .catch(err => err)
      .catch(err => {
        expect(err.message).toEqual("testerror");
      });
  });

  it("auto no callback", done => {
    async.auto({
      async task1() {},
      task2: [
        "task1",
        async results => {
          done();
        }
      ]
    });
  });

  it("auto concurrency no callback", done => {
    async.auto(
      {
        async task1() {},
        task2: [
          "task1",
          async results => {
            done();
          }
        ]
      },
      1
    );
  });

  // Removed 'auto error should pass partial results', a promise error can't return partial results
  // https://github.com/caolan/async/blob/master/mocha_test/auto.js#L185

  // Issue 24 on github: https://github.com/caolan/async/issues#issue/24
  // Issue 76 on github: https://github.com/caolan/async/issues#issue/76
  it("auto removeListener has side effect on loop iteratee", done => {
    async.auto({
      task1: [
        "task3",
        async () => {
          done();
        }
      ],
      task2: [
        "task3",
        async () => {
          /* by design: DON'T call callback */
        }
      ],
      async task3() {}
    });
  });

  // Issue 410 on github: https://github.com/caolan/async/issues/410
  // Removed 'auto calls callback multiple times'
  // An error in the promise callback propagates through the promise chain
  // https://github.com/caolan/async/blob/master/mocha_test/auto.js#L185

  it("auto calls callback multiple times with parallel functions", () => {
    return async
      .auto({
        async task1() {
          throw new Error("err");
        },
        async task2() {
          throw new Error("err");
        }
      })
      .catch(err => err)
      .then(err => {
        expect(err.message).toEqual("err");
      });
  });

  // Issue 462 on github: https://github.com/caolan/async/issues/462
  it("auto modifying results causes final callback to run early", () => {
    return async
      .auto({
        async task1(callback) {
          return "task1";
        },
        task2: [
          "task1",
          async results => {
            await sleep(50);
            results.inserted = true;
            return "task2";
          }
        ],
        async task3() {
          await sleep(100);
          return "task3";
        }
      })
      .catch(err => {
        expect(err).not.to.exist;
      })
      .then(results => {
        expect(results.inserted).toEqual(true);
        expect(results.task3).toEqual("task3");
      });
  });

  // Issue 263 on github: https://github.com/caolan/async/issues/263
  it("auto prevent dead-locks due to inexistant dependencies", () => {
    return async
      .auto({
        task1: [
          "noexist",
          async results => {
            return "task1";
          }
        ]
      })
      .catch(err => err)
      .then(err => {
        expect(err.message).toMatch(/dependency `noexist`/);
      });
  });

  // Issue 263 on github: https://github.com/caolan/async/issues/263
  it("auto prevent dead-locks due to cyclic dependencies", () => {
    return async
      .auto({
        task1: [
          "task2",
          async results => {
            return "task1";
          }
        ],
        task2: [
          "task1",
          async results => {
            return "task2";
          }
        ]
      })
      .catch(err => err)
      .then(err => {
        expect(err.message).toEqual(
          "async.auto cannot execute tasks due to a recursive dependency"
        );
      });
  });

  // Issue 1092 on github: https://github.com/caolan/async/issues/1092
  it("extended cycle detection", () => {
    const task = name => async results => {
      return `task ${name}`;
    };
    async
      .auto({
        a: ["c", task("a")],
        b: ["a", task("b")],
        c: ["b", task("c")]
      })
      .catch(err => err)
      .then(err => {
        expect(err.message).toEqual(
          "async.auto cannot execute tasks due to a recursive dependency"
        );
      });
  });

  // Issue 988 on github: https://github.com/caolan/async/issues/988
  it("auto stops running tasks on error", () => {
    return async
      .auto(
        {
          async task1() {
            throw new Error("error");
          },
          async task2() {
            throw new Error("test2 should not be called");
          }
        },
        1
      )
      .catch(err => err)
      .then(err => {
        expect(err.message).toEqual("error");
      });
  });

  it("ignores results after an error", () => {
    return async
      .auto({
        async task1() {
          await sleep(25);
          throw new Error("error");
        },
        async task2(cb) {
          await sleep(30);
        },
        task3: [
          "task2",
          async () => {
            throw new Error("task should not have been called");
          }
        ]
      })
      .catch(err => err)
      .then(err => {
        expect(err.message).toEqual("error");
      });
  });

  // Removed 'does not allow calling callbacks twice'
  // You can't resolve the promise twice
  // https://github.com/caolan/async/blob/master/mocha_test/auto.js#L357

  it("should handle array tasks with just a function", () => {
    return async.auto({
      a: [async () => 1],
      b: [
        "a",
        async results => {
          expect(results.a).toEqual(1);
        }
      ]
    });
  });

  it("should avoid unncecessary deferrals", () => {
    let isSync = true;

    return async
      .auto({
        step1: async () => 1,
        step2: ["step1", async results => {}]
      })
      .then(() => {
        expect(isSync).toEqual(true);
      });

    isSync = false;
  });

  // Issue 1358 on github: https://github.com/caolan/async/issues/1358
  it("should report errors when a task name is an array method", () => {
    return async
      .auto({
        async one() {
          throw new Error("Something bad happened here");
        },
        async filter() {
          await sleep(25);
          return "All fine here though";
        },
        finally: ["one", "filter", async results => {}]
      })
      .catch(err => err)
      .then(err => {
        expect(err.message).toEqual("Something bad happened here");
      });
  });

  it("should report errors when a task name is an obj prototype method", () => {
    return async
      .auto({
        async one() {
          throw new Error("Something bad happened here");
        },
        async hasOwnProperty() {
          await sleep(25);
          return "All fine here though";
        },
        finally: ["one", "hasOwnProperty", async results => {}]
      })
      .catch(err => err)
      .then(err => {
        expect(err.message).toEqual("Something bad happened here");
      });
  });
});

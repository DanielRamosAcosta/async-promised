import * as assert from "assert";
import * as async from "async";

describe("queue", function() {
  // several tests of these tests are flakey with timing issues
  // TODO: this.retries(3);

  it("basics", done => {
    const call_order = [];
    const delays = [40, 10, 60, 10];

    // worker1: --1-4
    // worker2: -2---3
    // order of completion: 2,1,4,3

    const q = async.queue((task, callback) => {
      setTimeout(() => {
        call_order.push(`process ${task}`);
        callback("error", "arg");
      }, delays.shift());
    }, 2);

    q.push(1, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(1);
      call_order.push(`callback ${1}`);
    });
    q.push(2, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(2);
      call_order.push(`callback ${2}`);
    });
    q.push(3, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(0);
      call_order.push(`callback ${3}`);
    });
    q.push(4, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(0);
      call_order.push(`callback ${4}`);
    });
    expect(q.length()).toEqual(4);
    expect(q.concurrency).toEqual(2);

    q.drain = () => {
      expect(call_order).toEqual([
        "process 2",
        "callback 2",
        "process 1",
        "callback 1",
        "process 4",
        "callback 4",
        "process 3",
        "callback 3"
      ]);
      expect(q.concurrency).toEqual(2);
      expect(q.length()).toEqual(0);
      done();
    };
  });

  it("default concurrency", done => {
    const call_order = [];
    const delays = [40, 10, 60, 10];

    // order of completion: 1,2,3,4

    const q = async.queue((task, callback) => {
      setTimeout(() => {
        call_order.push(`process ${task}`);
        callback("error", "arg");
      }, delays.shift());
    });

    q.push(1, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(3);
      call_order.push(`callback ${1}`);
    });
    q.push(2, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(2);
      call_order.push(`callback ${2}`);
    });
    q.push(3, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(1);
      call_order.push(`callback ${3}`);
    });
    q.push(4, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(0);
      call_order.push(`callback ${4}`);
    });
    expect(q.length()).toEqual(4);
    expect(q.concurrency).toEqual(1);

    q.drain = () => {
      expect(call_order).toEqual([
        "process 1",
        "callback 1",
        "process 2",
        "callback 2",
        "process 3",
        "callback 3",
        "process 4",
        "callback 4"
      ]);
      expect(q.concurrency).toEqual(1);
      expect(q.length()).toEqual(0);
      done();
    };
  });

  it("zero concurrency", done => {
    expect(() => {
      async.queue((task, callback) => {
        callback(null, task);
      }, 0);
    }).toThrow();
    done();
  });

  it("error propagation", done => {
    const results = [];

    const q = async.queue((task, callback) => {
      callback(task.name === "foo" ? new Error("fooError") : null);
    }, 2);

    q.drain = () => {
      expect(results).toEqual(["bar", "fooError"]);
      done();
    };

    q.push({ name: "bar" }, err => {
      if (err) {
        results.push("barError");
        return;
      }

      results.push("bar");
    });

    q.push({ name: "foo" }, err => {
      if (err) {
        results.push("fooError");
        return;
      }

      results.push("foo");
    });
  });

  it("global error handler", done => {
    const results = [];

    const q = async.queue((task, callback) => {
      callback(task.name === "foo" ? new Error("fooError") : null);
    }, 2);

    q.error = (error, task) => {
      expect(error).toBeTruthy();
      expect(error.message).toEqual("fooError");
      expect(task.name).toEqual("foo");
      results.push("fooError");
    };

    q.drain = () => {
      expect(results).toEqual(["fooError", "bar"]);
      done();
    };

    q.push({ name: "foo" });

    q.push({ name: "bar" }, error => {
      expect(error).toBeFalsy();
      results.push("bar");
    });
  });

  // The original queue implementation allowed the concurrency to be changed only
  // on the same event loop during which a task was added to the queue. This
  // test attempts to be a more robust test.
  // Start with a concurrency of 1. Wait until a leter event loop and change
  // the concurrency to 2. Wait again for a later loop then verify the concurrency
  // Repeat that one more time by chaning the concurrency to 5.
  it("changing concurrency", done => {
    const q = async.queue((task, callback) => {
      setTimeout(() => {
        callback();
      }, 10);
    }, 1);

    for (let i = 0; i < 50; i++) {
      q.push("");
    }

    q.drain = () => {
      done();
    };

    setTimeout(() => {
      expect(q.concurrency).toEqual(1);
      q.concurrency = 2;
      setTimeout(() => {
        expect(q.running()).toEqual(2);
        q.concurrency = 5;
        setTimeout(() => {
          expect(q.running()).toEqual(5);
        }, 40);
      }, 40);
    }, 40);
  });

  it("push without callback", function(done) {
    // TODO: this.retries(3); // test can be flakey

    const call_order = [];
    const delays = [40, 10, 60, 10];
    const concurrencyList = [];
    let running = 0;

    // worker1: --1-4
    // worker2: -2---3
    // order of completion: 2,1,4,3

    const q = async.queue((task, callback) => {
      running++;
      concurrencyList.push(running);
      setTimeout(() => {
        call_order.push(`process ${task}`);
        running--;
        callback("error", "arg");
      }, delays.shift());
    }, 2);

    q.push(1);
    q.push(2);
    q.push(3);
    q.push(4);

    q.drain = () => {
      expect(running).toEqual(0);
      expect(concurrencyList).toEqual([1, 2, 2, 2]);
      expect(call_order).toEqual([
        "process 2",
        "process 1",
        "process 4",
        "process 3"
      ]);
      done();
    };
  });

  it("push with non-function", done => {
    const q = async.queue(() => {}, 1);
    expect(() => {
      q.push({}, 1);
    }).toThrow();
    done();
  });

  it("unshift", done => {
    const queue_order = [];

    const q = async.queue((task, callback) => {
      queue_order.push(task);
      callback();
    }, 1);

    q.unshift(4);
    q.unshift(3);
    q.unshift(2);
    q.unshift(1);

    setTimeout(() => {
      expect(queue_order).toEqual([1, 2, 3, 4]);
      done();
    }, 100);
  });

  it("too many callbacks", done => {
    const q = async.queue((task, callback) => {
      callback();
      expect(() => {
        callback();
      }).toThrow();
      done();
    }, 2);

    q.push(1);
  });

  it("bulk task", done => {
    const call_order = [];
    const delays = [40, 10, 60, 10];

    // worker1: --1-4
    // worker2: -2---3
    // order of completion: 2,1,4,3

    const q = async.queue((task, callback) => {
      setTimeout(() => {
        call_order.push(`process ${task}`);
        callback("error", task);
      }, delays.splice(0, 1)[0]);
    }, 2);

    q.push([1, 2, 3, 4], (err, arg) => {
      expect(err).toEqual("error");
      call_order.push(`callback ${arg}`);
    });

    expect(q.length()).toEqual(4);
    expect(q.concurrency).toEqual(2);

    q.drain = () => {
      expect(call_order).toEqual([
        "process 2",
        "callback 2",
        "process 1",
        "callback 1",
        "process 4",
        "callback 4",
        "process 3",
        "callback 3"
      ]);
      expect(q.concurrency).toEqual(2);
      expect(q.length()).toEqual(0);
      done();
    };
  });

  it("idle", done => {
    const q = async.queue((task, callback) => {
      // Queue is busy when workers are running
      expect(q.idle()).toEqual(false);
      callback();
    }, 1);

    // Queue is idle before anything added
    expect(q.idle()).toEqual(true);

    q.unshift(4);
    q.unshift(3);
    q.unshift(2);
    q.unshift(1);

    // Queue is busy when tasks added
    expect(q.idle()).toEqual(false);

    q.drain = () => {
      // Queue is idle after drain
      expect(q.idle()).toEqual(true);
      done();
    };
  });

  it("pause", done => {
    const call_order = [];
    let running = 0;
    const concurrencyList = [];
    const pauseCalls = ["process 1", "process 2", "process 3"];

    const q = async.queue((task, callback) => {
      running++;
      call_order.push(`process ${task}`);
      concurrencyList.push(running);
      setTimeout(() => {
        running--;
        callback();
      }, 10);
    }, 2);

    q.push(1);
    q.push(2, after2);
    q.push(3);

    function after2() {
      q.pause();
      expect(concurrencyList).toEqual([1, 2, 2]);
      expect(call_order).toEqual(pauseCalls);

      setTimeout(whilePaused, 5);
      setTimeout(afterPause, 10);
    }

    function whilePaused() {
      q.push(4);
    }

    function afterPause() {
      expect(concurrencyList).toEqual([1, 2, 2]);
      expect(call_order).toEqual(pauseCalls);
      q.resume();
      q.push(5);
      q.push(6);
      q.drain = drain;
    }
    function drain() {
      expect(concurrencyList).toEqual([1, 2, 2, 1, 2, 2]);
      expect(call_order).toEqual([
        "process 1",
        "process 2",
        "process 3",
        "process 4",
        "process 5",
        "process 6"
      ]);
      done();
    }
  });

  it("pause in worker with concurrency", done => {
    const call_order = [];
    const q = async.queue((task, callback) => {
      if (task.isLongRunning) {
        q.pause();
        setTimeout(() => {
          call_order.push(task.id);
          q.resume();
          callback();
        }, 50);
      } else {
        call_order.push(task.id);
        setTimeout(callback, 10);
      }
    }, 10);

    q.push({ id: 1, isLongRunning: true });
    q.push({ id: 2 });
    q.push({ id: 3 });
    q.push({ id: 4 });
    q.push({ id: 5 });

    q.drain = () => {
      expect(call_order).toEqual([1, 2, 3, 4, 5]);
      done();
    };
  });

  it("start paused", done => {
    const q = async.queue((task, callback) => {
      setTimeout(() => {
        callback();
      }, 40);
    }, 2);
    q.pause();

    q.push([1, 2, 3]);

    setTimeout(() => {
      expect(q.running()).toEqual(0);
      q.resume();
    }, 5);

    setTimeout(() => {
      expect(q.length()).toEqual(1);
      expect(q.running()).toEqual(2);
      q.resume();
    }, 15);

    q.drain = () => {
      done();
    };
  });

  it("kill", done => {
    const q = async.queue(() => /*task, callback*/ {
      setTimeout(() => {
        throw new Error("Function should never be called");
      }, 20);
    }, 1);
    q.drain = () => {
      throw new Error("Function should never be called");
    };

    q.push(0);

    q.kill();

    setTimeout(() => {
      expect(q.length()).toEqual(0);
      done();
    }, 40);
  });

  it("events", done => {
    const calls = [];
    const q = async.queue((task, cb) => {
      // nop
      calls.push(`process ${task}`);
      setTimeout(cb, 10);
    }, 3);
    q.concurrency = 3;

    q.saturated = () => {
      assert(q.running() === 3, "queue should be saturated now");
      calls.push("saturated");
    };
    q.empty = () => {
      assert(q.length() === 0, "queue should be empty now");
      calls.push("empty");
    };
    q.drain = () => {
      assert(
        q.length() === 0 && q.running() === 0,
        "queue should be empty now and no more workers should be running"
      );
      calls.push("drain");
      expect(calls).toEqual([
        "process foo",
        "process bar",
        "saturated",
        "process zoo",
        "foo cb",
        "saturated",
        "process poo",
        "bar cb",
        "empty",
        "saturated",
        "process moo",
        "zoo cb",
        "poo cb",
        "moo cb",
        "drain"
      ]);
      done();
    };
    q.push("foo", () => {
      calls.push("foo cb");
    });
    q.push("bar", () => {
      calls.push("bar cb");
    });
    q.push("zoo", () => {
      calls.push("zoo cb");
    });
    q.push("poo", () => {
      calls.push("poo cb");
    });
    q.push("moo", () => {
      calls.push("moo cb");
    });
  });

  it("empty", done => {
    const calls = [];
    const q = async.queue((task, cb) => {
      // nop
      calls.push(`process ${task}`);
      async.setImmediate(cb);
    }, 3);

    q.drain = () => {
      assert(
        q.length() === 0 && q.running() === 0,
        "queue should be empty now and no more workers should be running"
      );
      calls.push("drain");
      expect(calls).toEqual(["drain"]);
      done();
    };
    q.push([]);
  });

  // #1367
  it("empty and not idle()", done => {
    const calls = [];
    const q = async.queue((task, cb) => {
      // nop
      calls.push(`process ${task}`);
      async.setImmediate(cb);
    }, 1);

    q.empty = () => {
      calls.push("empty");
      assert(
        q.idle() === false,
        "tasks should be running when empty is called"
      );
      expect(q.running()).toEqual(1);
    };

    q.drain = () => {
      calls.push("drain");
      expect(calls).toEqual(["empty", "process 1", "drain"]);
      done();
    };
    q.push(1);
  });

  it("saturated", done => {
    let saturatedCalled = false;
    const q = async.queue((task, cb) => {
      async.setImmediate(cb);
    }, 2);

    q.saturated = () => {
      saturatedCalled = true;
    };
    q.drain = () => {
      assert(saturatedCalled, "saturated not called");
      done();
    };

    q.push(["foo", "bar", "baz", "moo"]);
  });

  it("started", done => {
    const q = async.queue((task, cb) => {
      cb(null, task);
    });

    expect(q.started).toEqual(false);
    q.push([]);
    expect(q.started).toEqual(true);
    done();
  });

  describe("q.saturated(): ", () => {
    it("should call the saturated callback if tasks length is concurrency", done => {
      const calls = [];
      const q = async.queue((task, cb) => {
        calls.push(`process ${task}`);
        async.setImmediate(cb);
      }, 4);
      q.saturated = () => {
        calls.push("saturated");
      };
      q.empty = () => {
        expect(calls.indexOf("saturated")).toBeGreaterThan(-1);
        setTimeout(() => {
          expect(calls).toEqual([
            "process foo0",
            "process foo1",
            "process foo2",
            "saturated",
            "process foo3",
            "foo0 cb",
            "saturated",
            "process foo4",
            "foo1 cb",
            "foo2 cb",
            "foo3 cb",
            "foo4 cb"
          ]);
          done();
        }, 50);
      };
      q.push("foo0", () => {
        calls.push("foo0 cb");
      });
      q.push("foo1", () => {
        calls.push("foo1 cb");
      });
      q.push("foo2", () => {
        calls.push("foo2 cb");
      });
      q.push("foo3", () => {
        calls.push("foo3 cb");
      });
      q.push("foo4", () => {
        calls.push("foo4 cb");
      });
    });
  });

  describe("q.unsaturated(): ", () => {
    it("should have a default buffer property that equals 25% of the concurrenct rate", done => {
      const calls = [];
      const q = async.queue((task, cb) => {
        // nop
        calls.push(`process ${task}`);
        async.setImmediate(cb);
      }, 10);
      expect(q.buffer).toEqual(2.5);
      done();
    });
    it("should allow a user to change the buffer property", done => {
      const calls = [];
      const q = async.queue((task, cb) => {
        // nop
        calls.push(`process ${task}`);
        async.setImmediate(cb);
      }, 10);
      q.buffer = 4;
      expect(q.buffer).not.toEqual(2.5);
      expect(q.buffer).toEqual(4);
      done();
    });
    it("should call the unsaturated callback if tasks length is less than concurrency minus buffer", done => {
      const calls = [];
      const q = async.queue((task, cb) => {
        calls.push(`process ${task}`);
        async.setImmediate(cb);
      }, 4);
      q.unsaturated = () => {
        calls.push("unsaturated");
      };
      q.empty = () => {
        expect(calls.indexOf("unsaturated")).toBeGreaterThan(-1);
        setTimeout(() => {
          expect(calls).toEqual([
            "process foo0",
            "process foo1",
            "process foo2",
            "process foo3",
            "foo0 cb",
            "unsaturated",
            "process foo4",
            "foo1 cb",
            "unsaturated",
            "foo2 cb",
            "unsaturated",
            "foo3 cb",
            "unsaturated",
            "foo4 cb",
            "unsaturated"
          ]);
          done();
        }, 50);
      };
      q.push("foo0", () => {
        calls.push("foo0 cb");
      });
      q.push("foo1", () => {
        calls.push("foo1 cb");
      });
      q.push("foo2", () => {
        calls.push("foo2 cb");
      });
      q.push("foo3", () => {
        calls.push("foo3 cb");
      });
      q.push("foo4", () => {
        calls.push("foo4 cb");
      });
    });
  });

  describe("workersList", () => {
    it("should be the same length as running()", done => {
      const q = async.queue((task, cb) => {
        async.setImmediate(() => {
          expect(q.workersList().length).toEqual(q.running());
          cb();
        });
      }, 2);

      q.drain = () => {
        expect(q.workersList().length).toEqual(0);
        expect(q.running()).toEqual(0);
        done();
      };

      q.push("foo");
      q.push("bar");
      q.push("baz");
    });

    it("should contain the items being processed", done => {
      const itemsBeingProcessed = {
        foo: ["foo"],
        foo_cb: ["foo", "bar"],
        bar: ["foo", "bar"],
        bar_cb: ["bar", "baz"],
        baz: ["bar", "baz"],
        baz_cb: ["baz"]
      };

      function getWorkersListData(q) {
        return q.workersList().map(v => v.data);
      }

      const q = async.queue((task, cb) => {
        expect(getWorkersListData(q)).toEqual(itemsBeingProcessed[task]);
        expect(q.workersList().length).toEqual(q.running());
        async.setImmediate(() => {
          expect(getWorkersListData(q)).toEqual(
            itemsBeingProcessed[`${task}_cb`]
          );
          expect(q.workersList().length).toEqual(q.running());
          cb();
        });
      }, 2);

      q.drain = () => {
        expect(q.workersList()).toEqual([]);
        expect(q.workersList().length).toEqual(q.running());
        done();
      };

      q.push("foo");
      q.push("bar");
      q.push("baz");
    });
  });

  it("remove", done => {
    const result = [];
    const q = async.queue((data, cb) => {
      result.push(data);
      async.setImmediate(cb);
    });

    q.push([1, 2, 3, 4, 5]);

    q.remove(node => node.data === 3);

    q.drain = () => {
      expect(result).toEqual([1, 2, 4, 5]);
      done();
    };
  });
});

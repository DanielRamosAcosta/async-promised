import * as async from "async";

describe("priorityQueue", () => {
  it("priorityQueue", done => {
    const callOrder = [];

    // order of completion: 2,1,4,3

    const q = async.priorityQueue((task, callback) => {
      callOrder.push(`process ${task}`);
      callback("error", "arg");
    }, 1);

    q.push(1, 1.4, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(2);
      callOrder.push(`callback ${1}`);
    });
    q.push(2, 0.2, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(3);
      callOrder.push(`callback ${2}`);
    });
    q.push(3, 3.8, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(0);
      callOrder.push(`callback ${3}`);
    });
    q.push(4, 2.9, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(1);
      callOrder.push(`callback ${4}`);
    });
    expect(q.length()).toEqual(4);
    expect(q.concurrency).toEqual(1);

    q.drain = () => {
      expect(callOrder).toEqual([
        "process 2",
        "callback 2",
        "process 1",
        "callback 1",
        "process 4",
        "callback 4",
        "process 3",
        "callback 3"
      ]);
      expect(q.concurrency).toEqual(1);
      expect(q.length()).toEqual(0);
      done();
    };
  });

  it("concurrency", done => {
    const callOrder = [];
    const delays = [160, 80, 240, 80];

    // worker1: --2-3
    // worker2: -1---4
    // order of completion: 1,2,3,4

    const q = async.priorityQueue((task, callback) => {
      setTimeout(() => {
        callOrder.push(`process ${task}`);
        callback("error", "arg");
      }, delays.splice(0, 1)[0]);
    }, 2);

    q.push(1, 1.4, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(2);
      callOrder.push(`callback ${1}`);
    });
    q.push(2, 0.2, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(1);
      callOrder.push(`callback ${2}`);
    });
    q.push(3, 3.8, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(0);
      callOrder.push(`callback ${3}`);
    });
    q.push(4, 2.9, (err, arg) => {
      expect(err).toEqual("error");
      expect(arg).toEqual("arg");
      expect(q.length()).toEqual(0);
      callOrder.push(`callback ${4}`);
    });
    expect(q.length()).toEqual(4);
    expect(q.concurrency).toEqual(2);

    q.drain = () => {
      expect(callOrder).toEqual([
        "process 1",
        "callback 1",
        "process 2",
        "callback 2",
        "process 3",
        "callback 3",
        "process 4",
        "callback 4"
      ]);
      expect(q.concurrency).toEqual(2);
      expect(q.length()).toEqual(0);
      done();
    };
  });

  it("pause in worker with concurrency", done => {
    const callOrder = [];
    const q = async.priorityQueue((task, callback) => {
      if (task.isLongRunning) {
        q.pause();
        setTimeout(() => {
          callOrder.push(task.id);
          q.resume();
          callback();
        }, 50);
      } else {
        callOrder.push(task.id);
        setTimeout(callback, 10);
      }
    }, 10);

    q.push({ id: 1, isLongRunning: true });
    q.push({ id: 2 });
    q.push({ id: 3 });
    q.push({ id: 4 });
    q.push({ id: 5 });

    q.drain = () => {
      expect(callOrder).toEqual([1, 2, 3, 4, 5]);
      done();
    };
  });

  describe("q.saturated(): ", () => {
    it("should call the saturated callback if tasks length is concurrency", done => {
      const calls = [];
      const q = async.priorityQueue((task, cb) => {
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
            "process foo4",
            "process foo3",
            "process foo2",
            "saturated",
            "process foo1",
            "foo4 cb",
            "saturated",
            "process foo0",
            "foo3 cb",
            "foo2 cb",
            "foo1 cb",
            "foo0 cb"
          ]);
          done();
        }, 50);
      };
      q.push("foo0", 5, () => {
        calls.push("foo0 cb");
      });
      q.push("foo1", 4, () => {
        calls.push("foo1 cb");
      });
      q.push("foo2", 3, () => {
        calls.push("foo2 cb");
      });
      q.push("foo3", 2, () => {
        calls.push("foo3 cb");
      });
      q.push("foo4", 1, () => {
        calls.push("foo4 cb");
      });
    });
  });

  describe("q.unsaturated(): ", () => {
    it("should have a default buffer property that equals 25% of the concurrenct rate", done => {
      const calls = [];
      const q = async.priorityQueue((task, cb) => {
        // nop
        calls.push(`process ${task}`);
        async.setImmediate(cb);
      }, 10);
      expect(q.buffer).toEqual(2.5);
      done();
    });

    it("should allow a user to change the buffer property", done => {
      const calls = [];
      const q = async.priorityQueue((task, cb) => {
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
      const q = async.priorityQueue((task, cb) => {
        calls.push(`process ${task}`);
        setTimeout(cb, 10);
      }, 4);
      q.unsaturated = () => {
        calls.push("unsaturated");
      };
      q.empty = () => {
        expect(calls.indexOf("unsaturated")).toBeGreaterThan(-1);
        setTimeout(() => {
          expect(calls).toEqual([
            "process foo4",
            "process foo3",
            "process foo2",
            "process foo1",
            "foo4 cb",
            "unsaturated",
            "process foo0",
            "foo3 cb",
            "unsaturated",
            "foo2 cb",
            "unsaturated",
            "foo1 cb",
            "unsaturated",
            "foo0 cb",
            "unsaturated"
          ]);
          done();
        }, 50);
      };
      q.push("foo0", 5, () => {
        calls.push("foo0 cb");
      });
      q.push("foo1", 4, () => {
        calls.push("foo1 cb");
      });
      q.push("foo2", 3, () => {
        calls.push("foo2 cb");
      });
      q.push("foo3", 2, () => {
        calls.push("foo3 cb");
      });
      q.push("foo4", 1, () => {
        calls.push("foo4 cb");
      });
    });
  });
});

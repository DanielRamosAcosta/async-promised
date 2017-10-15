import * as assert from 'assert';
import * as async from 'async';

describe('race', () => {
  it('should call each function in parallel and callback with first result', function raceTest10(
    done
  ) {
    let finished = 0;
    const tasks = [];
    function eachTest(i) {
      const index = i;
      return next => {
        finished++;
        next(null, index);
      };
    }
    for (let i = 0; i < 10; i++) {
      tasks[i] = eachTest(i);
    }
    async.race(tasks, (err, result) => {
      assert.ifError(err);
      // 0 finished first
      assert.strictEqual(result, 0);
      assert.strictEqual(finished, 1);
      async.setImmediate(() => {
        assert.strictEqual(finished, 10);
        done();
      });
    });
  });
  it('should callback with the first error', function raceTest20(done) {
    const tasks = [];
    function eachTest(i) {
      const index = i;
      return next => {
        setTimeout(() => {
          next(new Error(`ERR${index}`));
        }, 50 - index * 2);
      };
    }
    for (let i = 0; i <= 5; i++) {
      tasks[i] = eachTest(i);
    }
    async.race(tasks, (err, result) => {
      assert.ok(err);
      assert.ok(err instanceof Error);
      assert.strictEqual(typeof result, 'undefined');
      assert.strictEqual(err.message, 'ERR5');
      done();
    });
  });
  it('should callback when task is empty', function raceTest30(done) {
    async.race([], (err, result) => {
      assert.ifError(err);
      assert.strictEqual(typeof result, 'undefined');
      done();
    });
  });
  it('should callback in error the task arg is not an Array', function raceTest40() {
    const errors = [];
    async.race(null, err => {
      errors.push(err);
    });
    async.race({}, err => {
      errors.push(err);
    });
    assert.strictEqual(errors.length, 2);
    assert.ok(errors[0] instanceof TypeError);
    assert.ok(errors[1] instanceof TypeError);
  });
});

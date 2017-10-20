import * as async from 'async';
import { expect } from 'chai';
import * as _ from 'lodash';
import * as pasync from '../lib';
import sleep from './support/sleep';

describe('auto', () => {
  it('basics', () => {
    const callOrder = [];
    return pasync
      .auto({
        task1: [
          'task2',
          async results => {
            await sleep(25);
            callOrder.push('task1');
          }
        ],
        async task2() {
          callOrder.push('task2');
          await sleep(50);
        },
        task3: [
          'task2',
          async results => {
            callOrder.push('task3');
          }
        ],
        task4: [
          'task1',
          'task2',
          async results => {
            callOrder.push('task4');
          }
        ],
        task5: [
          'task2',
          async results => {
            await sleep(0);
            callOrder.push('task5');
          }
        ],
        task6: [
          'task2',
          async results => {
            callOrder.push('task6');
          }
        ]
      })
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(() => {
        expect(callOrder).to.eql([
          'task2',
          'task3',
          'task6',
          'task5',
          'task1',
          'task4'
        ]);
      });
  });

  it('auto concurrency', done => {
    const concurrency = 2;
    const runningTasks = [];

    function makeCallback(taskName) {
      return function(/*..., callback*/) {
        const callback = _.last(arguments);
        runningTasks.push(taskName);
        setTimeout(() => {
          // Each task returns the array of running tasks as results.
          const result = runningTasks.slice(0);
          runningTasks.splice(runningTasks.indexOf(taskName), 1);
          callback(null, result);
        });
      };
    }

    async.auto(
      {
        task1: ['task2', makeCallback('task1')],
        task2: makeCallback('task2'),
        task3: ['task2', makeCallback('task3')],
        task4: ['task1', 'task2', makeCallback('task4')],
        task5: ['task2', makeCallback('task5')],
        task6: ['task2', makeCallback('task6')]
      },
      concurrency,
      (err, results) => {
        _.each(results, result => {
          expect(result.length).to.be.below(concurrency + 1);
        });
        done();
      }
    );
  });

  it('auto petrify', done => {
    const callOrder = [];
    async.auto(
      {
        task1: [
          'task2',
          (results, callback) => {
            setTimeout(() => {
              callOrder.push('task1');
              callback();
            }, 100);
          }
        ],
        task2(callback) {
          setTimeout(() => {
            callOrder.push('task2');
            callback();
          }, 200);
        },
        task3: [
          'task2',
          (results, callback) => {
            callOrder.push('task3');
            callback();
          }
        ],
        task4: [
          'task1',
          'task2',
          (results, callback) => {
            callOrder.push('task4');
            callback();
          }
        ]
      },
      err => {
        if (err) throw err;
        expect(callOrder).to.eql(['task2', 'task3', 'task1', 'task4']);
        done();
      }
    );
  });

  it('auto results', done => {
    const callOrder = [];
    async.auto(
      {
        task1: [
          'task2',
          (results, callback) => {
            expect(results.task2).to.eql('task2');
            setTimeout(() => {
              callOrder.push('task1');
              callback(null, 'task1a', 'task1b');
            }, 25);
          }
        ],
        task2(callback) {
          setTimeout(() => {
            callOrder.push('task2');
            callback(null, 'task2');
          }, 50);
        },
        task3: [
          'task2',
          (results, callback) => {
            expect(results.task2).to.eql('task2');
            callOrder.push('task3');
            callback(null);
          }
        ],
        task4: [
          'task1',
          'task2',
          (results, callback) => {
            expect(results.task1).to.eql(['task1a', 'task1b']);
            expect(results.task2).to.eql('task2');
            callOrder.push('task4');
            callback(null, 'task4');
          }
        ]
      },
      (err, results) => {
        expect(callOrder).to.eql(['task2', 'task3', 'task1', 'task4']);
        expect(results).to.eql({
          task1: ['task1a', 'task1b'],
          task2: 'task2',
          task3: undefined,
          task4: 'task4'
        });
        done();
      }
    );
  });

  it('auto empty object', done => {
    async.auto({}, err => {
      expect(err).to.equal(null);
      done();
    });
  });

  it('auto error', done => {
    async.auto(
      {
        task1(callback) {
          callback('testerror');
        },
        task2: [
          'task1',
          () => /*results, callback*/ {
            throw new Error('task2 should not be called');
          }
        ],
        task3(callback) {
          callback('testerror2');
        }
      },
      err => {
        expect(err).to.equal('testerror');
      }
    );
    setTimeout(done, 100);
  });

  it('auto no callback', done => {
    async.auto({
      task1(callback) {
        callback();
      },
      task2: [
        'task1',
        (results, callback) => {
          callback();
          done();
        }
      ]
    });
  });

  it('auto concurrency no callback', done => {
    async.auto(
      {
        task1(callback) {
          callback();
        },
        task2: [
          'task1',
          (results, callback) => {
            callback();
            done();
          }
        ]
      },
      1
    );
  });

  it('auto error should pass partial results', done => {
    async.auto(
      {
        task1(callback) {
          callback(false, 'result1');
        },
        task2: [
          'task1',
          (results, callback) => {
            callback('testerror', 'result2');
          }
        ],
        task3: [
          'task2',
          () => {
            throw new Error('task3 should not be called');
          }
        ]
      },
      (err, results) => {
        expect(err).to.equal('testerror');
        expect(results.task1).to.equal('result1');
        expect(results.task2).to.equal('result2');
        done();
      }
    );
  });

  // Issue 24 on github: https://github.com/caolan/async/issues#issue/24
  // Issue 76 on github: https://github.com/caolan/async/issues#issue/76
  it('auto removeListener has side effect on loop iteratee', done => {
    async.auto({
      task1: [
        'task3',
        () => /*callback*/ {
          done();
        }
      ],
      task2: [
        'task3',
        () => /*callback*/ {
          /* by design: DON'T call callback */
        }
      ],
      task3(callback) {
        callback();
      }
    });
  });

  // Issue 410 on github: https://github.com/caolan/async/issues/410
  it('auto calls callback multiple times', done => {
    let finalCallCount = 0;
    try {
      async.auto(
        {
          task1(callback) {
            callback(null);
          },
          task2: [
            'task1',
            (results, callback) => {
              callback(null);
            }
          ]
        },

        () => {
          finalCallCount++;
          const e = new Error('An error');
          e._test_error = true;
          throw e;
        }
      );
    } catch (e) {
      if (!e._test_error) {
        throw e;
      }
    }
    setTimeout(() => {
      expect(finalCallCount).to.equal(1);
      done();
    }, 10);
  });

  it('auto calls callback multiple times with parallel functions', done => {
    async.auto(
      {
        task1(callback) {
          setTimeout(callback, 0, 'err');
        },
        task2(callback) {
          setTimeout(callback, 0, 'err');
        }
      },
      err => {
        expect(err).to.equal('err');
        done();
      }
    );
  });

  // Issue 462 on github: https://github.com/caolan/async/issues/462
  it('auto modifying results causes final callback to run early', done => {
    async.auto(
      {
        task1(callback) {
          callback(null, 'task1');
        },
        task2: [
          'task1',
          (results, callback) => {
            results.inserted = true;
            setTimeout(() => {
              callback(null, 'task2');
            }, 50);
          }
        ],
        task3(callback) {
          setTimeout(() => {
            callback(null, 'task3');
          }, 100);
        }
      },
      (err, results) => {
        expect(results.inserted).to.equal(true);
        expect(results.task3).to.equal('task3');
        done();
      }
    );
  });

  // Issue 263 on github: https://github.com/caolan/async/issues/263
  it('auto prevent dead-locks due to inexistant dependencies', done => {
    expect(() => {
      async.auto({
        task1: [
          'noexist',
          (results, callback) => {
            callback(null, 'task1');
          }
        ]
      });
    }).to.throw(/dependency `noexist`/);
    done();
  });

  // Issue 263 on github: https://github.com/caolan/async/issues/263
  it('auto prevent dead-locks due to cyclic dependencies', done => {
    expect(() => {
      async.auto({
        task1: [
          'task2',
          (results, callback) => {
            callback(null, 'task1');
          }
        ],
        task2: [
          'task1',
          (results, callback) => {
            callback(null, 'task2');
          }
        ]
      });
    }).to.throw();
    done();
  });

  // Issue 1092 on github: https://github.com/caolan/async/issues/1092
  it('extended cycle detection', done => {
    const task = name => (results, callback) => {
      callback(null, `task ${name}`);
    };
    expect(() => {
      async.auto({
        a: ['c', task('a')],
        b: ['a', task('b')],
        c: ['b', task('c')]
      });
    }).to.throw();
    done();
  });

  // Issue 988 on github: https://github.com/caolan/async/issues/988
  it('auto stops running tasks on error', done => {
    async.auto(
      {
        task1(callback) {
          callback('error');
        },
        task2() /*callback*/ {
          throw new Error('test2 should not be called');
        }
      },
      1,
      error => {
        expect(error).to.equal('error');
        done();
      }
    );
  });

  it('ignores results after an error', done => {
    async.auto(
      {
        task1(cb) {
          setTimeout(cb, 25, 'error');
        },
        task2(cb) {
          setTimeout(cb, 30, null);
        },
        task3: [
          'task2',
          () => {
            throw new Error('task should not have been called');
          }
        ]
      },
      err => {
        expect(err).to.equal('error');
        setTimeout(done, 25, null);
      }
    );
  });

  it('does not allow calling callbacks twice', () => {
    expect(() => {
      async.auto(
        {
          bad(cb) {
            cb();
            cb();
          }
        },
        () => {}
      );
    }).to.throw();
  });

  it('should handle array tasks with just a function', done => {
    async.auto(
      {
        a: [
          cb => {
            cb(null, 1);
          }
        ],
        b: [
          'a',
          (results, cb) => {
            expect(results.a).to.equal(1);
            cb();
          }
        ]
      },
      done
    );
  });

  it('should avoid unncecessary deferrals', done => {
    let isSync = true;

    async.auto(
      {
        step1(cb) {
          cb(null, 1);
        },
        step2: [
          'step1',
          (results, cb) => {
            cb();
          }
        ]
      },
      () => {
        expect(isSync).to.equal(true);
        done();
      }
    );

    isSync = false;
  });

  // Issue 1358 on github: https://github.com/caolan/async/issues/1358
  it('should report errors when a task name is an array method', done => {
    async.auto(
      {
        one(next) {
          next('Something bad happened here');
        },
        filter(next) {
          _.delay(() => {
            next(null, 'All fine here though');
          }, 25);
        },
        finally: [
          'one',
          'filter',
          (a, next) => {
            _.defer(next);
          }
        ]
      },
      err => {
        expect(err).to.equal('Something bad happened here');
        _.delay(done, 30);
      }
    );
  });

  it('should report errors when a task name is an obj prototype method', done => {
    async.auto(
      {
        one(next) {
          next('Something bad happened here');
        },
        hasOwnProperty(next) {
          _.delay(() => {
            next(null, 'All fine here though');
          }, 25);
        },
        finally: [
          'one',
          'hasOwnProperty',
          (a, next) => {
            _.defer(next);
          }
        ]
      },
      err => {
        expect(err).to.equal('Something bad happened here');
        _.delay(done, 30);
      }
    );
  });
});

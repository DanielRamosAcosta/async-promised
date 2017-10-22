import { expect } from 'chai';
import * as pasync from '../lib';
import { supportsArrowFunction, supportsAsyncAwait, supportsDefaultObjectParameter } from './support/detect-ES6-features';
import sleep from './support/sleep';

describe('autoInject', () => {
  it('basics', () => {
    const callOrder = [];
    return pasync
      .autoInject({
        task1: async ({ task2 }) => {
          expect(task2).to.equal(2);
          await sleep(25);
          callOrder.push('task1');
          return 1;
        },
        task2: async () => {
          await sleep(50);
          callOrder.push('task2');
          return 2;
        },
        task3: async ({ task2 }) => {
          expect(task2).to.equal(2);
          callOrder.push('task3');
          return 3;
        },
        task4: async ({ task1, task2 }) => {
          expect(task1).to.equal(1);
          expect(task2).to.equal(2);
          callOrder.push('task4');
          return 4;
        },
        task5: async ({ task2 }) => {
          expect(task2).to.equal(2);
          await sleep(0);
          callOrder.push('task5');
          return 5;
        },
        task6: async ({ task2 }) => {
          expect(task2).to.equal(2);
          callOrder.push('task6');
          return 6;
        }
      })
      .catch(err => {
        console.log(err);
        throw err;
        expect(err).to.not.exist;
      })
      .then(results => {
        expect(results.task6).to.equal(6);
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

  it('should work with function insted of arrow functions', () => {
    const callOrder = [];
    return pasync
      .autoInject({
        async task1({ task2 }) {
          expect(task2).to.equal(2);
          await sleep(25);
          callOrder.push('task1');
          return 1;
        },
        async task2() {
          await sleep(50);
          callOrder.push('task2');
          return 2;
        },
        async task3({ task2 }) {
          expect(task2).to.equal(2);
          callOrder.push('task3');
          return 3;
        },
        async task4({ task1, task2 }) {
          expect(task1).to.equal(1);
          expect(task2).to.equal(2);
          callOrder.push('task4');
          return 4;
        },
        async task5({ task2 }) {
          expect(task2).to.equal(2);
          await sleep(0);
          callOrder.push('task5');
          return 5;
        },
        async task6({ task2 }) {
          expect(task2).to.equal(2);
          callOrder.push('task6');
          return 6;
        }
      })
      .catch(err => {
        console.log(err);
        throw err;
        expect(err).to.not.exist;
      })
      .then(results => {
        expect(results.task6).to.equal(6);
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

  it('should work with array tasks', () => {
    const callOrder = [];

    return pasync
      .autoInject({
        task1: async () => {
          callOrder.push('task1');
          return 1;
        },
        task2: [
          'task3',
          async ({ task3 }) => {
            expect(task3).to.equal(3);
            callOrder.push('task2');
            return 2;
          }
        ],
        task3: async () => {
          callOrder.push('task3');
          return 3;
        }
      })
      .catch(err => {
        expect(err).not.to.exist;
      })
      .then(() => {
        expect(callOrder).to.eql(['task1', 'task3', 'task2']);
      });
  });

  it('should handle array tasks with just a function', () => {
    return pasync.autoInject({
      a: [
        async () => {
          return 1;
        }
      ],
      b: [
        'a',
        async ({ a }) => {
          expect(a).to.equal(1);
        }
      ]
    });
  });

  it('should handle array tasks with just a function', () => {
    return pasync.autoInject({
      a: [
        async () => {
          return 1;
        }
      ],
      b: [
        'a',
        async ({ a }) => {
          expect(a).to.equal(1);
        }
      ]
    });
  });

  // Removed 'should throw error for function without explicit parameters'
  // An async function might have no parameters if it's a root function.
  // https://github.com/caolan/async/blob/master/mocha_test/autoInject.js#L88

  if (supportsArrowFunction() && supportsAsyncAwait()) {
    // Needs to be run on ES6 only
    eval(`
      () => {
        it('should work with es6 arrow syntax', function() {
          return pasync
            .autoInject({
              task1: async () => 1,
              task2: async ({ task3 }) => 2,
              task3: async () => 3
            })
            .catch(err => {
              expect(err).not.to.exist;
            })
            .then(results => {
              expect(results.task1).toEqual(1);
              expect(results.task3).toEqual(3);
            });
        });
      };
    `)();

    if (supportsDefaultObjectParameter()) {
      eval(`
        (() => {
          it('should work with es6 obj method syntax', () => {
            return pasync.autoInject(
              {
                async task1() {
                  return 1
                },
                async task2({task3}) {
                  return 2
                },
                async task3() {
                  return 3
                },
                async task4({task2}) {},
                async task5({task4 = 4}) {
                  return task4 + 1
                }
              })
              .then(results => {
                expect(results.task1).toEqual(1);
                expect(results.task3).toEqual(3);
                expect(results.task4).toEqual(undefined);
                expect(results.task5).toEqual(5);
              })
          });
        });
      `)();
      eval(`
        (() => {
          it('should work with es6 obj method syntax & arrow functions', () => {
            return pasync.autoInject(
              {
                task1: async () => 1,
                task2: async ({task3}) => 2,
                task3: async () => 3,
                task4: async ({task2}) => {},
                task5: async ({task4 = 4}) => task4 + 1
              })
              .then(results => {
                expect(results.task1).toEqual(1);
                expect(results.task3).toEqual(3);
                expect(results.task4).toEqual(undefined);
                expect(results.task5).toEqual(5);
              })
          });
        });
      `)();
    }
  }
});

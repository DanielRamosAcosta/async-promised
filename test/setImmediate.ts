import * as async from 'async';
import { expect } from 'chai';

describe('setImmediate', () => {
  it('basics', done => {
    const call_order = [];
    async.setImmediate(() => {
      call_order.push('two');
    });
    call_order.push('one');

    setTimeout(() => {
      expect(call_order).to.eql(['one', 'two']);
      done();
    }, 25);
  });

  it('extra args', done => {
    async.setImmediate(
      (a, b, c) => {
        expect([a, b, c]).to.eql([1, 2, 3]);
        done();
      },
      1,
      2,
      3
    );
  });
});

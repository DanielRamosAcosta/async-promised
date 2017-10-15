import * as async from 'async';
import { expect } from 'chai';

describe('nextTick', () => {
  it('basics', done => {
    const call_order = [];
    async.nextTick(() => {
      call_order.push('two');
    });
    call_order.push('one');
    setTimeout(() => {
      expect(call_order).to.eql(['one', 'two']);
      done();
    }, 50);
  });

  it('nextTick in the browser @nodeonly', done => {
    const call_order = [];
    async.nextTick(() => {
      call_order.push('two');
    });

    call_order.push('one');
    setTimeout(() => {
      expect(call_order).to.eql(['one', 'two']);
      done();
    }, 50);
  });

  it('extra args', done => {
    async.nextTick(
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

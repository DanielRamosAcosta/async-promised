import * as async from 'async';
import { expect } from 'chai';

describe('concat', () => {
  it('apply', done => {
    const fn = (...args) => {
      expect(args).to.eql([1, 2, 3, 4]);
    };

    async.apply(fn, 1, 2, 3, 4)();
    async.apply(fn, 1, 2, 3)(4);
    async.apply(fn, 1, 2)(3, 4);
    async.apply(fn, 1)(2, 3, 4);
    async.apply(fn)(1, 2, 3, 4);

    expect(async.apply(name => `hello ${name}`, 'world')()).to.equal(
      'hello world'
    );
    done();
  });
});

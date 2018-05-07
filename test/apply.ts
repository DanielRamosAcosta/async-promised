import * as async from '../lib';

describe('concat', () => {
  it('apply', done => {
    const fn = (...args) => {
      expect(args).toEqual([1, 2, 3, 4]);
    };

    async.apply(fn, 1, 2, 3, 4)();
    async.apply(fn, 1, 2, 3)(4);
    async.apply(fn, 1, 2)(3, 4);
    async.apply(fn, 1)(2, 3, 4);
    async.apply(fn)(1, 2, 3, 4);

    expect(
      async.apply(name => `hello ${name}`, 'world')()
    ).toEqual(
      'hello world'
    );
    done();
  });
});

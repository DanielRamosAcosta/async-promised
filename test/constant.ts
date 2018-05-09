import { expect } from 'chai';
import * as async from '../lib';

describe('constant', () => {
  it('basic usage', () => {
    const f = async.constant(42, 1, 2, 3);

    return f().then(([ value, a, b, c ]) => {
      expect(value).to.equal(42);
      expect(a).to.equal(1);
      expect(b).to.equal(2);
      expect(c).to.equal(3);
    });
  });

  it('called with multiple arguments', () => {
    const f = async.constant(42, 1, 2, 3);

    return f('argument to ignore', 'another argument').then(([value, a]) => {
      expect(value).to.equal(42);
      expect(a).to.equal(1);
    });
  });
});

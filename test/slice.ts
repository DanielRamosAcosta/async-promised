import * as slice from 'async/internal/slice';
import { expect } from 'chai';

describe('slice', () => {
  it('should slice arrays', () => {
    const arr = ['foo', 'bar', 'baz'];
    const result = slice(arr, 2);
    expect(arr).to.eql(['foo', 'bar', 'baz']);
    expect(result).to.eql(['baz']);
  });

  it('should handle ArrayLike objects', () => {
    const args = { 0: 'foo', 1: 'bar', 2: 'baz', length: 3 };
    const result = slice(args, 1);
    expect(result).to.be.an('array');
    expect(result).to.eql(['bar', 'baz']);
  });

  it('should handle arguments', () => {
    const foo = function() {
      return slice(arguments, 1);
    };
    const result = foo(...['foo', 'bar', 'baz']);
    expect(result).to.be.an('array');
    expect(result).to.eql(['bar', 'baz']);
  });

  it('should return an empty array on an invalid start', () => {
    const result = slice(['foo', 'bar', 'baz'], 10);
    expect(result).to.be.an('array').that.is.empty;
  });
});

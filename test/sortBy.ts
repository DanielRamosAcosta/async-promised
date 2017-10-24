import { expect } from 'chai';
import * as pasync from '../lib';
import sleep from './support/sleep';

describe('sortBy', () => {
  it('sortBy', () => {
    return pasync
      .sortBy([{ a: 1 }, { a: 15 }, { a: 6 }], async x => {
        await sleep(0);
        return x.a;
      })
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(result => {
        expect(result).to.eql([{ a: 1 }, { a: 6 }, { a: 15 }]);
      });
  });

  it('sortBy inverted', () => {
    return pasync
      .sortBy([{ a: 1 }, { a: 15 }, { a: 6 }], async x => {
        await sleep(0);
        return x.a * -1;
      })
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(result => {
        expect(result).to.eql([{ a: 15 }, { a: 6 }, { a: 1 }]);
      });
  });

  it('sortBy error', () => {
    const error = new Error('error');
    return pasync
      .sortBy([{ a: 1 }, { a: 15 }, { a: 6 }], async x => {
        await sleep(0);
        throw error;
      })
      .catch(err => err)
      .then(err => {
        expect(err).to.equal(error);
      });
  });
});

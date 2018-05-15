import * as async from '../lib';
import sleep from './support/sleep';

describe('console functions', () => {
  describe('log', () => {
    it('works', async () => {
      const fn = async arg1 => {
        expect(arg1).toEqual('one');
        await sleep(0);
        return 'test';
      };

      const fnErr = async arg1 => {
        expect(arg1).toEqual('one');
        await sleep(0);
        throw new Error('error');
      };

      global.console = {
        log: jest.fn(),
        error: jest.fn()
      };

      async.log(fnErr, 'one');
      async.log(fn, 'one');

      await sleep(10);

      expect(global.console.log).toHaveBeenCalled();
      expect(global.console.log).toHaveBeenCalledWith('test');
      expect(global.console.error).toHaveBeenCalled();
      expect(global.console.error).toHaveBeenCalledWith(new Error('error'));
    });

    // Removed 'log with multiple result params', as a promise can't be
    // resolved with multiple values
    // https://github.com/caolan/async/blob/master/mocha_test/consoleFunctions.js#L42
  });

  describe('dir', () => {
    it('works', async () => {
      const fn = async arg1 => {
        expect(arg1).toEqual('one');
        await sleep(0);
        return 'test';
      };

      const fnErr = async arg1 => {
        expect(arg1).toEqual('one');
        await sleep(0);
        throw new Error('error');
      };

      global.console = {
        dir: jest.fn(),
        error: jest.fn()
      };

      async.dir(fnErr, 'one');
      async.dir(fn, 'one');

      await sleep(10);

      expect(global.console.dir).toHaveBeenCalled();
      expect(global.console.dir).toHaveBeenCalledWith('test');
      expect(global.console.error).toHaveBeenCalled();
      expect(global.console.error).toHaveBeenCalledWith(new Error('error'));
    });

    // Removed 'dir with multiple result params', as a promise can't be
    // resolved with multiple values
    // https://github.com/caolan/async/blob/master/mocha_test/consoleFunctions.js#L42
  });
});

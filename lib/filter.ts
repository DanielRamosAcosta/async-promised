// import filter from './internal/filter';
// import doParallel from './internal/doParallel';

import * as async from 'async';

/**
 * Returns a new array of all the values in `coll` which pass an async truth
 * test. This operation is performed in parallel, but the results array will be
 * in the same order as the original.
 *
 * @name filter
 * @static
 * @memberOf module:Collections
 * @method
 * @alias select
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * @example
 *
 * async.filter(['file1','file2','file3'], filePath => fs.access(filePath))
 * .then(results => {
 *   // results now equals an array of the existing files
 * })
 */

function filter<T>(
    arr: async.Dictionary<T> | T[] | IterableIterator<T>,
    iterator: (item: T) => Promise<boolean>
  ): Promise<Array<(T | undefined)> | undefined> {
  return new Promise((resolve, reject) => {
    async.filter(arr, (item, cb) => {
      iterator(item)
        .then(res => cb(undefined, res))
        .catch(err => cb(err));
    }, (err, results) =>
      err
      ? reject(err)
      : resolve(results)
    );
  });
}

export = filter;

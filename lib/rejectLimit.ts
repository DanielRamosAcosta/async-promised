import * as async from 'async';

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name rejectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`. The `iteratee` should complete with a boolean value as its `result`.
 */

function rejectLimit<T>(
  coll: async.Dictionary<T> | T[] | IterableIterator<T>,
  limit: number,
  iteratee: (item: T) => Promise<boolean>
): Promise<Array<T | undefined>> {
  return new Promise((resolve, reject) => {
    async.rejectLimit(
      coll as any,
      limit,
      (item: T, cb) => {
        iteratee(item)
          .then(res => cb(undefined, res))
          .catch(err => cb(err));
      },
      (err, results) => (err ? reject(err) : resolve(results))
    );
  });
}

export = rejectLimit;

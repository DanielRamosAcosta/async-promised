import { groupByLimit as asyncGroupByLimit } from "async";

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs a maximum of `limit` async operations at a time.
 *
 * @name groupByLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 * @returns {Promise} a promise, if no callback is passed
 */
export default function groupByLimit<T>(
  coll: async.Dictionary<T> | T[] | IterableIterator<T>,
  limit: number,
  iteratee: (item: T) => Promise<string | number>
): Promise<{ [key: string]: T[] } | { [key: number]: T[] }> {
  return new Promise((resolve, reject) => {
    asyncGroupByLimit(
      coll as any,
      limit,
      (item: T, cb) => {
        iteratee(item)
          .then(result => cb(null, result))
          .catch(err => cb(err));
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
  });
}

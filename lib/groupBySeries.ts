import { groupBySeries as asyncGroupBySeries } from "async";
/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs only a single async operation at a time.
 *
 * @name groupBySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 * @returns {Promise} a promise, if no callback is passed
 */
export default function groupBySeries<T>(
  coll: async.Dictionary<T> | T[] | IterableIterator<T>,
  iteratee: (item: T) => Promise<string | number>
): Promise<{ [key: string]: T[] } | { [key: number]: T[] }> {
  return new Promise((resolve, reject) => {
    asyncGroupBySeries(
      coll as any,
      (item: T, cb) => {
        iteratee(item)
          .then(result => cb(null, result))
          .catch(err => cb(err));
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
  });
}

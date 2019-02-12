import { eachOfSeries as asyncEachOfSeries } from "async";

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
 *
 * @name eachOfSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfSeries
 * @category Collection
 * @param coll - A collection to iterate over.
 * @param iteratee - An async function to apply to each item in
 * `coll`.
 * Invoked with (item, key, callback).
 * @returns a promise, if a callback is omitted
 */
export default function eachOfSeries<T>(
  coll: async.Dictionary<T> | T[] | IterableIterator<T>,
  iteratee: (item: T, key: string | number) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    asyncEachOfSeries(
      coll as any,
      (item: T, key: string | number, cb) => {
        iteratee(item, key)
          .then(() => cb())
          .catch(err => cb(err));
      },
      err => (err ? reject(err) : resolve())
    );
  });
}

import { eachOfLimit as asyncEachOfLimit } from "async";

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name eachOfLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfLimit
 * @category Collection
 * @param coll - A collection to iterate over.
 * @param limit - The maximum number of async operations at a time.
 * @param iteratee - An async function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array.
 * Invoked with (item, key, callback).
 * @returns a promise, if a callback is omitted
 */
export default function eachOfLimit<T>(
  coll: async.Dictionary<T> | T[] | IterableIterator<T>,
  limit: number,
  iteratee: (item: T, key: string | number) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    asyncEachOfLimit(
      coll as any,
      limit,
      (item: T, key: string | number, cb) => {
        iteratee(item, key)
          .then(() => cb())
          .catch(err => cb(err));
      },
      err => (err ? reject(err) : resolve())
    );
  });
}

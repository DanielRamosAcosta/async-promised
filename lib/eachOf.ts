import { eachOf as asyncEachOf } from "async";

/**
 * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
 * to the iteratee.
 *
 * @name eachOf
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEachOf
 * @category Collection
 * @see [async.each]{@link module:Collections.each}
 * @param coll - A collection to iterate over.
 * @param iteratee - A function to apply to each
 * item in `coll`.
 * The `key` is the item's key, or index in the case of an array.
 * Invoked with (item, key, callback).
 * @returns a promise, if a callback is omitted
 * @example
 *
 * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
 * var configs = {};
 *
 * async.forEachOf(obj, function (value, key, callback) {
 *     fs.readFile(__dirname + value, "utf8", function (err, data) {
 *         if (err) return callback(err);
 *         try {
 *             configs[key] = JSON.parse(data);
 *         } catch (e) {
 *             return callback(e);
 *         }
 *         callback();
 *     });
 * }, function (err) {
 *     if (err) console.error(err.message);
 *     // configs is now a map of JSON data
 *     doSomethingWith(configs);
 * });
 */
export default function eachOf<T>(
  coll: async.Dictionary<T> | T[] | IterableIterator<T>,
  iteratee: (item: T, key: string | number) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    asyncEachOf(
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

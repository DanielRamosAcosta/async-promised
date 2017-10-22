import { each as asyncEach } from 'async';

/**
 * Applies the function `iteratee` to each item in `coll`, in parallel.
 * The `iteratee` is called with an item from the list, and a callback for when
 * it has finished. If the `iteratee` rejects the promise, the entire promise
 * (for the `each` function) is rejected immediately with the error.
 *
 * Note, that since this function applies `iteratee` to each item in parallel,
 * there is no guarantee that the iteratee functions will complete in order.
 *
 * @name each
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEach
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`. Invoked with (item, callback). The array index is not passed to the
 * iteratee. If you need the index, use `eachOf`.
 * @example
 *
 * // assuming openFiles is an array of file names and saveFile is a function
 * // that returns a promise to save the modified contents of that file:
 *
 * async.each(openFiles, saveFile)
 * .then(() => {
 *   // ...
 * })
 * .catch(err => {
 *   // if any of the saves produced an error, err would equal that error
 * })
 *
 * // assuming openFiles is an array of file names
 * async.each(openFiles, async file => {
 *   // Perform operation on file here.
 *   console.log('Processing file ' + file);
 *   if( file.length > 32 ) {
 *     console.log('This file name is too long');
 *     throw new Error('File name too long')
 *   } else {
 *     // Do work to process file here
 *     console.log('File processed');
 *     return
 *   }
 * })
 * .then(() => {
 *   console.log('All files have been processed successfully');
 * })
 * .catch(err => {
 *   // If any of the file processing produced an error, err would equal that error
 *   // One of the iterations produced an error.
 *   // All processing will now stop.
 *   console.log('A file failed to process');
 * })
 */
export default function each<T>(
  coll: async.Dictionary<T> | T[] | IterableIterator<T>,
  iteratee: (item: T) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    asyncEach(
      coll as any,
      (item: T, cb) => {
        iteratee(item)
          .then(() => cb())
          .catch(err => cb(err));
      },
      err => (err ? reject(err) : resolve())
    );
  });
}

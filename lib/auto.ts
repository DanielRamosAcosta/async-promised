import { auto as asyncAuto, Dictionary } from 'async';
import { AsyncResultPromise, callbackify, resolveCallback } from './internal/asyncTransforms';

export type AsyncAutoTasks<R extends Dictionary<any>> = {
  [K in keyof R]: AsyncAutoTask<R[K], R>
};

export type AsyncAutoTask<R1, R extends Dictionary<any>> =
  | IAsyncAutoTaskFunctionWithoutDependencies<R1>
  | Array<keyof R | IAsyncAutoTaskFunction<R1, R>>;

export type IAsyncAutoTaskFunction<R1, R extends Dictionary<any>> = (
  results: R
) => Promise<R1>;

export type IAsyncAutoTaskFunctionWithoutDependencies<R1> = () => Promise<R1>;

/**
 * Determines the best order for running the {@link AsyncFunction}s in `tasks`, based on
 * their requirements. Each function can optionally depend on other functions
 * being completed first, and each function is run as soon as its requirements
 * are satisfied.
 *
 * If any of the {@link AsyncFunction}s pass an error to their callback, the `auto` sequence
 * will stop. Further tasks will not execute (so any other functions depending
 * on it will not run), and the promise is rejected immediately with the error.
 *
 * {@link AsyncFunction}s also receive an object containing the results of functions which
 * have completed so far as the first argument, if they have dependencies. If a
 * task function has no dependencies, it will only be passed a callback.
 *
 * @name auto
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Object} tasks - An object. Each of its properties is either a
 * function or an array of requirements, with the {@link AsyncFunction} itself the last item
 * in the array. The object's key of a property serves as the name of the task
 * defined by that property, i.e. can be used when specifying requirements for
 * other tasks. The function receives one argument, the `results` object,
 * containing the results of the previously executed functions. This is only
 * passed if the task has any dependencies.
 * @param {number} [concurrency=Infinity] - An optional `integer` for
 * determining the maximum number of tasks that can be run in parallel. By
 * default, as many as possible.
 * @returns {Promise} That resolves when all tasks are completed.
 * @example
 *
 * async.auto({
 *   // this function will just be passed a callback
 *   readData: async.apply(fsp.readFile, 'data.txt', 'utf-8'),
 *   showData: ['readData', async results => {
 *     // results.readData is the file's contents
 *     // ...
 *   }]
 * });
 *
 * async.auto({
 *   get_data: async () => {
 *     console.log('in get_data');
 *     // async code to get some data
 *     return ['data', 'converted to array']
 *   },
 *   make_folder: async () => {
 *     console.log('in make_folder');
 *     // async code to create a directory to store a file in
 *     // this is run at the same time as getting the data
 *     return 'folder'
 *   },
 *   write_file: ['get_data', 'make_folder', async results => {
 *     console.log('in write_file', JSON.stringify(results));
 *     // once there is some data and the directory exists,
 *     // write the data to a file in the directory
 *     return 'filename'
 *   }],
 *   email_link: ['write_file', async results => {
 *     console.log('in email_link', JSON.stringify(results));
 *     // once the file is written let's email a link to it...
 *     // results.write_file contains the filename returned by write_file.
 *     return {'file':results.write_file, 'email':'user@example.com'}
 *   }]
 * })
 * .catch(err =>  {
 *   console.log('err = ', err);
 * })
 * .then(results => {
 *   console.log('results = ', results);
 * })
 */
export default function auto<R extends Dictionary<any>>(
  tasks: AsyncAutoTasks<R>,
  concurrency: number = Infinity
): Promise<R> {
  const newTaks = Object.keys(tasks).reduce((previusValue: object, taskName) => {
    const dependencies = tasks[taskName];
    return {
      ...previusValue,
      [taskName]: Array.isArray(dependencies)
        ? dependencies.map((something: AsyncResultPromise | string) =>
          typeof something === 'function'
          ? callbackify(something)
          : something
          )
      : callbackify(dependencies)
    };
  }, {});
  return new Promise((resolve, reject) => {
    asyncAuto(newTaks, concurrency, resolveCallback(resolve, reject));
  });
}

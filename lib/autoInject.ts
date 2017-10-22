import auto from './auto';
import { callbackify as callbackify, resolveCallback } from './internal/asyncTransforms';
import getParamsOfAsyncFunc from './internal/getParamsOfAsyncFunc';

/**
 * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto}
 * function. Dependent tasks are specified as destructured parameters to the
 * function with the object keys names matching the names of the tasks it
 * depends on. Thiscan provide even more readable task graphs which can be
 * easier to maintain.
 *
 * The autoInject function is purely syntactic sugar and its semantics are
 * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
 *
 * @name autoInject
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.auto]{@link module:ControlFlow.auto}
 * @category Control Flow
 * @param {Object} tasks - An object, each of whose properties is an {@link AsyncFunction} of
 * the form 'func({dependencies...}). The object's key of a property serves as
 * the name of the task defined by that property, i.e. can be used when
 * specifying requirements for other tasks.
 * * The object keys names other tasks on which the task is dependent, and the
 *   results from those tasks are the arguments of those parameters.
 * @example
 *
 * //  The example from `auto` can be rewritten as follows:
 * async.autoInject({
 *   get_data: async () => {
 *     // async code to get some data
 *     return ['data', 'converted to array']
 *   },
 *   make_folder: async () => {
 *     // async code to create a directory to store a file in
 *     // this is run at the same time as getting the data
 *     return 'folder'
 *   },
 *   write_file: async ({get_data, make_folder}) => {
 *     // once there is some data and the directory exists,
 *     // write the data to a file in the directory
 *     return 'filename'
 *   },
 *   email_link: async ({write_file}) => {
 *     // once the file is written let's email a link to it...
 *     // write_file contains the filename returned by write_file.
 *     return {'file':write_file, 'email':'user@example.com'}
 *   }
 * })
 * .catch(err => {
 *   console.log('err = ', err);
 * })
 * .then(results => {
 *   console.log('email_link = ', results.email_link);
 * })
 *
 * // If you are transpiling your code, this won't work, becouse the transpiler
 * // will asign a single parameter, an then spread it over single variables.
 * // If this is your case, you might use auto itself with object-destructuring.
 *
 * async.auto({
 *   //...
 *   write_file: ['get_data', 'make_folder', async ({get_data, make_folder}) => {
 *     return 'filename'
 *   }],
 *   email_link: ['write_file', async ({write_file}) => {
 *     return {'file': write_file, 'email': 'user@example.com'}
 *   }]
 *   //...
 * })
 */

export default function autoInject(tasks: IAutoInject) {
  const newTasks = Object.keys(tasks).reduce((previusValue: object, taskName) => {
    const dependencies = Array.isArray(tasks[taskName])
      ? tasks[taskName].splice(0, tasks[taskName].length - 1)
      : getParamsOfAsyncFunc(tasks[taskName]);
    return {
      ...previusValue,
      [taskName]: dependencies.length
        ? dependencies.concat(tasks[taskName])
        : tasks[taskName]
    };
  }, {});

  return auto(newTasks);
}

export interface IAutoInject {
  [key: string]: (...args: any[]) => Promise<any>;
}

export type AsyncResultCallback = (...args: any[]) => void;
export type AsyncResultPromise = (...args: any[]) => Promise<any>;

export function callbackify(func: AsyncResultPromise): AsyncResultCallback {
  return function(this: any, ...allArgs: any[]) {
    const callback: AsyncResultCallback = allArgs[allArgs.length - 1];
    const args: any[] = allArgs.slice(0, allArgs.length - 1);
    linkCB(func.call(this, ...args), callback);
  };
}

export function resolveCallback<T>(resolve: Function, reject: Function) {
  return (err: Error | undefined, results: T) =>
    err
    ? reject(err)
    : resolve(results);
}

export function linkCB(prom: Promise<any>, callback: Function) {
  prom
    .then(results => callback(null, results))
    .catch(err => callback(err));
}

export function callbackifyFuncs(tasks: AsyncResultPromise[]) {
  if (Array.isArray(tasks)) {
    return tasks.map(callbackify);
  }
  return tasks;
}

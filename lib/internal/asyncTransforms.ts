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
    err ? reject(err) : results === undefined ? resolve() : resolve(results);
}

export function linkCB(prom: Promise<any>, callback: Function) {
  Promise.resolve(prom)
    .then(results =>
      results === undefined ? callback(null) : callback(null, results)
    )
    .catch(err => callback(err));
}

export function callbackifyFuncs(tasks: AsyncResultPromise[]) {
  if (Array.isArray(tasks)) {
    return tasks.map(callbackify);
  }
  return Object.keys(tasks).reduce(
    (previousValue, currentValue) => ({
      ...previousValue,
      [currentValue]: callbackify(tasks[currentValue])
    }),
    {}
  );
}

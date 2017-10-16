export type AsyncResultCallback = (...args: any[]) => void;
export type AsyncResultPromise = (...args: any[]) => Promise<any>;

export function callbackify<T, U>(func: AsyncResultPromise): AsyncResultCallback {
  return (...allArgs: any[]) => {
    const callback: AsyncResultCallback = allArgs[allArgs.length - 1];
    const args: any[] = allArgs.slice(0, allArgs.length - 1);
    func(...args)
      .then((result: any) => callback(null, result))
      .catch((err: Error) => callback(err));
  };
}

export function callbackifyFuncs(tasks: AsyncResultPromise[]) {
  if (Array.isArray(tasks)) {
    return tasks.map(callbackify);
  }
  return tasks;
}

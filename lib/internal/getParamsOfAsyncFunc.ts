const regexes = {
  arrowFunc: /(.*) =>/
};

function getArrowFuncParams(funcDef: string): string[] {
  const matches = funcDef.match(regexes.arrowFunc);
  if (!matches || !matches[1]) {
    return [];
  }
  return matches[1]
    .replace(/{|}|\(|\)|async/g, '')
    .trim()
    .split(', ')
    .map(str => str.replace(/=.*/, '').trim())
    .filter(str => str.length);
}

function getFuncParams(funcDef: string): string[] {
  const matches = funcDef.match(/.*(\(.*\)).*\{/);
  if (!matches || !matches[1]) {
    return [];
  }
  return matches[1]
    .replace(/{|}|\(|\)|async/g, '')
    .trim()
    .split(', ')
    .map(str => str.replace(/=.*/, '').trim())
    .filter(str => str.length);
}

export default function getParamsOfAsyncFunc(func: Function): string[] {
  const funcDef = func.toString();
  if (regexes.arrowFunc.test(funcDef)) {
    return getArrowFuncParams(funcDef);
  }
  return getFuncParams(funcDef);
}

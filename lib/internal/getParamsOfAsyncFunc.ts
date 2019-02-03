const regexes = {
  arrowFunc: /([\s\S]*?) =>/,
  func: /\(([\s\S]*?)\)/
};

function removeDefaultParameter(str: string) {
  return str.replace(/=.*/, "");
}

function emptyString(str: string) {
  return str.length !== 0;
}

function getArrowFuncParams(funcDef: string): string[] {
  const matches = funcDef.match(regexes.arrowFunc);

  if (!matches || !matches[1]) {
    return [];
  }

  // console.log("matches[1]");
  // console.log(JSON.stringify(matches[1]));

  return matches[1]
    .replace(/{|}|\(|\)|async/g, "")
    .replace(/[\s]/g, "")
    .split(",")
    .filter(str => str.length !== 0)
    .map(removeDefaultParameter);
}

function getFuncParams(funcDef: string): string[] {
  const matches = funcDef.match(regexes.func);
  if (!matches || !matches[1]) {
    return [];
  }

  return matches[1]
    .replace(/{|}|\(|\)|async/g, "")
    .replace(/[\s]/g, "")
    .split(",")
    .filter(emptyString)
    .map(removeDefaultParameter);
}

export default function getParamsOfAsyncFunc(func: Function): string[] {
  const funcDef = func.toString();
  if (regexes.arrowFunc.test(funcDef)) {
    return getArrowFuncParams(funcDef);
  }

  return getFuncParams(funcDef);
}

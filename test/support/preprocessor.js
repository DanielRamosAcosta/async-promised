const tsc = require('typescript');

const babel = require('babel-core');
const es2015 = require('babel-preset-es2015');

var needsBabelTransiplation = false;

try {
  eval('function foo(...args) {}');
} catch (err) {
  needsBabelTransiplation = true;
}

module.exports = {
  process: function(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      var es6Code = tsc.transpile(
        src,
        {
          target: tsc.ScriptTarget.ES6,
          module: tsc.ModuleKind.CommonJS
        },
        path,
        []
      );

      if (!needsBabelTransiplation) {
        return es6Code;
      }
      return babel.transform(es6Code, {
        presets: [es2015],
        retainLines: true
      }).code;
    }
    return src;
  }
};

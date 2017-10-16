const { src, dest, parallel, series } = require('gulp')
const ts                              = require('gulp-typescript')
const replace                         = require('gulp-replace')
const jsonTransform                   = require('gulp-json-transform')
const babel                           = require('gulp-babel')
const rollup                          = require('rollup-stream');
const sourcemaps                      = require('gulp-sourcemaps');
const source                          = require('vinyl-source-stream');
const buffer                          = require('vinyl-buffer');
const nodeResolve                     = require('rollup-plugin-node-resolve');
const babelRollup                     = require('rollup-plugin-babel');
const uglify                          = require('gulp-uglify');
const rename                          = require('gulp-rename');
const clone                           = require('gulp-clone')

const cloneSink = clone.sink();

const buildES = () => src('./lib/*.ts')
  .pipe(ts({
    target: 'ES6',
    module: 'es2015',
    strict: true,
    declaration: true
  }))
  .pipe(replace("from 'async'", "from 'async-es'"))
  .pipe(dest('./build-es'))

const buildCommonJS = () => src('./lib/*.ts')
  .pipe(ts({
    target: 'ES6',
    module: 'es2015',
    strict: true,
    declaration: true
  }))
  .pipe(babel({
    plugins: [
      'add-module-exports',
      'transform-es2015-modules-commonjs'
    ],
    ignore: '*.d.ts'
  }))
  .pipe(dest('./build'))

const buildBundle = () => rollup({
    input: './build-es/index.js',
    format: 'umd',
    name: 'async',
    plugins: [
      nodeResolve(),
      babelRollup({
        exclude: 'node_modules/**',
        presets: [
          ['es2015', {"modules": false}]
        ]
      })
    ],
    output: {
      file: 'async.js'
    }
  })
  .pipe(source('async.js'))
  .pipe(buffer())
  .pipe(cloneSink)
  .pipe(sourcemaps.init())
  .pipe(uglify())
  .pipe(rename('async.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(cloneSink.tap())
  .pipe(dest('./build/dist'))
  .pipe(dest('./dist'));

const copyDistFiles = output => () => src([
    './CHANGELOG.md',
    './README.md',
    './LICENSE'
  ])
  .pipe(dest(output))

const syncEsPackage = () => src('./package.json')
  .pipe(jsonTransform((data, file) => ({
    ...data,
    name: 'async-promised-es',
    main: 'index.js',
    dependencies: {
      'async-es': data.dependencies['async-es']
    }
  }), 2))
  .pipe(dest('./build-es'))

const syncCJSPackage = () => src('./package.json')
  .pipe(jsonTransform((data, file) => ({
    ...data,
    dependencies: {
      'async': data.dependencies['async']
    }
  }), 2))
  .pipe(dest('./build'))

const buildEsConfig = parallel(
  copyDistFiles('./build-es'),
  syncEsPackage
)

const buildConfig = parallel(
  copyDistFiles('./build'),
  syncCJSPackage
)

module.exports = {
  'build-es': buildES,
  'build-es-config': buildEsConfig,
  'build': buildCommonJS,
  'build-config': buildConfig,
  'build-bundle': buildBundle,
  build: parallel(
    series(parallel(buildES, buildEsConfig), buildBundle),
    parallel(buildCommonJS, buildConfig)
  )
}

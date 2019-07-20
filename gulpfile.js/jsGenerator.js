const env = ((process.env.NODE_ENV || 'development').trim().toLowerCase());
const devBuild = env === 'development';

const gulp = require('gulp');
const noop = require('gulp-noop');
const uglify = require('gulp-uglify-es').default;
const through = require('through2');
const sourcemaps = devBuild ? require('gulp-sourcemaps') : null;
const globby = require('globby');
const size = require('gulp-size');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const log = require('gulplog');
const browserify = require('browserify');
const rename = require("gulp-rename");

function jsGenerator(customSetting) {
  const defaultSetting = {
    dest: '',
    entry: '',
    src: [],
    watch: [],
  };

  let setting = {
    ...defaultSetting,
    ...customSetting,
  };

  const watchFiles = [
    ...setting.src,
  ];

  function generateJsModule(cb) {
    gulp.src(setting.src)
      .pipe(devBuild ? noop() : uglify())
      .pipe(size({ showFiles: true }))
      .pipe(gulp.dest(`${setting.dest}/modules`));

    cb();
  };

  function generateJsBundle(cb) {
    const bundledStream = through();

    bundledStream
      .pipe(source(setting.entry))
      .pipe(buffer())
      .pipe(sourcemaps ? sourcemaps.init() : noop())
      .pipe(devBuild ? noop() : uglify())
      .on('error', log.error)
      .pipe(rename({dirname: ''}))
      .pipe(sourcemaps ? sourcemaps.write('./maps') : noop())
      .pipe(size({ showFiles: true }))
      .pipe(gulp.dest(`${setting.dest}/bundles`));

    globby(setting.entry).then(entries => {
      const b = browserify({
        entries,
        debug: true,
      });

      b
        .transform("babelify", {
          presets: ["@babel/preset-env"]
        })
        .bundle()
        .pipe(bundledStream);
    }).catch(err => {
      bundledStream.emit('error', err);
    });

    cb();
  };

  return {
    generateJsModule,
    generateJsBundle,
    watch(cb) {
      gulp.watch(watchFiles, generateJsModule);
      gulp.watch(watchFiles, generateJsBundle);

      cb();
    },
  };
};

module.exports = jsGenerator;

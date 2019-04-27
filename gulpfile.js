// development or production
const env = ((process.env.NODE_ENV || 'development').trim().toLowerCase());
const devBuild = env === 'development';

// directory locations
const dir = {
  src: 'src/',
  build: 'build/',
};

// global modules
const gulp = require('gulp');
const noop = require('gulp-noop');
const newer = require('gulp-newer');
const size = require('gulp-size');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const sourcemaps = devBuild ? require('gulp-sourcemaps') : null;
const browsersync = devBuild ? require('browser-sync').create() : null;
const postcssAssets = require('postcss-assets');
const autoprefixer = require('autoprefixer');
const usedcss = require('usedcss');
const cssnano = require('cssnano');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var globby = require('globby');
var through = require('through2');
var log = require('gulplog');
var uglify = require('gulp-uglify-es').default;

console.log('Gulp', devBuild ? 'development' : 'production', 'build');

// images task
const imgConfig = {
  src: `${dir.src}images/**/*`,
  build: `${dir.build}images/`,
  minOptions: {
    optimizationLevel: 5,
  },
};

function images(cb) {
  gulp.src(imgConfig.src)
    .pipe(newer(imgConfig.build))
    .pipe(imagemin(imgConfig.minOptions))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(imgConfig.build));

  cb();
};

// css task
const cssConfig = {
  src: `${dir.src}scss/main.scss`,
  watch: `${dir.src}scss/**/*`,
  build: `${dir.build}css/`,
  sassOptions: {
    sourceMap: devBuild,
    outputStyle: 'nested',
    imagePath: '/images/',
    precision: 3,
    errLogToConsole: true,
  },
  postCssOptions: [
    postcssAssets({
      loadPath: ['images/'],
      basePath: dir.build,
    }),
    autoprefixer({
      browsers: ['> 1%'],
    }),
  ],
};

// remove unused selectors and minify production CSS
if (!devBuild) {
  cssConfig.postCssOptions.push(usedcss({ html: ['index.html'] }));
  cssConfig.postCssOptions.push(cssnano);
}

function css(cb) {
  gulp.src(cssConfig.src)
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass(cssConfig.sassOptions).on('error', sass.logError))
    .pipe(postcss(cssConfig.postCssOptions))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(cssConfig.build))
    .pipe(browsersync ? browsersync.reload({ stream: true }) : noop())

  cb();
};

// browser-sync task
const syncConfig = {
  server: {
    baseDir: './',
    index: 'index.html',
  },
  port: 8000,
  files: `${dir.build}**/*`,
  open: false,
};

function sync(cb) {
  browsersync ? browsersync.init(syncConfig) : null;
  cb();
};

gulp.watch(imgConfig.src, images);
gulp.watch(cssConfig.watch, css);


// JavaScript
const jsConfig = {
  src: `${dir.src}/js/index.js`,
  watch: `${dir.src}js/**/*`,
  build: `${dir.build}js/`,
};

function js(cb) {
  const bundledStream = through();

  bundledStream
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps ? sourcemaps.init() : noop())
      .pipe(uglify())
      .on('error', log.error)
    .pipe(sourcemaps ? sourcemaps.write('./maps') : noop())
    .pipe(gulp.dest(jsConfig.build));

  globby([jsConfig.src]).then(entries => {
    const b = browserify({
      entries,
      debug: true,
    });

    b.bundle().pipe(bundledStream);
  }).catch(err => {
    bundledStream.emit('error', err);
  });

  cb();
};

exports.images = images;
exports.css = gulp.series(css, images);
exports.sync = sync;
exports.js = js;
exports.default = gulp.series(css, sync);

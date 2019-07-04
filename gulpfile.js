// development or production
const env = ((process.env.NODE_ENV || 'development').trim().toLowerCase());
const devBuild = env === 'development';

// assets directory locations
const assetsDir = {
  src: 'src/',
  dest: 'www/assets/',
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

const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const globby = require('globby');
const through = require('through2');
const log = require('gulplog');
const uglify = require('gulp-uglify-es').default;
const gzip = require('gulp-gzip');

const rename = require("gulp-rename");
const htmlmin = require('gulp-htmlmin');
const strip = require('gulp-strip-comments');
const hb = require('gulp-hb');
const data = require('gulp-data');
const frontMatter = require('gulp-front-matter');

console.log('Gulp', devBuild ? 'development' : 'production', 'dest');

// images task
const imgConfig = {
  src: `${assetsDir.src}images/**/*`,
  dest: `${assetsDir.dest}images/`,
  minOptions: {
    optimizationLevel: 5,
  },
};

function images(cb) {
  gulp.src(imgConfig.src)
    .pipe(newer(imgConfig.dest))
    .pipe(imagemin(imgConfig.minOptions))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(imgConfig.dest));

  cb();
};

// css task
const cssConfig = {
  src: `${assetsDir.src}scss/main.scss`,
  watch: `${assetsDir.src}scss/**/*`,
  dest: `${assetsDir.dest}css/`,
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
      basePath: assetsDir.dest,
    }),
    autoprefixer({
      browsers: ['> 1%'],
    }),
  ],
};

// remove unused selectors and minify production CSS
if (!devBuild) {
  cssConfig.postCssOptions.push(usedcss({ html: ['www/*.html', 'www/**/*.html'] }));
  cssConfig.postCssOptions.push(cssnano);
}

function css(cb) {
  gulp.src(cssConfig.src)
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass(cssConfig.sassOptions).on('error', sass.logError))
    .pipe(postcss(cssConfig.postCssOptions))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(cssConfig.dest))
    .pipe(browsersync ? browsersync.reload({ stream: true }) : noop())

  cb();
};

// gzip assets
function gzipAssets(cb) {
  gulp.src([
    'www/**/*.js',
    'www/**/*.css',
    'www/**/*.html',
  ])
    .pipe(gzip({ threshold: '1kb' }))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest('www'));

  cb();
};

// Service worker
const serviceWorkerConfig = {
  src: `${assetsDir.src}/js/serviceWorker.js`,
  watch: `${assetsDir.src}js/serviceWorker.js`,
  dest: 'www',
};

function serviceWorker(cb) {
  gulp.src(serviceWorkerConfig.src)
    .pipe(devBuild ? noop() : uglify())
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(serviceWorkerConfig.dest));

  cb();
};

// JavaScript Module
const jsModuleConfig = {
  src: `${assetsDir.src}/js/**/*`,
  watch: `${assetsDir.src}js/**/*`,
  dest: `${assetsDir.dest}module/`,
};

function jsModule(cb) {
  gulp.src(jsModuleConfig.src)
    .pipe(devBuild ? noop() : uglify())
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(jsModuleConfig.dest));

  cb();
};

// JavaScript bundle for older browser
const jsBundleConfig = {
  src: `${assetsDir.src}/js/index.js`,
  watch: `${assetsDir.src}js/**/*`,
  dest: `${assetsDir.dest}js/`,
};

function jsBundle(cb) {
  const bundledStream = through();

  bundledStream
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(devBuild ? noop() : uglify())
    .on('error', log.error)
    .pipe(sourcemaps ? sourcemaps.write('./maps') : noop())
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(jsBundleConfig.dest));

  globby([jsBundleConfig.src]).then(entries => {
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

// HTML dan pages
// assets directory locations
const pagesDir = {
  src: './pages',
  dest: './www/',
};

function generatePages() {
  return gulp
    .src([
      `${pagesDir.src}/pages/*.{html,hbs}`,
      `${pagesDir.src}/pages/**/*.{html,hbs}`,
    ])

    // Load an associated JSON file per post.
    .pipe(data((file) => {
      try {
        return require(file.path.replace(/\.(html|hbs)/, '.json'));
      } catch (e) {
        return {};
      }
    }))

    // Parse front matter from post file.
    .pipe(frontMatter({
      property: 'data',
      remove: true,
    }))

    // Wrap the layout
    // Place it after front matter is removed
    .pipe(through.obj(function(file, _, cb) {
      if (file.isBuffer()) {
        const layoutName = file.data.layout || 'default';
        const layoutString = `layouts/${layoutName}`;

        const contentWithLayout =
          `{{#> ${layoutString} }}{{#*inline "content-block"}}` +
          file.contents.toString() +
          `{{/inline}}{{/${layoutString} }}`;

        file.contents = Buffer.from(contentWithLayout);
      }
      cb(null, file);
    }))

    // Main handlebars process
    .pipe(hb()
      .partials(`${pagesDir.src}/partials/**/*.{html,hbs}`)
      .helpers(`${pagesDir.src}/helpers/*.js`)
      .data([`${pagesDir.src}/data/*.{js,json}`])
    )
    .pipe(rename(function (path) {
      path.extname = ".html";
    }))

    // Optimization
    .pipe(strip())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(size({ showFiles: true }))

    .pipe(gulp.dest(pagesDir.dest));
};

// browser-sync task
const syncConfig = {
  server: {
    baseDir: './www/',
    index: 'index.html',
  },
  port: 8000,
  files: `./www/**/*`,
  open: false,
};

function sync(cb) {
  browsersync ? browsersync.init(syncConfig) : null;
  cb();
};


// watch
gulp.watch(imgConfig.src, images);
gulp.watch(cssConfig.watch, css);
gulp.watch(serviceWorkerConfig.watch, serviceWorker);
gulp.watch(jsModuleConfig.watch, jsModule);
gulp.watch(jsBundleConfig.watch, jsBundle);
gulp.watch(`${pagesDir.src}/**/*.*`, generatePages);

const generateAssets = gulp.series(gulp.parallel(images, css, serviceWorker, jsModule, jsBundle), gzipAssets);

exports.images = images;
exports.css = gulp.series(css, images);
exports.sync = sync;
exports.gzipAssets = gzipAssets;
exports.serviceWorker = serviceWorker;
exports.jsModule = jsModule;
exports.jsBundle = jsBundle;
exports.generatePages = generatePages;
exports.generateAssets = generateAssets;
exports.default = gulp.series(generatePages, generateAssets, sync);

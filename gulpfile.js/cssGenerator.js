const env = ((process.env.NODE_ENV || 'development').trim().toLowerCase());
const devBuild = env === 'development';

const gulp = require('gulp');
const size = require('gulp-size');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const sourcemaps = devBuild ? require('gulp-sourcemaps') : null;
const postcssAssets = require('postcss-assets');
const autoprefixer = require('autoprefixer');
const usedcss = require('usedcss');
const cssnano = require('cssnano');

const defaultSetting = {
  dest: '',
  imagePath: 'images/',
  src: [],
  watch: [],
};

function cssGenerator(customSetting) {
  let setting = {
    ...defaultSetting,
    ...customSetting,
  };

  setting = {
    ...setting,
    sassOptions: {
      sourceMap: devBuild,
      outputStyle: 'nested',
      imagePath: setting.imagePath,
      precision: 3,
      errLogToConsole: true,
    },
    postCssOptions: [
      postcssAssets({
        loadPath: [setting.imagePath],
        basePath: setting.dest,
      }),
      autoprefixer({
        browsers: ['> 1%'],
      }),
    ],
  };

  // minify production CSS
  if (!devBuild) {
    cssConfig.postCssOptions.push(cssnano);
  }

  const watchFiles = [
    ...setting.src,
    ...setting.watch,
  ];

  return {
    generate() {
      generateCss(setting);
    },
    watch() {
      gulp.watch(watchFiles, () => generateCss(setting));
    },
  };
};

function generateCss(setting) {
  return gulp
    .src(setting.src)
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass(setting.sassOptions).on('error', sass.logError))
    .pipe(postcss(setting.postCssOptions))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(setting.dest));
};

module.exports = cssGenerator;

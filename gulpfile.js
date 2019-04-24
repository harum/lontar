// development or production
const env = ((process.env.NODE_ENV || 'development').trim().toLowerCase());
const devBuild = env === 'development';

// directory locations
const dir = {
  src: 'src/',
  build: 'build/',
};

// modules
const gulp = require('gulp');
const noop = require('gulp-noop');
const newer = require('gulp-newer');
const size = require('gulp-size');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const sourcemaps = devBuild ? require('gulp-sourcemaps') : null;
const browsersync = devBuild ? require('browser-sync').create() : null;

console.log('Gulp', devBuild ? 'development' : 'production', 'build');

// images task
const imgConfig = {
  src: `${dir.src}images/**/*`,
  build: `${dir.build}images/`,
  minOpts: {
    optimizationLevel: 5,
  },
};

function images() {
  return gulp.src(imgConfig.src)
    .pipe(newer(imgConfig.build))
    .pipe(imagemin(imgConfig.minOpts))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(imgConfig.build));
};

exports.images = images;

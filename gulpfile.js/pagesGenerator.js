const gulp = require('gulp');
const noop = require('gulp-noop');
const through = require('through2');

const rename = require("gulp-rename");
const htmlmin = require('gulp-htmlmin');
const strip = require('gulp-strip-comments');
const hb = require('gulp-hb');
const data = require('gulp-data');
const frontMatter = require('gulp-front-matter');

// generate pages from partial
// using handlerbar

const defaultSetting = {
  dest: '',
  src: [],
  partials: [],
  helpers: [],
  data: [],
};

function pagesGenerator(customSetting) {
  const setting = {
    ...defaultSetting,
    ...customSetting,
  };

  const watchFiles = [
    ...setting.src,
    ...setting.partials,
    ...setting.helpers,
    ...setting.data,
  ];

  return {
    generate() {
      generatePages(setting);
    },
    watch() {
      gulp.watch(watchFiles, () => generatePages(setting));
    },
  };
};

function generatePages(setting) {
  return gulp
    .src(setting.src)

    // Load data that will be used in page
    // Load an associated JSON file per page.
    .pipe(setting.data.length === 0 ? noop() : data((file) => {
      try {
        return require(file.path.replace(/\.(html|hbs)/, '.json'));
      } catch (e) {
        return {};
      }
    }))
    // Parse front matter from page.
    .pipe(frontMatter({
      property: 'data',
      remove: true,
    }))
    // End of - Load data that will be used in page

    // Layout handler
    // Wrap content inside layout
    // Use suitable layout if include in front matter
    // Only place it after front matter is removed
    .pipe(through.obj(function(file, _, cb) {
      if (file.isBuffer()) {
        let layout = file.data.layout;
        if (!layout) {
          cb(null, file);
          return;
        }

        layout = `layouts/${layout}`;
        const contentWithLayout =
          `{{#> ${layout} }}{{#*inline "content-block"}}` +
          file.contents.toString() +
          `{{/inline}}{{/${layout} }}`;

        file.contents = Buffer.from(contentWithLayout);
      }
      cb(null, file);
    }))
    // End of - Layout handler

    // Main handlebars process
    .pipe(hb()
      .partials(setting.src.partials)
      .helpers(setting.src.helpers)
      .data(setting.src.data)
    )
    .pipe(rename(function (path) {
      path.extname = ".html";
    }))
    // End of - Main handlebars process

    .pipe(gulp.dest(setting.dest));
};

module.exports = pagesGenerator;

const gulp = require('gulp');
const pagesGenerator = require('./pagesGenerator');
const cssGenerator = require('./cssGenerator');
const jsGenerator = require('./jsGenerator');

function designSystem() {
  const pageSetting = {
    dest: 'projects/designSystem/www',
    src: ['projects/designSystem/docs/*.{html,hbs}'],
    partials: [
      'projects/designSystem/docs/partials/*.{html,hbs}',
      'projects/designSystem/docs/partials/**/*.{html,hbs}',
    ],
  };

  const cssSetting = {
    dest: 'projects/designSystem/www/assets/css',
    src: ['projects/designSystem/scss/*.scss'],
    watch: ['projects/designSystem/scss/**/*.scss'],
  };

  const jsSetting = {
    dest: 'projects/designSystem/www/assets/js',
    src: ['projects/designSystem/js/**/*.js'],
    entry: 'projects/designSystem/js/index.js',
  };

  const page = pagesGenerator(pageSetting);
  const css = cssGenerator(cssSetting);
  const js = jsGenerator(jsSetting);

  return gulp.series(
    gulp.parallel(
      page.generatePage,
      css.generateCss,
      js.generateJsModule,
      js.generateJsBundle,
    ),
    gulp.parallel(
      page.watch,
      css.watch,
      js.watch,
    ),
  );
};

exports.designSystem = designSystem();

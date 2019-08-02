const gulp = require('gulp');
const designSystemGenerator = require('./designSystemGenerator');
const blogGenerator = require('./blogGenerator');
const landingPageGenerator = require('./landingPageGenerator');

exports.designSystem = designSystemGenerator();
exports.blog = blogGenerator();
exports.landingPage = landingPageGenerator();
exports.default = gulp.parallel(designSystemGenerator(), blogGenerator(), landingPageGenerator());

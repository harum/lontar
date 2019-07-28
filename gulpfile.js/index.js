const gulp = require('gulp');
const designSystemGenerator = require('./designSystemGenerator');
const blogGenerator = require('./blogGenerator');

exports.designSystem = designSystemGenerator();
exports.blog = blogGenerator();

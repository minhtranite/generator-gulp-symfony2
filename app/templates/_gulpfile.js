'use strict';

var gulp = require('gulp');
var yaml = require('js-yaml');
var fs = require('fs');
var filter = require('gulp-filter');
<% if(use_compass){ %>
var compass = require('gulp-compass');
<% } %>
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var replace = require('gulp-replace');
var csso = require('gulp-csso');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var mainBowerFiles = require('main-bower-files');
var flatten = require('gulp-flatten');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var del = require('del');

var gulpSymfony2 = getConfigs();
var srcPath = 'app/Resources/public';
var destPath = 'web';

function getConfigs() {
  var configs = undefined;
  try {
    configs = yaml.safeLoad(fs.readFileSync('./gulp-symfony2.yml', 'utf8'));
  } catch (e) {
    console.error(e);
  }
  return configs;
}

function getFullPath(file) {
  return srcPath + '/' + file;
}

gulp.task('getConfigs', function () {
  gulpSymfony2 = getConfigs();
});

gulp.task('styles', ['getConfigs'], function () {
  if(typeof gulpSymfony2.styles !== 'object'){
    return;
  }
  for (var destFile in gulpSymfony2.styles) {
    if (gulpSymfony2.styles[destFile] !== null && gulpSymfony2.styles[destFile].length > 0) {
      var src = gulpSymfony2.styles[destFile].map(function (file) {
        return getFullPath(file);
      });
      var scssFilter = filter('**/*.scss');
      gulp.src(src)
      <% if(use_compass){ %>
        .pipe(scssFilter)
        .pipe(compass({
          config_file: './config.rb',
          sass: srcPath + '/styles',
          css: srcPath + '/styles',
          bundle_exec: <%= use_bundler %>
        }))
        .on('error', function (error) {
          console.error(error.toString());
          this.emit('end');
        })
        .pipe(scssFilter.restore())
      <% } %>
        .pipe(concat(destFile))
        .pipe(autoprefixer('last 1 version'))
        .pipe(replace(/([\/\w\._-]+\/)*([\w\._-]+\.(ttf|eot|woff|svg))/g, '../fonts/$2'))
        .pipe(csso())
        .pipe(gulp.dest(destPath + '/styles'));
    }
  }
});

gulp.task('scripts', ['getConfigs'], function () {
  if(typeof gulpSymfony2.scripts !== 'object'){
    return;
  }
  for (var destFile in gulpSymfony2.scripts) {
    if (gulpSymfony2.scripts[destFile] !== null && gulpSymfony2.scripts[destFile].length > 0) {
      var src = gulpSymfony2.scripts[destFile].map(function (file) {
        return getFullPath(file);
      });
      var customScriptsFilter = filter(function (file) {
        var path = file.path;
        var ignore = srcPath + '/vendor';
        return path.indexOf(ignore) === -1;
      });
      gulp.src(src)
        .pipe(customScriptsFilter)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(customScriptsFilter.restore())
        .pipe(concat(destFile))
        .pipe(uglify())
        .pipe(gulp.dest(destPath + '/scripts'));
    }
  }
});

gulp.task('images', function () {
  return gulp.src(srcPath + '/images/**/*')
    .pipe(imagemin({
      optimizationLevel: 3,
      interlaced: true
    }))
    .pipe(gulp.dest(destPath + '/images'))
});

gulp.task('fonts', function () {
  var files = mainBowerFiles();
  if (files.length > 0) {
    gulp.src(files)
      .pipe(filter('**/*.{eot,svg,ttf,woff}'))
      .pipe(flatten())
      .pipe(gulp.dest(destPath + '/fonts'));
  }
  gulp.src('app/fonts/**/*')
    .pipe(filter('**/*.{eot,svg,ttf,woff}'))
    .pipe(flatten())
    .pipe(gulp.dest(destPath + '/fonts'));
});

gulp.task('clean', function () {
  del([destPath + '/styles/**/*', destPath + '/scripts/**/*']);
});

gulp.task('clean:force', function () {
  del([
    destPath + '/styles/**/*',
    destPath + '/scripts/**/*',
    destPath + '/fonts/**/*',
    destPath + '/images/**/*'
  ]);
});

gulp.task('build', ['clean'], function () {
  runSequence('styles', 'scripts', 'images', 'fonts');
});

gulp.task('watch', function () {
  gulp.watch(srcPath + '/styles/**/*', ['styles']);
  gulp.watch(srcPath + '/scripts/**/*', ['scripts']);
  gulp.watch(srcPath + '/images/**/*', ['images']);
  gulp.watch(srcPath + '/fonts/**/*', ['fonts']);
  gulp.watch('gulp-symfony2.yml', ['build']);
});

gulp.task('serve', ['build','watch'], function () {
  browserSync.instance = browserSync.init([
    srcPath + '/../views/**/*.twig',
    destPath + '/**/*'
  ], {
    startPath: '/app_dev.php',
    proxy: "<%= app_domain %>"
  });
});

gulp.task('default', function () {
  gulp.start('build');
});
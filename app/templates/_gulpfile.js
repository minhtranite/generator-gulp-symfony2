'use strict';

var gulp = require('gulp');
var yaml = require('js-yaml');
var fs = require('fs');
var filter = require('gulp-filter');<% if(use_compass){ %>
var compass = require('gulp-compass');<% } %>
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
var cached = require('gulp-cached');
var remember = require('gulp-remember');
var newer = require('gulp-newer');
var mux = require('gulp-mux');
var diff = require('deep-diff').diff;
var path = require('path');
var beeper = require('beeper');
var chalk = require('chalk');
var gulpIf = require('gulp-if');

function getConfigs() {
  var configs;
  try {
    configs = yaml.safeLoad(fs.readFileSync('./gulp-symfony2.yml', 'utf8'));
  } catch (e) {
    console.error(chalk.red('Can\'t get configs'));
    console.error(e);
  }
  return configs;
}

var appDir = 'app';
var appPublicDir = appDir + '/Resources/public';
var srcDir = 'src';
var destDir = 'web';
var minify = false;
var oldConfigs = getConfigs();

function getAbsolutePath(mPath, isFile) {
  mPath = path.normalize(mPath);
  if (!fs.existsSync(mPath) || (isFile && !fs.statSync(mPath).isFile())) {
    console.error(chalk.red((isFile ? 'File ' : '') + '\'' + mPath + '\' does\'t exist.'));
    beeper();
    return undefined;
  }
  return fs.realpathSync(mPath);
}

function getDestFiles(objectName, file) {
  var configs = getConfigs();
  var destFiles = [];
  var object = configs[objectName];
  if (typeof configs[objectName] !== 'object') {
    return destFiles;
  }
  for (var destFile in object) {
    if (object[destFile] !== null && object[destFile].length > 0) {
      for (var i = 0; i < object[destFile].length; i++) {
        var currentFile = getAbsolutePath(object[destFile][i]);
        if (currentFile === file) {
          destFiles.push(destFile);
        }
      }
    }
  }
  return destFiles;
}

gulp.task('styles', function () {
  var configs = getConfigs();
  if (typeof configs.styles !== 'object') {
    return;
  }

  var targets = [];
  var constants = {
    destFile: '{{targetName}}'
  };
  var task = function (constant) {
    var src = configs.styles[constant.destFile].map(function (file) {
      return getAbsolutePath(file, true);
    });<% if(use_compass){ %>
    var scssFilter = filter('**/*.scss');<% } %>
    gulp.src(src)
      .pipe(cached(constant.destFile))<% if(use_compass){ %>
      .pipe(scssFilter)
      .pipe(compass({
        config_file: './config.rb', // jshint ignore:line
        sass: appPublicDir + '/styles',
        css: appPublicDir + '/.styles',
        logging: false,
        bundle_exec: <%= use_bundler %> // jshint ignore:line
      }))
      .on('error', function (error) {
        console.error(error.toString());
        this.emit('end');
      })
      .pipe(scssFilter.restore())<% } %>
      .pipe(remember(constant.destFile))
      .pipe(newer(destDir + '/styles/' + constant.destFile))
      .pipe(concat(constant.destFile))
      .pipe(autoprefixer('last 1 version'))
      .pipe(replace(/([\/\w\._-]+\/)*([\w\._-]+\.(ttf|eot|woff|svg))/g, '../fonts/$2'))
      .pipe(replace(/([\/\w\._-]+\/)*([\w\._-]+\.(png|jpg|gif))/g, '../images/$2'))
      .pipe(gulpIf(minify, csso()))
      .pipe(gulp.dest(destDir + '/styles'));
  };

  for (var destFile in configs.styles) {
    if (configs.styles[destFile] !== null && configs.styles[destFile].length > 0) {
      targets.push(destFile);
    }
  }
  return mux.createAndRunTasks(gulp, task, 'style', targets, '', constants);
});

gulp.task('scripts', function () {
  var configs = getConfigs();
  if (typeof configs.scripts !== 'object') {
    return;
  }

  var targets = [];
  var constants = {
    destFile: '{{targetName}}'
  };
  var task = function (constant) {
    var src = configs.scripts[constant.destFile].map(function (file) {
      return getAbsolutePath(file, true);
    });
    var customScriptsFilter = filter(function (file) {
      var path = file.path;
      var ignore = appPublicDir + '/vendor';
      return path.indexOf(ignore) === -1;
    });
    gulp.src(src)
      .pipe(cached(constant.destFile))
      .pipe(customScriptsFilter)
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(customScriptsFilter.restore())
      .pipe(remember(constant.destFile))
      .pipe(newer(destDir + '/scripts/' + constant.destFile))
      .pipe(concat(constant.destFile))
      .pipe(gulpIf(minify, uglify()))
      .pipe(gulp.dest(destDir + '/scripts'));
  };

  for (var destFile in configs.scripts) {
    if (configs.scripts[destFile] !== null && configs.scripts[destFile].length > 0) {
      targets.push(destFile);
    }
  }
  return mux.createAndRunTasks(gulp, task, 'script', targets, '', constants);
});

gulp.task('images', function () {
  var sources = [
    appPublicDir + '/images/**/*.{png,jpg,gif}',
    appPublicDir + '/vendor/**/*.{png,jpg,gif}'
  ];
  return gulp.src(sources)
    .pipe(cached('images'))
    .pipe(gulpIf(minify, imagemin({
      optimizationLevel: 3,
      interlaced: true
    })))
    .pipe(flatten())
    .pipe(gulp.dest(destDir + '/images'));
});

gulp.task('fonts', function () {
  var files = mainBowerFiles();
  files.push(appPublicDir + '/fonts/**/*');
  return gulp.src(files)
    .pipe(filter('**/*.{eot,svg,ttf,woff}'))
    .pipe(cached('fonts'))
    .pipe(flatten())
    .pipe(gulp.dest(destDir + '/fonts'));
});

gulp.task('clean', function () {
  del.sync([
    appPublicDir + '/.styles',
    destDir + '/styles/**/*',
    destDir + '/scripts/**/*',
    destDir + '/fonts/**/*',
    destDir + '/images/**/*'
  ]);
});

gulp.task('build', function (callback) {
  minify = true;
  runSequence('clean', 'styles', 'scripts', 'fonts', 'images', callback);
});

gulp.task('preServe', function (callback) {
  minify = false;
  runSequence('clean', 'styles', 'scripts', 'fonts', 'images', callback);
});

gulp.task('serve', ['preServe'], function () {
  browserSync({
    files: [appDir + '/**/*.twig', srcDir + '/**/*.twig', destDir + '/**/*'],
    startPath: '/app_dev.php',
    proxy: '<%= app_domain %>'
  });

  var stylesWatcher = gulp.watch(appPublicDir + '/styles/**/*', ['styles']);
  stylesWatcher.on('change', function (event) {
    if (event.type === 'deleted') {
      var destFiles = getDestFiles('styles', event.path);
      if (destFiles.length > 0) {
        destFiles.forEach(function (destFile) {
          delete cached.caches[destFile][event.path];
          remember.forget(destFile, event.path);
        });
      }
    }
    var arr = event.path.split('/');
    var file = arr.pop();
    if (file.indexOf('_') === 0) {
      var configs = getConfigs();
      var object = configs.styles;
      if (typeof object === 'object') {
        for (var destFile in object) {
          delete cached.caches[destFile];
          remember.forgetAll(destFile);
          del.sync(destDir + '/styles/' + destFile);
        }
      }
    }
  });
  var scriptsWatcher = gulp.watch(appPublicDir + '/scripts/**/*', ['scripts']);
  scriptsWatcher.on('change', function (event) {
    if (event.type === 'deleted') {
      var destFiles = getDestFiles('scripts', event.path);
      if (destFiles.length > 0) {
        destFiles.forEach(function (destFile) {
          delete cached.caches[destFile][event.path];
          remember.forget(destFile, event.path);
        });
      }
    }
  });
  var fontsWatcher = gulp.watch(appPublicDir + '/fonts/**/*', ['fonts']);
  fontsWatcher.on('change', function (event) {
    if (event.type === 'deleted') {
      delete cached.caches.fonts[event.path];
    }
  });
  var imagesWatcher = gulp.watch(appPublicDir + '/images/**/*', ['images']);
  imagesWatcher.on('change', function (event) {
    if (event.type === 'deleted') {
      delete cached.caches.images[event.path];
    }
  });
  gulp.watch('bower.json', ['fonts', 'images']);
  var gulpSymfony2Watcher = gulp.watch('gulp-symfony2.yml', ['styles', 'scripts']);
  gulpSymfony2Watcher.on('change', function () {
    var configs = getConfigs();
    var changes = diff(oldConfigs, configs);
    oldConfigs = configs;
    if (changes) {
      changes.forEach(function (change) {
        if ((change.kind === 'D' || change.kind === 'A') && change.path.length === 2) {
          var destFile = change.path[1];
          delete cached.caches[destFile];
          remember.forgetAll(destFile);
          del.sync(destDir + '/' + change.path[0] + '/' + destFile);
        }
      });
    }
  });
});

gulp.task('default', function () {
  gulp.start('build');
});
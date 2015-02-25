'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
    this.appDomain = 'localhost';
    this.cssPreprocessor = 'None';
    this.useCompass = false;
    this.useBundle = false;
    this.cssPreprocessorPlugin = 'none'
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('Gulp Symfony2') + ' generator!'
    ));

    //noinspection JSCheckFunctionSignatures
    var prompts = [
      {
        name: 'appName',
        message: 'What is your app\'s name ?',
        default: path.basename(this.destinationRoot())
      },
      {
        name: 'appDomain',
        message: 'What is your app\'s domain ?',
        default: 'localhost'
      },
      {
        name: 'cssPreprocessor',
        message: 'Choose the CSS preprocessor you need',
        type: 'list',
        choices: ['Sass', 'Less', 'None'],
        default: 'Sass'
      },
      {
        name: 'useCompass',
        message: 'Do you want use Compass ?',
        type: 'confirm',
        default: true,
        when: function (props) {
          return props.cssPreprocessor == 'Sass';
        }
      },
      {
        name: 'useBundle',
        message: 'Do you want use Bundle (http://bundler.io) ?',
        type: 'confirm',
        default: true,
        when: function (props) {
          return props.useCompass;
        }
      }
    ];

    this.prompt(prompts, function (props) {
      this.appName = props.appName;
      this.appDomain = props.appDomain;
      this.cssPreprocessor = props.cssPreprocessor;
      this.useCompass = !props.useCompass ? false : props.useCompass;
      this.useBundle = !props.useBundle ? false : props.useBundle;
      if (this.cssPreprocessor === 'Less') {
        this.cssPreprocessorPlugin = 'less';
      } else if (this.cssPreprocessor === 'Sass') {
        this.cssPreprocessorPlugin = this.useCompass ? 'compass' : 'sass';
      }
      done();
    }.bind(this));
  },

  writing: {
    app: function () {
      this.mkdir('app/Resources/public/styles');
      this.mkdir('app/Resources/public/scripts');
      this.mkdir('app/Resources/public/fonts');
      this.mkdir('app/Resources/public/images');
      this.mkdir('app/Resources/public/vendor');
      this.mkdir('.bundle');

      this.fs.copy(
        this.templatePath('scripts/_bar.js'),
        this.destinationPath('app/Resources/public/scripts/bar.js')
      );
      if (this.cssPreprocessor == 'Sass') {
        this.fs.copyTpl(
          this.templatePath('styles/_bar.scss'),
          this.destinationPath('app/Resources/public/styles/bar.scss'),
          {use_compass: this.useCompass}
        );
      } else {
        if (this.cssPreprocessor == 'Less') {
          this.fs.copy(
            this.templatePath('styles/_bar.less'),
            this.destinationPath('app/Resources/public/styles/bar.less')
          );
        } else {
          this.fs.copy(
            this.templatePath('styles/_bar.css'),
            this.destinationPath('app/Resources/public/styles/bar.css')
          );
        }
      }
      this.fs.copy(
        this.templatePath('images/_yeoman.png'),
        this.destinationPath('app/Resources/public/images/yeoman.png')
      );
      this.fs.copy(
        this.templatePath('fonts/**/*'),
        this.destinationPath('app/Resources/public/fonts')
      );
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          app_name: this.appName,
          css_preprocessor_plugin: this.cssPreprocessorPlugin
        }
      );
      this.fs.copyTpl(
        this.templatePath('_bower.json'),
        this.destinationPath('bower.json'),
        {app_name: this.appName}
      );
      this.fs.copyTpl(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
      this.fs.copyTpl(
        this.templatePath('_gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        {
          css_preprocessor: this.cssPreprocessor,
          css_preprocessor_plugin: this.cssPreprocessorPlugin,
          use_compass: this.useCompass,
          use_bundle: this.useBundle,
          app_domain: this.appDomain
        }
      );
      this.fs.copyTpl(
        this.templatePath('_gulp-symfony2.yml'),
        this.destinationPath('gulp-symfony2.yml'),
        {css_preprocessor: this.cssPreprocessor}
      );
      if (this.useCompass) {
        this.fs.copyTpl(
          this.templatePath('_config.rb'),
          this.destinationPath('config.rb')
        );
        if (this.useBundle) {
          this.fs.copy(
            this.templatePath('bundle/config'),
            this.destinationPath('.bundle/config')
          );
          this.fs.copyTpl(
            this.templatePath('_Gemfile'),
            this.destinationPath('Gemfile')
          );
        }
      }
    },

    projectfiles: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      this.fs.copy(
        this.templatePath('jshintrc'),
        this.destinationPath('.jshintrc')
      );
      if (this.fs.exists('.gitignore')) {
        var contents = this.fs.read('.gitignore', {defaults: ''});
        contents = contents + "\n.sass-cache\nnode_modules\napp/Resources/public/.styles\napp/Resources/public/vendor/\nbundle";
        this.fs.write('.gitignore', contents);
      } else {
        this.fs.copy(
          this.templatePath('gitignore'),
          this.destinationPath('.gitignore')
        );
      }
    }
  },

  install: function () {
    var commands = 'npm install && bower install';
    if (this.useCompass && this.useBundle) {
      commands += ' && bundle install';
    }
    this.log('Running ' + chalk.yellow.bold(commands) + ' for you to install required dependencies. If this fails, try running the command yourself.');
    //noinspection JSCheckFunctionSignatures
    this.npmInstall();
    //noinspection JSCheckFunctionSignatures
    this.bowerInstall();
    if (this.useCompass && this.useBundle) {
      this.spawnCommand('bundle', ['install']);
    }
  }
});
'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
    this.useCompass = false;
    this.useBundler = false;
    this.appDomain = 'localhost';
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('Gulp Symfony2') + ' generator!'
    ));

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
        name: 'useCompass',
        message: 'Do you want use Compass ?',
        type: 'confirm',
        default: false
      },
      {
        name: 'useBundler',
        message: 'Do you want use Bundler ?',
        type: 'confirm',
        default: false,
        when: function (props) {
          return props.useCompass;
        }
      }
    ];

    this.prompt(prompts, function (props) {
      this.appName = props.appName;
      this.appDomain = props.appDomain;
      this.useCompass = props.useCompass;
      this.useBundler = !props.useBundler ? false : props.useBundler;
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

      this.fs.copy(
        this.templatePath('scripts/_bar.js'),
        this.destinationPath('app/Resources/public/scripts/bar.js')
      );
      if(this.useCompass){
        this.fs.copy(
          this.templatePath('styles/_bar.scss'),
          this.destinationPath('app/Resources/public/styles/bar.scss')
        );
      }else{
        this.fs.copy(
          this.templatePath('styles/_bar.css'),
          this.destinationPath('app/Resources/public/styles/bar.css')
        );
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
        {app_name: this.appName, use_compass: this.useCompass}
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
          use_compass: this.useCompass,
          use_bundler: this.useBundler,
          app_domain: this.appDomain
        }
      );
      this.fs.copyTpl(
        this.templatePath('_gulp-symfony2.yml'),
        this.destinationPath('gulp-symfony2.yml'),
        {use_compass: this.useCompass}
      );
      if (this.useCompass) {
        this.fs.copyTpl(
          this.templatePath('_config.rb'),
          this.destinationPath('config.rb')
        );
        if (this.useBundler) {
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
        contents = contents + "\n.sass-cache\n.tmp\nnode_modules\napp/Resources/public/styles/.*";
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
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});

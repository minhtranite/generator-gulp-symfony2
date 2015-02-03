# generator-gulp-symfony2 [![Build Status](https://secure.travis-ci.org/vn38minhtran/generator-gulp-symfony2.png?branch=master)](https://travis-ci.org/vn38minhtran/generator-gulp-symfony2)

> [Yeoman](http://yeoman.io) generator

## Change logs:

###### 1.0.2:

- Use 'gulp-newer' instead of 'gulp-changed'.
- Fix concat missing files (update).

###### 1.0.1:

- Fix concat missing files.
- Move compass temporary files to 'app/Resources/public/.styles'.
- Only minify when build.

###### 1.0.0:

- Fix missing bower component images.
- Fix watch task.
- Use cache, only process file changed.
- Handle error.
- Performance improvements.
- Change file path in gulp-symfony.yml.

## Getting Started

### What is Yeoman?

Trick question. It's not a thing. It's this guy:

![](http://i.imgur.com/JHaAlBJ.png)

Basically, he wears a top hat, lives in your computer, and waits for you to tell him what kind of application you wish to create.

Not every new computer comes with a Yeoman pre-installed. He lives in the [npm](https://npmjs.org) package repository. You only have to ask for him once, then he packs up and moves into your hard drive. *Make sure you clean up, he likes new and shiny things.*

```bash
npm install -g yo
```

### Yeoman Generators

Yeoman travels light. He didn't pack any generators when he moved in. You can think of a generator like a plug-in. You get to choose what type of application you wish to create, such as a Backbone application or even a Chrome extension.

To install generator-gulp-symfony2 from npm, run:

```bash
npm install -g generator-gulp-symfony2
```

Finally, go to symfony2 root project and initiate the generator:

```bash
yo gulp-symfony2
```

### Directory structure

- [Symfony 2 template best practice](http://symfony.com/doc/current/best_practices/templates.html)
- [Symfony 2 web assets best practice](http://symfony.com/doc/current/best_practices/web-assets.html)

```
.
├── app
│   └── Resources
│       └── public
│           ├── fonts
│           │   └── roboto
│           │       ├── RobotoCondensed-Regular.eot
│           │       ├── RobotoCondensed-Regular.ttf
│           │       └── RobotoCondensed-Regular.woff
│           ├── images
│           │   └── yeoman.png
│           ├── scripts
│           │   └── bar.js
│           ├── styles
│           │   ├── bar.css
│           │   └── bar.scss
│           └── vendor
├── bower.json
├── config.rb
├── Gemfile
├── Gemfile.lock
├── gulpfile.js
├── gulp-symfony2.yml
├── node_modules
├── package.json
└── web
    ├── fonts
    │   ├── RobotoCondensed-Regular.eot
    │   ├── RobotoCondensed-Regular.ttf
    │   └── RobotoCondensed-Regular.woff
    ├── images
    │   └── yeoman.png
    ├── scripts
    │   └── foo.js
    └── styles
        └── foo.css
```

### How to use

`gulp-symfony2.yml`:

```yml
styles:
  foo.css:
    - app/Resources/public/styles/bar.scss
scripts:
  foo.js:
    - app/Resources/public/scripts/bar.js
```

Twig:

```
...
{% block stylesheets %}
  <link rel="stylesheet" href="/styles/foo.css">
{% endblock %}
...
{% block javascripts %}
  <script src="/scripts/foo.js"></script>
{% endblock %}
...
...
```

### Gulp task
Build:
```bash
gulp build
```

Watch & rebuild file changed (dev):
```bash
gulp serve
```

### Getting To Know Yeoman

Yeoman has a heart of gold. He's a person with feelings and opinions, but he's very easy to work with. If you think he's too opinionated, he can be easily convinced.

If you'd like to get to know Yeoman better and meet some of his friends, [Grunt](http://gruntjs.com) and [Bower](http://bower.io), check out the complete [Getting Started Guide](https://github.com/yeoman/yeoman/wiki/Getting-Started).

## License

MIT

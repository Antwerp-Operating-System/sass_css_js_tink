'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);


  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Semantic version options
  var bump = grunt.option('bump') || '';

  var currentversion = require('./package.json').version;

  if (bump !== '') {
    var semversion = require('semver');
    var nextversion = semversion.inc(currentversion, bump);
  } else {
    var nextversion = currentversion;
  }

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'framework',
    version: nextversion
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    autoprefixer: {
      options: {
        browsers: ['last 3 versions']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/'
        }]
      }
    },
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath: /\.\.\//
      },
      sass: {
        src: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/fonts',
        importPath: './bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/fonts',
        relativeAssets: true,
        assetCacheBuster: true,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          // root: '<%= yeoman.dist %>',
          cssDir: '.tmp',
          generatedImagesDir: 'images/generated',
          imagesDir: 'images',
          fontsDir: 'fonts'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>/scripts/directives',
            dest: '<%= yeoman.dist %>/scripts/directives',
            src: [
              '{,*/}*'
            ]
          },
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>/images/gui',
            dest: '<%= yeoman.dist %>/images/gui',
            src: [
              '{,*/}*'
            ]
          }
        ]
      },
      styles: {
        expand: true,
        cwd: '.tmp',
        dest: '<%= yeoman.dist %>/styles/',
        src: '*'
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['<%= yeoman.app %>/scripts/directives/*.js'],
        dest: '<%= yeoman.dist %>/scripts/tink-directives.js'
      }
    },
    uglify: {
      options: {
        mangle: false,
        banner: '/*! Tink v<%= yeoman.version %> */'
      },
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/tink-directives.min.js': ['<%= yeoman.dist %>/scripts/tink-directives.js']
        }
      }
    },
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        'compass:dist'
      ]
    },
    cssmin: {
      options: {
        banner: '/*! Tink v<%= yeoman.version %> */'
      },
      dist: {
        files: {
          '<%= yeoman.dist %>/styles/tink.min.css': [
            '.tmp/{,*/}*.css'
          ]
        }
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: /v(\d+)\.(\d+)\.(\d+)\./g,
              replacement: 'v<%= yeoman.version %>.'
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['README.md'], dest: ''}
        ]
      }
    },
    // Automatically inject Bower components into the app

    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },
    // Create production build
    exec: {
      'create-release-folder': 'mkdir -p <%= yeoman.dist %>/releases/tink-<%= yeoman.version %>',
      'copy-production-css-to-release-folder': 'find <%= yeoman.dist %>/styles/ -type f -name "tink.*.css" -exec cp "{}" <%= yeoman.dist %>/releases/tink-<%= yeoman.version %>/tink-<%= yeoman.version %>.css ";"',
      'create-production-zip-file': 'cd <%= yeoman.dist %>/releases && zip -rm tink-<%= yeoman.version %>.zip tink-<%= yeoman.version %>'
    }


  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean',
    'replace',
    'concat',
    'copy:dist',
    'uglify:dist',
    'concurrent:dist',
    'autoprefixer:dist',
    'cssmin',
    'copy:styles'

  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};

'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);


  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);



  // Semantic version options
  var bump = grunt.option('bump') || '';
  var currentversion = require('./package.json').version;
  var nextversion = currentversion;

  if (bump !== '') {
    var semversion = require('semver');
    nextversion = semversion.inc(currentversion, bump);
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
      sass: {
        // files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        files: ['<%= yeoman.app %>/styles/**/*.{scss,sass}'],
        tasks: ['sass:server', 'autoprefixer']
      },
      html: {
        files: ['<%= yeoman.app %>/templates/{,*/}*.{htm,html}'],
        tasks: ['ngtemplates']
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
          '.tmp/**/*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    ngtemplates:  {
      app:        {
        options: {
          module: 'tink.templates',
          standalone:true,
          htmlmin: {
            collapseBooleanAttributes:      true,
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeComments:                 true, // Only if you don't use comment directives!
            removeEmptyAttributes:          true,
            removeRedundantAttributes:      true,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true,
            conservativeCollapse:true,
            preserveLineBreaks:true
          }
        },
        cwd:      'app',
        src:      'templates/**.html',
        dest:     '<%= yeoman.app %>/scripts/services/tinkTemplates.js'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= yeoman.app %>/scripts/{,*/}*.js'
        ]
      },
     test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
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
          cwd: '.tmp/styles',
          src: '{,*/}*.css',
          dest: '.tmp/styles'
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
    sass: {
      options: {
        imagePath:'../images',
        includePaths: [
            'bower_components'
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/styles',
          src: ['*.scss'],
          dest: '.tmp/styles',
          ext: '.css'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/styles',
          src: ['*.scss'],
          dest: '.tmp/styles',
          ext: '.css'
        }]
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
            cwd: '<%= yeoman.app %>/scripts/',
            dest: '<%= yeoman.dist %>/scripts/',
            src: [
              'api.js'
            ]
          },
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>/scripts/services',
            dest: '<%= yeoman.dist %>/scripts/services',
            src: [
              '{,*/}*'
            ]
          }
          // Not necessary anymore, since images are now automatically embedded via the cssUrlEmbed task
          //, {
          //   expand: true,
          //   cwd: '<%= yeoman.app %>/images/gui',
          //   dest: '<%= yeoman.dist %>/images/gui',
          //   src: [
          //     '{,*/}*'
          //   ]
          // }
        ]
      },
      styles: {
        expand: true,
        cwd: '.tmp/styles',
        dest: '<%= yeoman.dist %>/styles/',
        src: '*'
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['<%= yeoman.app %>/scripts/directives/*.js','<%= yeoman.app %>/scripts/services/*.js'],
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
          '<%= yeoman.dist %>/scripts/tink-directives.min.js': ['<%= yeoman.dist %>/scripts/tink-directives.js'],
          '<%= yeoman.dist %>/scripts/api.min.js': ['<%= yeoman.dist %>/scripts/api.js']
        }
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['.tmp/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>/images'],
        basedir: ['<%= yeoman.dist %>/images'],
        assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']
      }
    },
    concurrent: {
      server: [
        'sass:server',
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'sass',
        'svgmin'
      ]
    },
    svgmin: {
      options: {
        plugins: {
          removeViewBox: false
        }
      }
    },
    cssmin: {
      options: {
        banner: '/*! Tink v<%= yeoman.version %> */'
      },
      dist: {
        files: {
          '<%= yeoman.dist %>/styles/tink-politie.min.css': ['.tmp/styles/tink-politie.css'],
          '<%= yeoman.dist %>/styles/tink-ocmw.min.css': ['.tmp/styles/tink-ocmw.css'],
          '<%= yeoman.dist %>/styles/tink-stad.min.css': ['.tmp/styles/tink-stad.css'],
          '<%= yeoman.dist %>/styles/tink.min.css': ['.tmp/styles/tink.css']
        }
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: /v(\d+)\.(\d+)\.(.+)/g,
              replacement: 'v<%= yeoman.version %>'
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['README.md'], dest: ''}
        ]
      }
    },
    cssUrlEmbed: {
      encode: {
        expand: true,
        cwd: '.tmp/styles',
        src: '{,*/}*.css',
        dest: '.tmp/styles',
        options: {
          baseDir: 'app/styles',
          failOnMissingUrl: false
        }
      }
    },
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: false
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
    'ngtemplates',
    'replace',
    'concat',
    'copy:dist',
    'uglify:dist',
    'concurrent:dist',
    'autoprefixer:dist',
    'cssUrlEmbed',
    'usemin',
    'cssmin',
    'copy:styles',
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};

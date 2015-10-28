'use strict';

module.exports = function(grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);

  // load tasks on demand (speeds up dev)
  require('jit-grunt')(grunt, {
  });

  grunt.initConfig({
    yeoman: {
      src: 'src',
      dist: 'dist',
      test: 'test',
      pkg: grunt.file.readJSON('package.json'),
      meta: {
        banner: '/*! <%= yeoman.pkg.name %> - v<%= yeoman.pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
          '* <%= yeoman.pkg.homepage %>\n' +
          '* Copyright © <%= grunt.template.today("yyyy") %> ' +
          '<%= yeoman.pkg.author.name %>; Licensed <%= yeoman.pkg.license %> */\n'
      },
    },
    watch: {
      qa: {
        files: [
          '<%= yeoman.src %>/iptools-jquery-genericfilter.js',
          '<%= yeoman.test %>/index.html',
          '<%= yeoman.test %>/spec/test.js'
        ],
        tasks: ['concurrent:qa']
      },
      bdd: {
        files: [
          '<%= yeoman.src %>/iptools-jquery-genericfilter.js',
          '<%= yeoman.test %>/index.html',
          '<%= yeoman.test %>/spec/test.js'
        ],
        tasks: ['test']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.src %>/{,*/}*.js',
        '<%= yeoman.test %>/spec/{,*/}*.js'
      ]
    },
    jscs: {
      src: '<%= yeoman.src %>/**/*.js',
      options: {
        config: '.jscs.json',
        fix: false,
        force: false,
        reporterOutput: null
      }
    },
    scsslint: {
      allFiles: [
        'styles/**/*.scss',
      ],
      options: {
        bundleExec: true,
        config: '.scss-lint.yml',
        reporterOutput: null,
        colorizeOutput: true
      }
    },
    mocha: {
      all: {
        options: {
          run: true,
          log: true
        },
        src: ['<%= yeoman.test %>/index.html']
      }
    },
    concurrent: {
      qa: {
        tasks: [
          'jshint',
          'jscs',
          'scsslint',
          'mocha'
        ]
      },
      build: {
        tasks: [
          'uglify',
          'sass'
        ]
      }
    },
    uglify: {
      options: {
        banner: '<%= yeoman.meta.banner %>'
      },
      dist: {
        files: {
          '<%= yeoman.dist %>/iptools-jquery-genericfilter.min.js': '<%= yeoman.src %>/iptools-jquery-genericfilter.js'
        }
      }
    },
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          '<%= yeoman.dist %>/iptools-jquery-genericfilter.css': 'styles/styles.scss',
        }
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/*'
          ]
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-scss-lint');

  grunt.registerTask('test', ['mocha']);
  grunt.registerTask('qa', ['concurrent:qa']);

  grunt.registerTask('build', [
    'concurrent:qa',
    'clean:dist',
    'concurrent:build'
  ]);

  grunt.registerTask('default', ['build']);

  grunt.registerTask('travis', ['concurrent:qa']);
};

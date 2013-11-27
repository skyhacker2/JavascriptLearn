/*
 * RI 4.0
 *
 * Copyright (c) 2013 radicasys.com
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    outputBasePath: '<%=grunt.option("yomb-output-base-path") || "../manggis_web/src/main/webapp/static"%>',

    connect: {
      options: {
      port: 9000,
        livereload: 35729,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0'
      },
      app: {
        options: {
          open: true,
          base: '../manggis_web/src/main/webapp',
          keepalive: true,
          livereload: false
        }
      }
    },

    jshint: {
      all: [
        'Gruntfile.js',
        'js/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    watch: {
      all: {
        files: [
          '**/*.html',
          '**/*.js',
          '**/*.css',
          '**/*.less',
          '**/*.coffee',
          'mockup-data/**/*.json'
        ],
        tasks: [
          'yomb:coffee-all',
          'yomb:build-all',
          'yomb:concat-all',
          'yomb:copy-all'
        ]
      }
    },

    jasmine: {
      all: {
        options: {
          outfile: '<%=outputBasePath%>/test/template/_SpecRunner.html',
          template: require('./test/template-loader'),
          templateOptions: {
            templateFile: '<%=outputBasePath%>/test/template/rfl-en.html'
          }
        }
      }
    },

    yomb: {
      options: {
        buildTpl: false,
        buildNodeTpl: false,
        allowSrcOutput: true,
        uglify: 0,
        cssmin: false,
        compressHtml: false,
        /*
         -c, --charset <charset>       Charset for reading files, UTF-8 by default
         --preserve-comments           Preserve comments
         --preserve-multi-spaces       Preserve multiple spaces
         --preserve-line-breaks        Preserve line breaks
         --remove-intertag-spaces      Remove intertag spaces
         --remove-quotes               Remove unneeded quotes
         --simple-doctype              Change doctype to <!DOCTYPE html>
         --remove-style-attr           Remove TYPE attribute from STYLE tags
         --remove-link-attr            Remove TYPE attribute from LINK tags
         --remove-script-attr          Remove TYPE and LANGUAGE from SCRIPT tags
         --remove-form-attr            Remove METHOD="GET" from FORM tags
         --remove-input-attr           Remove TYPE="TEXT" from INPUT tags
         --simple-bool-attr            Remove values from boolean tag attributes
         --remove-js-protocol          Remove "javascript:" from inline event handlers
         --remove-http-protocol        Remove "http:" from tag attributes
         --remove-https-protocol       Remove "https:" from tag attributes
         --remove-surrounding-spaces <min|max|all|custom_list>
        */
        compressHtmlOptions: '--remove-script-attr',
        outputBasePath: '<%=outputBasePath%>',
        protect: ['./js', './html', './mockup-data', './test/tpl-src'],
        lang: {
          base: './js/lang'
        },
        coffeeOptions: {
          bare: false,
          sourceMap: false,
          header: true
        },
        properties: {
          cssmin: 'false',
          config: {
            domain: 'document.domain',
            origin: 'location.protocol + "//" + location.host',
            cgiOrigin: 'location.protocol + "//" + location.host',
            cdnOrigin: 'location.protocol + "//" + location.host',
            base: '',
            cgiBase: '',
            cdnBase: ''
          },
          pageAside: '3',
          itemsPerPage: '15',
          batchOpRequires: '3',
          oneScreenRecords: '10',
          mandatory: '<span style=\"color: red;\">*</span>'
        }
      },

      'coffee-all': {
        files: [
          {
            src: './',
            ignore: {
              'node_modules': 1
            }
          }
        ]
      },

      'build-test': {
        files: [
          {
            src: './test',
            dest: './test'
          }
        ]
      },

      'build-all': {
        files: [
          {
            src: './',
            dest: './',
            ignore: {
              'node_modules': 1,
              'html/inc': 1,
              'js/inc': 1,
              'index.src.html': 1,
              'js/lib/rfl/ajax-proxy.src.html': 1,
              'js/lib/rfl/history-blank.src.html': 1,
              'js/lib/rfl/local-storage-proxy.src.html': 1,
              'js/lib/jquery': 1,
              'js/lib/respond': 1,
              'js/lib/base64': 1,
              'js/lib/raphael': 1,
              'js/lib/morris': 1,
              'js/lib/codemirror': 1,
              'js/lib/datepicker': 1
            }
          },
          {
            src: './js/lib/jquery',
            dest: './js/lib/jquery',
            banner: '/*! jQuery v1.9.1 jquery.com | jquery.org/license */\n'
          },
          {
            src: './js/lib/respond',
            dest: './js/lib/respond',
            banner: '/*! Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */\n'
          },
          {
            src: './js/lib/base64',
            dest: './js/lib/base64',
            banner: '/*! base64.js, v2.12 2013/05/06 07:54:20 dankogai Exp dankogai. http://opensource.org/licenses/mit-license */\n'
          },
          {
            src: './js/lib/raphael',
            dest: './js/lib/raphael',
            banner: '/*! Copyright © 2008-2012 Dmitry Baranovskiy (http://raphaeljs.com). Licensed under the MIT (http://raphaeljs.com/license.html) license. */\n'
          },
          {
            src: './js/lib/morris',
            dest: './js/lib/morris',
            banner: '/*! Copyright (c) 2013, Olly Smith. Simplified BSD License */\n'
          },
          {
            src: './js/lib/codemirror/codemirror.less',
            dest: './js/lib/codemirror/codemirror.css'
          },
          {
            src: './js/lib/datepicker',
            dest: './js/lib/datepicker',
            banner: '/*! Copyright 2012 Stefan Petre. http://www.apache.org/licenses/LICENSE-2.0 */\n'
          },
          {
            src: './index.src.html',
            dest: './index.html'
          },
          {
            src: './js/lib/rfl/ajax-proxy.src.html',
            dest: './js/lib/rfl/ajax-proxy.html'
          },
          {
            src: './js/lib/rfl/history-blank.src.html',
            dest: './js/lib/rfl/history-blank.html'
          },
          {
            src: './js/lib/rfl/local-storage-proxy.src.html',
            dest: './js/lib/rfl/local-storage-proxy.html'
          }
        ]
      },

      'concat-all': {
        files: [
          {
            src: [
              './js/lib/spine/spine.js',
              './js/lib/spine/manager.js',
              './js/lib/spine/route.js',
              './js/lib/spine/ajax-customized.js'
            ],
            dest: './js/lib/spine/main.js',
            banner: '/* Spine.js MVC library. Released under the MIT License */\n'
          },
          {
            src: [
              './js/lib/bootstrap-3.0/js/transition.js',
              './js/lib/bootstrap-3.0/js/alert.js',
              './js/lib/bootstrap-3.0/js/button.js',
              './js/lib/bootstrap-3.0/js/carousel.js',
              './js/lib/bootstrap-3.0/js/collapse.js',
              './js/lib/bootstrap-3.0/js/dropdown.js',
              './js/lib/bootstrap-3.0/js/modal.js',
              './js/lib/bootstrap-3.0/js/tooltip.js',
              './js/lib/bootstrap-3.0/js/popover.js',
              './js/lib/bootstrap-3.0/js/scrollspy.js',
              './js/lib/bootstrap-3.0/js/tab.js',
              './js/lib/bootstrap-3.0/js/affix.js'
            ],
            dest: './js/lib/bootstrap-3.0/main.js',
            banner: '/* Copyright 2012 Twitter, Inc. | http://www.apache.org/licenses/LICENSE-2.0 */\n'
          },
          {
            src: [
              './js/lib/codemirror/codemirror.js',
              './js/lib/codemirror/addon/edit/closetag.js',
              './js/lib/codemirror/mode/htmlmixed.js',
              './js/lib/codemirror/mode/xml.js',
              './js/lib/codemirror/mode/css.js'
            ],
            dest: './js/lib/codemirror/main.js',
            banner: '/* Copyright Marijn Haverbeke. | http://codemirror.net */\n'
          },
          {
            src: [
              './js/lib/ckeditor-4.2.1/_ckeditor-fix-basePath.js',
              './js/lib/ckeditor-4.2.1/_ckeditor-src.js'
            ],
            dest: './js/lib/ckeditor-4.2.1/ckeditor-main.js',
            banner: '/* Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved. For licensing, see LICENSE.html or http://ckeditor.com/license */\n'
          }
        ]
      },

      'copy-test': {
        files: [
          {
            src: './test/spec',
            dest: './test/spec'
          },
          {
            src: './test/grunt',
            dest: './test/grunt'
          }
        ]
      },

      'copy-all': {
        files: [
          {
            src: './js/lang',
            dest: './js/lang'
          },
          {
            src: './js/lib/ckeditor-4.2.1',
            dest: './js/lib/ckeditor-4.2.1',
            excludeRegexp: '\\/_|-main.js$'
          },
          {
            src: './mockup-data',
            dest: './mockup-data',
            condition: 'property: config.cgiBase == "/prototype/static/mockup-data/"'
          },
          {
            src: './template',
            dest: './template',
            includeRegexp: '(\\.tpl.js)$',
            cssmin: false
          },
          {
            src: './',
            dest: './',
            includeRegexp: '(\\.jpg|\\.jpeg|\\.gif|\\.png|\\.ico|\\.otf|\\.eot|\\.svg|\\.ttf|\\.woff|-min\\.css)$',
            cssmin: false
          }
        ]
      }
    },

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-yomb');

  //
  grunt.registerTask('hint', ['jshint']);
  grunt.registerTask('build', ['yomb:coffee-all', 'yomb:build-all', 'yomb:concat-all', 'yomb:copy-all']);
  grunt.registerTask('test', ['build', 'yomb:build-test', 'yomb:copy-test', 'jasmine']);
  grunt.registerTask('default', ['build']);
};

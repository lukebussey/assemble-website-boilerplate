const sass = require('node-sass');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const optipng = require('imagemin-optipng');
const svgo = require('imagemin-svgo');
const timeGrunt = require('time-grunt');
const dotEnv = require('dotenv');
const jitGrunt = require('jit-grunt');

module.exports = (grunt) => {
  // Time how long tasks take. Can help when optimizing build times
  timeGrunt(grunt);

  dotEnv.config();

  // Automatically load required grunt tasks
  jitGrunt(grunt, {
    useminPrepare: 'grunt-usemin',
    s3: 'grunt-aws',
    cloudfront: 'grunt-aws',
    replace: 'grunt-text-replace',
  });

  // configurable paths
  const config = {
    app: 'app',
    assets: 'assets',
    dist: 'dist',
  };

  grunt.initConfig({

    // Project settings
    config,
    package: grunt.file.readJSON('package.json'),

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      assemble: {
        files: [
          '<%= config.app %>/data/{,*/}*.{yml,json}',
          '<%= config.app %>/{layouts,pages,partials}/{,**/}*.{hbs,md}',
        ],
        tasks: ['assemble'],
      },
      js: {
        files: [
          '<%= config.app %>/scripts/{,*/}*.js',
        ],
        tasks: [
          'browserify',
          'eslint',
        ],
      },
      sass: {
        files: ['<%= config.app %>/styles/{,*/}*.scss'],
        tasks: [
          'sass:server',
          'postcss:server',
        ],
      },
      webfont: {
        files: [
          '<%= config.app %>/media/icons/*.svg',
        ],
        tasks: ['webfont'],
      },
      favicon: {
        files: [
          '<%= config.assets %>/icon.svg',
        ],
        tasks: ['realFavicon'],
      },
    },

    browserSync: {
      options: {
        port: 0,
        notify: false,
        background: true,
        timestamps: false,
      },
      livereload: {
        options: {
          files: [
            '.tmp/{,*/}*.html',
            '.tmp/styles/{,*/}*.css',
            '.tmp/scripts/main.js',
            '<%= config.app %>/media/{,**/}*',
            '!<%= config.app %>/media/icons/*',
          ],
          server: {
            baseDir: ['.tmp', config.app],
            routes: {
              '/node_modules': './node_modules',
              '/app/styles': './app/styles',
            },
          },
        },
      },
      dist: {
        options: {
          background: false,
          server: '<%= config.dist %>',
          snippetOptions: {
            rule: {
              // disable auto-injection
              match: /^$/,
            },
          },
        },
      },
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '.sass-cache',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*',
          ],
        }],
      },
      server: '.tmp',
    },

    // Generate pages
    assemble: {
      options: {
        root: '.tmp',
        layout: 'default',
        layoutext: '.hbs',
        layoutdir: '<%= config.app %>/layouts',
        assets: '<%= config.app %>',
        data: '<%= config.app %>/data/*.{json,yml}',
        partials: '<%= config.app %>/partials/{,*/}*.hbs',
        helpers: ['<%= config.app %>/helpers/*.js'],
        plugins: [
          'grunt-assemble-contextual',
        ],
        contextual: {
          dest: '.tmp',
        },
        marked: {
          breaks: true,
        },
      },
      pages: {
        options: {
          plugins: [
            'grunt-assemble-permalinks',
            'grunt-assemble-sitemap',
          ],
          sitemap: {
            relativedest: '.tmp',
            robot: false,
          },
          permalinks: {
            preset: 'pretty',
          },
        },
        files: [{
          expand: true,
          cwd: '<%= config.app %>/pages',
          dest: '.tmp',
          src: [
            '{,**/}*.{hbs,md}',
            '!error.hbs',
          ],
        }],
      },
      special: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/pages',
          dest: '.tmp',
          src: [
            'error.hbs',
          ],
        }],
      },
    },

    // Compile Sass
    sass: {
      options: {
        implementation: sass,
        sourceMap: true,
        includePaths: [
          '<%= config.app %>',
          'node_modules',
        ],
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>',
          src: ['styles/{,*/}*.scss'],
          dest: '.tmp',
          ext: '.css',
        }],
      },
    },

    // Converts ES6 to ES5 for browser compatibility
    browserify: {
      options: {
        transform: [
          ['babelify', {
            presets: ['@babel/preset-env'],
          }],
        ],
      },
      server: {
        src: '<%= config.app %>/scripts/main.js',
        dest: '.tmp/scripts/main.js',
      },
    },

    // Process CSS
    postcss: {
      options: {
        map: {
          inline: false,
        },
        processors: [
          require('postcss-flexbugs-fixes'),
          require('autoprefixer'),
        ],
      },
      server: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/',
        }],
      },
      dist: {
        options: {
          processors: [
            require('postcss-flexbugs-fixes'),
            require('autoprefixer'),
            require('postcss-uncss')({
              htmlroot: '.tmp',
              html: [
                '.tmp/{,*/}*.html',
              ],
              ignore: [
                '.arrow',
                '.show',
                '.hide',
                '.fade',
                /\.(bs-)?popover/,
                /\.(bs-)?tooltip/,
              ],
            }),
          ],
        },
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/',
        }],
      },
    },

    // Generate custom icon font
    webfont: {
      icons: {
        src: '<%= config.app %>/media/icons/*.svg',
        dest: '.tmp/media/fonts',
        destCss: '.tmp/',
        options: {
          engine: 'node',
          hashes: false,
          stylesheet: 'css',
          types: 'woff2,woff',
          relativeFontPath: '/media/fonts',
          template: 'icons-template.css',
          templateOptions: {
            baseClass: 'icon',
            classPrefix: 'icon-',
          },
        },
      },
    },

    // Generate favicons
    realFavicon: {
      favicons: {
        src: '<%= config.assets %>/icon.svg',
        dest: '<%= config.app %>/media/',
        options: {
          iconsPath: '/media/',
          // html: [ 'TODO: List of the HTML files where to inject favicon markups' ],
          design: {
            ios: {
              pictureAspect: 'backgroundAndMargin',
              backgroundColor: '#ffffff',
              margin: '14%',
              assets: {
                ios6AndPriorIcons: false,
                ios7AndLaterIcons: false,
                precomposedIcons: false,
                declareOnlyDefaultIcon: true,
              },
            },
            desktopBrowser: {},
            windows: {
              pictureAspect: 'whiteSilhouette',
              backgroundColor: '#2d89ef',
              onConflict: 'override',
              assets: {
                windows80Ie10Tile: false,
                windows10Ie11EdgeTiles: {
                  small: false,
                  medium: true,
                  big: false,
                  rectangle: false,
                },
              },
            },
            androidChrome: {
              pictureAspect: 'noChange',
              themeColor: '#ffffff',
              manifest: {
                name: '<%= package.name %>',
                display: 'standalone',
                orientation: 'notSet',
                onConflict: 'override',
                declared: true,
              },
              assets: {
                legacyIcon: false,
                lowResolutionIcons: false,
              },
            },
            safariPinnedTab: {
              pictureAspect: 'silhouette',
              themeColor: '#5bbad5',
            },
          },
          settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false,
            readmeFile: false,
            htmlCodeFile: false,
            usePathAsIs: false,
          },
        },
      },
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%= config.dist %>',
      },
      html: '.tmp/index.html',
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: ['<%= config.dist %>'],
      },
      html: ['<%= config.dist %>/{,**/}*.html'],
      css: ['<%= config.dist %>/{,*/}*.css'],
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      options: {
        use: [
          mozjpeg({
            quality: 80,
          }),
          optipng(),
          pngquant(),
          svgo({
            plugins: [{
              removeViewBox: false,
            }],
          }),
        ],
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/media',
          src: '{,**/}*.{png,jpg,jpeg,svg}',
          dest: '<%= config.dist %>/media',
        }],
      },
    },
    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: false,
          useShortDoctype: true,
          processScripts: ['application/ld+json'],
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: '{,**/}*.html',
          dest: '<%= config.dist %>',
        }],
      },
    },

    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '.htaccess',
            '*.txt',
            'media/{,**/}*.{webp,gif,ico,xml,webmanifest}',
            'media/fonts/*',
          ],
        }, {
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          flatten: true,
          src: [
            'media/favicon.ico',
          ],
        }, {
          expand: true,
          dot: true,
          cwd: '.tmp',
          dest: '<%= config.dist %>',
          src: [
            'media/fonts/*',
            'robots.txt',
            'sitemap.xml',
          ],
        }, {
          expand: true,
          dot: true,
          cwd: '.tmp',
          dest: '<%= config.dist %>',
          src: [
            '{,**/}*.html',
            '!icons.html',
          ],
        }],
      },
    },

    // Inline Critical CSS
    critical: {
      options: {
        base: '<%= config.dist %>',
        minify: true,
        width: 1440,
        height: 900,
        ignore: [
          '@font-face',
          '@import',
        ],
      },
      pages: {
        expand: true,
        cwd: '<%= config.dist %>',
        src: '{,**/}*.html',
        dest: '<%= config.dist %>',
      },
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    eslint: {
      options: {
        configFile: '.eslintrc.json',
      },
      target: [
        '<%= config.app %>/scripts/{,*/}*.js',
      ],
    },

    // Pick an unused port for livereload
    portPick: {
      browserSync: {
        options: {
          port: 9000,
        },
        targets: ['browserSync.options.port'],
      },
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= config.dist %>/scripts/{,*/}*.js',
          '<%= config.dist %>/styles/{,*/}*.css',
          '<%= config.dist %>/media/{,**/}*.{png,jpg,jpeg,gif,webp,svg,eot,ttf,woff,woff2}',
          '!<%= config.dist %>/media/{android,apple,favicon,mstile,safari}*.*',
        ],
      },
    },

    // Run some tasks in parallel to speed up build process
    concurrent: {
      server: [
        'webfont',
        'sass',
        'browserify',
      ],
      dist: [
        'webfont',
        'sass',
        'browserify',
        'imagemin',
      ],
    },

    // Deploy to AWS S3
    s3: {
      options: {
        signatureVersion: 'v4',
        bucket: '<%= process.env.S3_BUCKET %>',
        gzip: false,
        headers: {
          CacheControl: 'public, no-cache, no-transform, s-maxage=31536000',
        },
      },
      // Define file location for all environments
      default: {
        src: [
          '{,**/}*.html',
          '{,*/}favicon.ico',
          'robots.txt',
          'sitemap.xml',
          'media/{android,apple,favicon,mstile,safari,}*.*',
          'media/*.{xml,webmanifest}',
        ],
      },
      defaultAssets: {
        src: [
          'scripts/{,*/}*.js',
          'styles/{,*/}*.css',
          'media/{,**/}*.{png,jpg,jpeg,gif,webp,svg,eot,ttf,woff,woff2}',
          '!media/{android,apple,favicon,mstile,safari}*.*',
          '!media/*.{xml,webmanifest}',
        ],
      },
      dist: {
        options: {
          headers: {
            CacheControl: 'public, must-revalidate, no-transform, max-age=60, s-maxage=31536000',
          },
        },
        cwd: '<%= config.dist %>',
        src: '<%= s3.default.src %>',
      },
      distAssets: {
        options: {
          headers: {
            CacheControl: 'public, must-revalidate, no-transform, max-age=31536000, s-maxage=31536000',
          },
        },
        cwd: '<%= config.dist %>',
        src: '<%= s3.defaultAssets.src %>',
      },
    },

    // Invalidate Cloudfront
    cloudfront: {
      options: {
        distributionId: '<%= process.env.CLOUDFRONT_ID %>',
      },
      production: {
        options: {
          invalidations: [
            '/*',
          ],
        },
      },
    },

    // Increment version number, create and push tag
    bump: {
      options: {
        files: ['package.json'],
        commitFiles: '<%= bump.options.files %>',
        pushTo: 'origin',
      },
    },

    // Text replacements
    replace: {
      openGraphTag: {
        src: [
          '<%= config.dist %>/{,**/}*.html',
        ],
        overwrite: true,
        replacements: [{
          from: /<meta property="og:(image|url)" content="?([^"]+)"?/g,
          to: '<meta property="og:$1" content="<%= package.homepage %>$2"',
        }],
      },
      relCanonical: {
        src: [
          '<%= config.dist %>/{,**/}*.html',
        ],
        overwrite: true,
        replacements: [{
          from: /<link rel="canonical" href="?([^"]+)"?/g,
          to: '<link rel="canonical" href="<%= package.homepage %>$1"',
        }],
      },
      sitemap: {
        src: [
          '<%= config.dist %>/sitemap.xml',
        ],
        overwrite: true,
        replacements: [
          {
            from: 'index.html',
            to: '',
          }, {
            from: /\s+<changefreq>[a-z]+<\/changefreq>/g,
            to: '',
          }, {
            from: /\s+<priority>[0-9\.]+<\/priority>/g,
            to: '',
          },

        ],
      },
    },

  });

  grunt.registerTask('serve', (target) => {
    if (target === 'dist') {
      return grunt.task.run(['build', 'portPick:browserSync', 'browserSync:dist']);
    }

    grunt.task.run([
      'clean:server',
      'assemble',
      'portPick',
      'concurrent:server',
      'postcss:server',
      'browserSync:livereload',
      'watch',
    ]);
  });

  grunt.registerTask('purge', [
    'cloudfront',
  ]);

  grunt.registerTask('test', [
    'eslint',
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'assemble',
    'useminPrepare',
    'concurrent:dist',
    'postcss:dist',
    'concat',
    'cssmin',
    'uglify',
    'copy:dist',
    'filerev',
    'usemin',
    'replace',
    'htmlmin',
    'critical',
  ]);

  grunt.registerTask('deploy', [
    'build',
    's3:dist',
    's3:distAssets',
    'purge',
  ]);

  grunt.registerTask('default', [
    'build',
  ]);
};

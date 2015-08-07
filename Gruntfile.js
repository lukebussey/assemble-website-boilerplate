'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt, {
        pattern: [
            'assemble',
            'grunt-*'
        ]
    });

    // configurable paths
    var config = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({

        // Project settings
        config: config,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            gruntfile: {
                files: ['Gruntfile.js'],
                tasks: ['wiredep']
            },
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '{.tmp,<%= config.app %>}/{,**/}*.{html,css,js,json}',
                    '<%= config.app %>/media/{,**/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '!<%= config.app %>/media/icons/*'
                ]
            },
            assemble: {
                files: [
                    '<%= config.app %>/data/{,*/}*.{yml,json}',
                    '<%= config.app %>/{layouts,pages,partials}/{,**/}*.hbs'
                ],
                tasks: [
                    'assemble',
                    'wiredep'
                ]
            },
            js: {
                files: [
                    '<%= config.app %>/scripts/{,*/}*.js'
                ],
                tasks: ['jshint'],
                options: {
                    spawn: false,
                },
            },
            sass: {
                files: ['<%= config.app %>/styles/{,*/}*.scss'],
                tasks: [
                    'sass:server',
                    'autoprefixer'
                ]
            },
            webfont: {
                files: [
                    '<%= config.app %>/media/icons/*.svg'
                ],
                tasks: ['webfont']
            },
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 0,
                open: true,
                livereload: 0,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect.static(config.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    base: '<%= config.dist %>',
                    livereload: false
                }
            }
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
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Generate pages
        assemble: {
            options: {
                layout: 'default.hbs',
                layoutdir: '<%= config.app %>/layouts',
                assets: '<%= config.app %>',
                data: '<%= config.app %>/data/*.{json,yml}',
                partials: '<%= config.app %>/partials/{,*/}*.hbs'
            },
            pages: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/pages',
                    dest: '.tmp',
                    src: '{,**/}*.hbs'
                }]
            }
        },

        // Compile Sass
        sass: {
            options: {
                sourceMap: true,
                includePaths: [
                    '<%= config.app %>',
                    'bower_components'
                ]
            },
            server: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>',
                    src: ['{,*/}*.scss'],
                    dest: '.tmp',
                    ext: '.css'
                }]
            }
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1'],
                map: {
                    prev: '.tmp/styles/'
                }
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
                    relativeFontPath: '/media/fonts',
                    templateOptions: {
                        classPrefix: 'icon-',
                    }
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                dest: '<%= config.dist %>'
            },
            html: '.tmp/index.html'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= config.dist %>']
            },
            html: ['<%= config.dist %>/{,**/}*.html'],
            css: ['<%= config.dist %>/{,*/}*.css']
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/media',
                    src: '{,**/}*.{png,jpg,jpeg}',
                    dest: '<%= config.dist %>/media'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/media',
                    src: '{,**/}*.svg',
                    dest: '<%= config.dist %>/media'
                }]
            }
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
                    useShortDoctype: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: '{,**/}*.html',
                    dest: '<%= config.dist %>'
                }]
            }
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
                        'media/{,**/}*.{webp,gif,ico}',
                        'media/fonts/*'
                    ]
                },{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    flatten: true,
                    src: [
                        'media/favicon.ico'
                    ]
                },{
                    expand: true,
                    dot: true,
                    cwd: '.tmp',
                    dest: '<%= config.dist %>',
                    src: [
                        'media/fonts/*',
                    ]
                },{
                    expand: true,
                    dot: true,
                    cwd: '.tmp',
                    dest: '<%= config.dist %>',
                    src: [
                        '{,**/}*.html',
                        '!icons.html'
                    ]
                },{
                    expand: true,
                    dot: true,
                    cwd: 'bower_components',
                    dest: '<%= config.dist %>/bower_components',
                    src: [
                        'bootstrap-sass-official/assets/fonts/bootstrap/*'
                    ]
                }]
            }
        },

        // Automatically inject Bower components into the HTML file
        wiredep: {
            app: {
                src: '.tmp/{,**/}*.html',
                ignorePath: '../',
                exclude: []
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                force: true,
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js'
            ]
        },

        // Pick an unused port for livereload
        portPick: {
            connect: {
                options: {
                    port: 9000
                },
                targets: ['connect.options.port']
            },
            livereload: {
                targets: ['connect.options.livereload']
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= config.dist %>/scripts/{,*/}*.js',
                    '<%= config.dist %>/styles/{,*/}*.css',
                    '<%= config.dist %>/{media,bower_components}/{,**/}*.{png,jpg,jpeg,gif,webp,svg,eot,ttf,woff,woff2}'
                ]
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            server: [
                'webfont',
                'sass:server',
            ],
            dist: [
                'webfont',
                'sass',
                'imagemin',
                'svgmin'
            ]
        },

    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'assemble',
            'wiredep',
            'portPick',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'jshint'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'assemble',
        'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'cssmin',
        'uglify',
        'copy:dist',
        'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);
};

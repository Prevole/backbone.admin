/*global module:false*/
module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-haml');
    grunt.loadNpmTasks('grunt-coffeelint');
    grunt.loadNpmTasks('grunt-docker');
    grunt.loadNpmTasks('grunt-jasmine-runner');

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            version: '<%= pkg.version %>',
            banner_main:
                ' * Backbone.Admin v<%= meta.version %>\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                ' * Distributed under MIT license\n' +
                ' * <%= pkg.homepage %>\n',
            banner_header: '/*!\n',
            banner_footer: ' */',
            banner:
                '<%= meta.banner_header %>' +
                '<%= meta.banner_main %>' +
                '<%= meta.banner_footer %>'
        },

        clean: {
          build: ["dist", "working"],
          demo: ["demo"]
        },

        rig: {
            build: {
                src: ['src/admin/backbone.admin.coffee'],
                dest: 'working/backbone.admin.coffee'
            },
            demo: {
                src: ['src/demo/demo.coffee'],
                dest: 'working/demo.coffee'
            }
        },

        coffeelint: {
            build: {
                files: ["src/admin/*.coffee"],
                options: {
                    max_line_length: {
                        value: 120
                    }
                }
            },
            demo: {
                files: ["src/demo/*.coffee"],
                options: {
                    max_line_length: {
                        value: 120
                    }
                }
            }
        },

        coffee: {
            build: {
                options: {
                    bare: true
                },
                files: {
                    'dist/std/backbone.admin.js': ['working/backbone.admin.coffee']
                }
            },
            demo: {
                options: {
                    bare: true
                },
                files: {
                    'demo/demo.js': ['working/demo.coffee']
                }
            },
            specs: {
                options: {
                    bare: true
                },
                files: {
                    'spec/javascripts/**.js': ['spec/coffeescripts/**.coffee']
                }
            }
        },

        jasmine : {
            // Keep the order of the different dependencies
            src : [
                'vendor/javascripts/json2.js',
                'vendor/javascripts/jquery.js',
                'vendor/javascripts/underscore.js',
                'vendor/javascripts/backbone.js',
                'vendor/javascripts/backbone.babysitter.js',
                'vendor/javascripts/backbone.eventbinder.js',
                'vendor/javascripts/backbone.wreqr.js',
                'vendor/javascripts/backbone.marionette.js',
                'dist/std/backbone.admin.js'
            ],
            helpers : 'spec/javascripts/helpers/*.js',
            specs : 'spec/javascripts/**/*.spec.js'
        },

        'jasmine-server' : {
            browser : false
        },

        sass: {
            demo: {
                files: {
                    'demo/demo.css': 'src/demo/demo.scss'
                }
            }
        },

        haml: {
            demo: {
                src: "src/demo/demo.haml",
                dest: "demo/demo.html"
            }
        },

        min: {
            build: {
                src: [
                    '<banner:meta.banner>',
                    'dist/std/backbone.admin.js'
                ],
                dest: 'dist/std/backbone.admin.min.js'
            }
        },

        copy: {
            demo: {
                options: {
                    flatten: false
                },
                files: {
                    "demo/js/": ["vendor/javascripts/*.js"],
                    "demo/js/backbone.admin.js": ["dist/std/backbone.admin.js"],
                    "demo/images/": ["src/demo/images/*.png"],
                    "demo/bootstrap/": ["src/demo/bootstrap/**"]
                }
            }
        },

        docker: {
            build: {
                src: ["working/*.coffee"],
                options: {
                    extras: ["fileSearch", "goToLine"],
                    colourScheme: "friendly",
                    lineNums: true
                }
            }
        },

        jshint: {
            globals: {
                Backbone: true,
                _: true,
                $: true
            }
        },

        uglify: {},

        globals: {
            jasmine : false,
            describe : false,
            beforeEach : false,
            expect : false,
            it : false,
            spyOn : false
        }
    });

    grunt.registerTask('default', 'clean coffeelint rig coffee jasmine sass haml min copy docker');
};

'use strict';

var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var del = require('del');

var jshint = require('gulp-jshint');

var browserify = require('browserify');
var babelify = require('babelify');

var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var less = require('gulp-less');
var minify = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

var htmlreplace = require('gulp-html-replace');

var karma = require('karma').server;

var browserSync = require('browser-sync');

var env = process.env.NODE_ENV || 'development';

var filePaths = {
    src: {
        scripts: {
            entry: './src/bootstrap.js',
            all: ['./src/**/*.js', './src/**/*.jsx'],
            bundled: env === 'development' ? 'app.js' : 'app.min.js'
        },
        styles: {
            entry: 'styles.less',
            all: './less/**/*.less',
            bundled: env === 'development' ? 'styles.css' : 'styles.min.css'
        },
        teplates: {
            entry: './templates/index.html'
        }
    },
    dest: './build'
};

function build(callback) {
    runSequence('clean',
        'lint:scripts',
        ['build:scripts',
            'build:styles',
            'build:templates'
        ],
        'browser-sync',
        callback
    );
}

gulp.task('lint:scripts', function() {
    return gulp.src(filePaths.src.scripts.all)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('build:scripts', function() {
    return browserify(filePaths.src.scripts.entry, {
            debug: env === 'development'
        })
        .transform(babelify)
        .bundle()
        .on('error', function(err) {
            gutil.log(gutil.colors.red(err));
        })
        .pipe(source(filePaths.src.scripts.bundled))
        .pipe(buffer())
        .pipe(gulpif(env === 'development', sourcemaps.init({
            loadMaps: true
        })))
        .pipe(gulpif(env === 'production', uglify({
            mangle: false
        })))
        .pipe(gulpif(env === 'development', sourcemaps.write('./')))
        .pipe(gulp.dest(filePaths.dest));
});

gulp.task('reload:scripts', ['build:scripts'], function() {
    browserSync.reload();
});

gulp.task('build:styles', function() {
    return gulp.src(filePaths.src.styles.all)
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }).on('error', function(err) {
            gutil.log(gutil.colors.red(err));
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulpif(env === 'production', minify()))
        .pipe(rename(filePaths.src.styles.bundled))
        .pipe(gulp.dest(filePaths.dest));
});

gulp.task('reload:styles', ['build:styles'], function() {
    browserSync.reload();
});

gulp.task('build:templates', function() {
    var replaceConfig = {
        css: filePaths.src.styles.bundled,
        js: filePaths.src.scripts.bundled
    };

    return gulp.src(filePaths.src.teplates.entry)
        .pipe(htmlreplace(replaceConfig))
        .pipe(gulp.dest(filePaths.dest));
});

gulp.task('reload:templates', ['build:templates'], function() {
    browserSync.reload();
});

gulp.task('test', function(done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js'
    }, function() {
        done();
    });
});

gulp.task('clean', function(callback) {
    del(filePaths.dest, null, callback);
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: filePaths.dest
        },
        port: process.env.PORT || 8080
    });
});

gulp.task('watch', function() {
    build(function() {
        gulp.watch(filePaths.src.scripts.all, ['reload:scripts']);
        gulp.watch(filePaths.src.styles.all, ['reload:styles']);
        gulp.watch(filePaths.src.teplates.entry, ['reload:templates']);

        gutil.log(gutil.colors.green('Watching for changes...'));
    });
});

gulp.task('build', function() {
    build(function() {
        gutil.log(gutil.colors.green('Build complete.'));
    });
});

gulp.task('default', ['watch']);

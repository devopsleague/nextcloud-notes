var gulp = require('gulp'),
    ngAnnotate = require('gulp-ng-annotate'),
    jshint = require('gulp-jshint'),
    wrap = require('gulp-wrap'),
    uglify = require('gulp-uglify'),
    phpunit = require('gulp-phpunit'),
    karma = require('karma'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    del = require('del');

/**
 * Configuration
 */
var jsHintRc = '.jshintrc';
var karmaConfig = __dirname + '/karma.conf.js';  // karma needs absolute path
var phpunitBinary = 'phpunit';
var phpunitConfig = '../phpunit.xml';
var phpunitIntegrationConfig = '../phpunit.integration.xml';
var buildFolder = 'public';
var buildTarget = 'app.min.js';

var sources = {
    css: ['../css/**/*.css'],
    js: ['config/app.js', 'app/**/*.js'],
    tests: ['tests/**/*.js'],
    php: ['../**/*.php'],
    config: ['karma.conf.js', 'gulpfile.js']
};

var buildSources = sources.js;
var watchSources = sources.js
    .concat(sources.tests)
    .concat(sources.css)
    .concat(sources.config);
var lintSources = sources.js
    .concat(sources.tests)
    .concat(sources.config);
var phpSources = sources.php;

var wrappers = '(function(angular, $, requestToken, mdEdit, undefined){'+
    '\'use strict\';<%= contents %>' +
    '})(angular, jQuery, oc_requesttoken, mdEdit);';


/**
 * Task definitions
 */
gulp.task('default', ['lint', 'build']);

gulp.task('lint', function () {
    'use strict';
    return gulp.src(lintSources)
        .pipe(jshint(jsHintRc))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', function () {
    'use strict';
    return gulp.src(buildSources)
        .pipe(sourcemaps.init())
            .pipe(concat(buildTarget))
            .pipe(ngAnnotate())
            .pipe(wrap(wrappers))
            .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(buildFolder));
});

gulp.task('clean', function () {
    'use strict';
    del(buildFolder);
});


gulp.task('test-all', ['test', 'test-php', 'test-php-integration']);

gulp.task('test', function (done) {
    'use strict';
    new karma.Server({
        configFile: karmaConfig,
        singleRun: true
    }, done).start();
});

gulp.task('test-php', function () {
    'use strict';
    gulp.src(phpunitConfig)
        .pipe(phpunit(phpunitBinary, {silent: true}));
});

gulp.task('test-php-integration', function () {
    'use strict';
    gulp.src(phpunitIntegrationConfig)
        .pipe(phpunit(phpunitBinary, {silent: true}));
});


// watch tasks
gulp.task('watch', ['default'], function () {
    'use strict';
    gulp.watch(watchSources, ['default']);
});

gulp.task('watch-test', function (done) {
    'use strict';
    new karma.Server({
        configFile: karmaConfig
    }, done).start();
});

gulp.task('watch-test-php', function () {
    'use strict';
    gulp.watch(phpSources, ['test-php']);
});

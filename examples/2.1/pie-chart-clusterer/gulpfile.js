var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

var paths = {
    js: ['src/**/*.js']
    // , css: ['src/css/**/*.css']
};

gulp.task('build-js-debug', ['lint-js'], function () {
    return gulp.src(paths.js)
        .pipe(concat('all.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('build-js-minify', ['lint-js'], function () {
    return gulp.src(paths.js)
        .pipe(uglify())
        .pipe(concat('all.min.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', function () {
    gulp.watch(paths.js, ['build-js-debug']);
});

gulp.task('lint-js', function () {
    return gulp.src(paths.js)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('default', ['watch', 'lint-js', 'build-js-debug']);

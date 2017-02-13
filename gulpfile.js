var gulp = require('gulp');
var browserSync = require('browser-sync');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var bower = require('gulp-bower');
var sass = require('gulp-sass');

require('dotenv').config();
   // Configuration

gulp.task('watch', function () {
    gulp.watch(['public/css/common.scss',
    'public/css/views/articles.scss'], ['sass']);

    gulp.watch(['public/js/**', 'app/**/*.js'], ['jshint'])
    .on('change', browserSync.reload);

    gulp.watch('public/views/**').on('change', browserSync.reload);

    gulp.watch('public/css/**', ['sass'])
    .on('change', browserSync.reload);

    gulp.watch('app/views/**', ['jade'])
    .on('change', browserSync.reload);
});

 //setup jshint
gulp.task('jshint', function () {
    return  gulp.src([
        'gulpfile.js',
        'app/**/*.js',
        'test/**/*.js',
        'public/js/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

//setup nodemon
gulp.task('nodemon', function (done) {
    var started = false;
    return nodemon({
        script: 'server.js',
        ext: 'js',
    }).on('start', function(){
        if(!started){
            done();
            started = true;
        }
    });
});

//setup server
gulp.task('server', ['nodemon'], function () {
    browserSync.init({
        proxy: 'http://localhost:'+process.env.PORT || 5000,
        port: 3000,
        ui:{
            port: 3001
        },
        reloadOnRestart: true
    });
});

//setup istanbul code coverage reporter
gulp.task('report', function() {
   return gulp.src('test/**/*.js')
      .pipe(istanbul())
      // This overwrites `require` so it returns covered files
      .pipe(istanbul.hookRequire());
});

//setup mocha
gulp.task('mochaTest', ['report'], function () {
    gulp.src('test/**/*.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({ reporter: 'spec' }))
    .pipe(istanbul.writeReports());
});

gulp.task('coveralls', ['mochaTest'], function() {
    // lcov.info is the file which has the coverage information we wan't to upload
    return gulp.src(__dirname + '/coverage/lcov.info')
      .pipe(coveralls());
});

//setup sass
gulp.task('sass', function () {
    return gulp.src('public/css/common.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css/'));
});


//install bower
gulp.task('install', function () {
    return bower('./bower_components')
    .pipe(gulp.dest('./public/lib'));
});

//Default task(s).
gulp.task('default', ['install','jshint', 'server', 'watch', 'sass'], function (done) {
    done();
});

//Test task.
gulp.task('test', ['coveralls'], function (done) {
    done();
});

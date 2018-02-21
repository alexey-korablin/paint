'use strict';

global.$ = {
    gulp: require('gulp'),
    gp: require('gulp-load-plugins')(),
    bs: require('browser-sync').create(),

    path: require('./gulp/config/tasks')
}

$.path.tasks.forEach(task => require('task')());

$.gulp.task('default', $.gulp.series(
    $.gulp.parallel('layout', 'script', 'style', 'test'),
    $.gulp.parallel('serve', 'watch')
));
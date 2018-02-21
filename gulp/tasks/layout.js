module.exports = () => {
    $.gulp.task('layout', () => {
        $.gulp.src('app/*.html')
        .pipe($.gulp.dest('build'))
        .on('end', $.bs.reload);
    });
};
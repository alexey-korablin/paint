module.exports = () => {
    $.gulp.task('script', () => {
        return $.gulp.src('app/scripts/*.js')
        .pipe($.gulp.dest('build/scripts/js'))
        .pipe($.bs.reload({
            stream: true
        }));
    });
};
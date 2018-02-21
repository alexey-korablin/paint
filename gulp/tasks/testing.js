module.exports = () => {
    $.gulp.task('test', () => {
        return gulp.src('test/*.js', {read: false})
        .pipe(mocha({reporter: 'list', exit: true}))
        .on('error', console.error);
    });
}


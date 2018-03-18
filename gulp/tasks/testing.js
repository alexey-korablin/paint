module.exports = () => {
    $.gulp.task('test', () => {
        return $.gulp.src('test/*.spec.js', {read: false})
        .pipe($.gp.mocha({reporter: 'list', exit: true}))
        .on('error', console.error);
    });
}


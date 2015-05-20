var gulp = require('gulp');
var stylus = require('gulp-stylus');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var nib = require('nib');

gulp.task('stylus', function () {
	gulp.src('assets/css/main.styl')
		.pipe(stylus({ errors: true, use: [nib()] }))
		.on('error', function (error) {
			console.log(error.toString());
		})
		.pipe(concat('styles.css'))
		.pipe(gulp.dest('public/css'))
		.pipe(livereload());
});

gulp.task('js', function () {
	gulp.src('assets/js/*.js')
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest('public/js'));
});

gulp.task('fonts', function () {
	gulp.src('assets/fonts/*')
		.pipe(gulp.dest('public/fonts'));
});

gulp.task('img', function () {
	gulp.src('assets/img/*')
		.pipe(gulp.dest('public/img'));
});

gulp.task('watch', function () {
	livereload.listen();
	gulp.watch('assets/css/*.styl', ['stylus']);
	gulp.watch('assets/js/*.js', ['js']);
	gulp.watch('assets/fonts/*', ['fonts']);
	gulp.watch('views/*.jade').on('change', livereload.changed);
});

gulp.task('stylesMin', function () {
	gulp.src('assets/css/main.styl')
		.pipe(stylus({ errors: true, use: [nib()] }))
		.pipe(concat('styles.min.css'))
		.pipe(minify())
		.pipe(gulp.dest('public/css'));
});

gulp.task('jsMin', function () {
	gulp.src('assets/js/*.js')
		.pipe(concat('scripts.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('public/js'));
});

gulp.task('default', ['stylus', 'js', 'fonts', 'img', 'watch']);
gulp.task('production', ['stylesMin', 'jsMin', 'fonts', 'img']);

var syntax       = 'scss',
    gulp         = require('gulp'),
    browserSync  = require('browser-sync'),
    sass         = require('gulp-sass'),
    cleancss     = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    rename       = require('gulp-rename'),
    sourcemaps   = require('gulp-sourcemaps'),
    del          = require('del'),
    htmlmin      = require('gulp-htmlmin'),
    notify       = require('gulp-notify'),
    cache        = require('gulp-cache'),
    rsync        = require('gulp-rsync'),
    spritesmith  = require('gulp.spritesmith'),
    imagemin     = require('gulp-imagemin'),
    imgCompress  = require('imagemin-jpeg-recompress'),
    merge        = require('merge-stream');

// Browser synchronization
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

// Compile .scss to *.min.css
gulp.task('styles', function() {
  return gulp.src('app/'+syntax+'/**/*.'+syntax+'')
  .pipe(sourcemaps.init())
  .pipe(sass({ outputStyle: 'compressed' }).on("error", notify.onError()))
  .pipe(rename({ suffix: '.min', prefix : '' }))
  .pipe(autoprefixer(['last 15 versions']))
  .pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.stream())
});

// Concatenate all .js from /libs/ to libs.min.js
gulp.task('scripts', function() {
  return gulp.src([
    'app/libs/jquery/dist/jquery.min.js',
    'app/js/common.js', // Always at the end
    ])
  .pipe(sourcemaps.init())
  .pipe(concat('scripts.min.js'))
  .pipe(uglify())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('app/js'))
  .pipe(browserSync.reload({ stream: true }))
});

// Watch .html
gulp.task('code', function() {
  return gulp.src('app/*.html')
  .pipe(browserSync.reload({ stream: true }))
});

// Optimize HTML
gulp.task('minify-html', function() {
  return gulp.src('app/**/*.html')
  .pipe(htmlmin({
    collapseWhitespace: true,
    removeComments: true
  }))
  .pipe(gulp.dest('dist'));
});

// Generate Sprite icons
gulp.task('sprite', function () {
  // Generate our spritesheet 
  var spriteData = gulp.src('app/images/sprite-icons/*.*')
  .pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../images/sprite.png',
    cssName: '_sprite.scss',
    retinaSrcFilter: 'app/images/sprite-icons/*@2x.png',
    retinaImgName: 'sprite@2x.png',
    retinaImgPath: '../images/sprite@2x.png',
    padding: 5
  }));
 
  // Pipe image stream onto disk 
  var imgStream = spriteData.img
    .pipe(gulp.dest('app/images/'));
 
  // Pipe CSS stream onto disk 
  var cssStream = spriteData.css
    .pipe(gulp.dest('app/scss/mixins'));
 
  // Return a merged stream to handle both `end` events 
  return merge(imgStream, cssStream);
});

// Optimize images
gulp.task('img', function() {
  return gulp.src('app/images/**/*')
  .pipe(cache(imagemin([
    imgCompress({
      loops: 4,
      min: 70,
      max: 80,
      quality: 'high' 
    }),
    imagemin.gifsicle(),
    imagemin.optipng(),
    imagemin.svgo()
  ])))
  .pipe(gulp.dest('dist/images'));
});

// Cleaning Production distributive
gulp.task('clean', function(done) {
  del.sync('dist');
  done();
});

// Clear Cache
gulp.task('clear', function() {
  return cache.clearAll();
});

// Build Production distributive and copy there css-files and js-files
gulp.task('build-dist', function(done) {
  var buildCss = gulp.src('app/css/**/*.css')
  .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // del all comments from css
  .pipe(gulp.dest('dist/css'));
 
  var buildJs = gulp.src('app/js/**/*.js')
  .pipe(uglify()) // del all comments from js
  .pipe(gulp.dest('dist/js'));

  var buildFonts = gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'));
 
  done();
});

// Watch for all files changes
gulp.task('watch', function () {
  gulp.watch('app/'+syntax+'/**/*.'+syntax+'', gulp.parallel('styles'));
  gulp.watch(['app/libs/**/*.js', 'app/js/common.js'], gulp.parallel('scripts'));
  gulp.watch('app/*.html', gulp.parallel('code'));
});

// Build Production distributive with all updates
gulp.task('build', gulp.series('clean', 'sprite', 'styles', 'scripts', 'minify-html', 'img', 'build-dist'));

// Watch for all html, js and css files changes during work
gulp.task('default', gulp.parallel('sprite', 'styles', 'scripts', 'browser-sync', 'watch'));
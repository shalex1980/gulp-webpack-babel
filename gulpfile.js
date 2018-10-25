const gulp = require('gulp');
const rigger = require('gulp-rigger');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const cssmin = require('gulp-cssmin');
const prefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
const pngquant = require('gulp-pngquant');
const notify = require('gulp-notify');
const sourceMap = require('gulp-sourcemaps');
const cache = require('gulp-cache');
const watch = require('gulp-watch');
const webpack = require('webpack-stream');
const browserSync = require('browser-sync').create();

const path = {
  public: {
    html: 'public/',
    img: 'public/images/',
    js: 'public/js/',
    style: 'public/css/',
    fonts: 'public/fonts/'
  },
  src: {
    html: 'src/*.html',
    img: 'src/images/**/*.+(jpg|png)',
    js: 'src/js/*.js',
    style: 'src/scss/**/*.scss',
    fonts: 'src/fonts/**/*.*'
  },
}

gulp.task('browser-sync', function(){
  browserSync.init({
    server: {
      baseDir: "./public"
    }
  })
});
gulp.task('html', function() {
  return gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.public.html))
    .pipe(browserSync.stream())
});
gulp.task('script', function() {
  return gulp.src('src/js/app.js')
  .pipe(webpack({
      mode: 'development',
      output: {
        path: __dirname + 'public/js/',
        filename: '[name].js'
      },
      entry: {
        app: './src/js/app.js',
        main: './src/js/main.js'
      },
      module: {
        rules: [
          {
            test: /\.(js)$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
            query: {
              presets: ['env']
            }
          }
        ]
      },
      externals: {
        jquery: 'jQuery'
      }
  }))
  .pipe(gulp.dest(path.public.js))
  .pipe(uglify())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest(path.public.js))
  .pipe(browserSync.stream())
});
gulp.task('style', function() {
  return gulp.src(path.src.style)
  .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message &>")}))
  .pipe(sourceMap.init())
  .pipe(sass({errLogToConsole: true}))
  .pipe(prefixer())
  //.pipe(cssmin())
  .pipe(sourceMap.write())
  .pipe(gulp.dest(path.public.style))
  .pipe(browserSync.stream())
});
gulp.task('img', function() {
  return gulp.src(path.src.img)
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.gifsicle({interlaced: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
        {removeViewBox: false}
        ],
      }) 
  ]))
  //.pipe(imagemin())
  .pipe(gulp.dest(path.public.img))
  .pipe(browserSync.stream())
});
gulp.task('fonts', function() {
  return gulp.src(path.src.fonts)
  .pipe(gulp.dest(path.public.fonts))
  .pipe(browserSync.stream())
});
gulp.task('watch', function() {
  watch([path.src.html], function() {
    gulp.start('html');
  });
  watch([path.src.js], function() {
    gulp.start('script');
  });
  watch([path.src.style], function() {
    gulp.start('style');
  });
  watch([path.src.img], function() {
    gulp.start('img');
  });
});
gulp.task('build',['html','script','style','img', 'fonts']);
gulp.task('default',['build', 'browser-sync', 'watch'])
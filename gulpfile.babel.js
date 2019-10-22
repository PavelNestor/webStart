import gulp, { dest, series, parallel, src, watch } from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import webpack from 'webpack-stream';
import browserSync from 'browser-sync';

const isBuild = false;
const plugins = loadPlugins();
const {
  autoprefixer,
  babel,
  concat,
  noop,
  pug,
  sass,
  sourcemaps,
  uglify
} = plugins;
const reload = browserSync.reload;
const outputStyle = isBuild ? 'compressed' :'expanded';
const outputUglify = isBuild ? uglify() : noop();

const serverConfig = {
  server: {
    baseDir: "./dist"
  },
  tunnel: false,
  host: "localhost",
  port: 3003,
  logPrefix: "browser-sync"
};

const paths = {
  build: {
    view: "build/",
    js: "build/js/",
    css: "build/css/",
    img: "build/img/",
    fonts: "build/fonts/"
  },
  dist: {
    view: "dist/",
    js: "dist/js/",
    style: "dist/css/",
    img: "dist/img/",
    fonts: "dist/fonts/"
  },
  src: {
    view: ["src/*.pug"],
    js: "src/js/*.js",
    style: "src/sass/build.sass",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*"
  },
  watch: {
    view: "src/**/*.pug",
    js: "src/js/**/*.js",
    style: "src/sass/**/*.sass",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*"
  },
};

paths.dest = isBuild ? paths.build : paths.dist;

// Server
export const sync = () => {
  setTimeout(() => {
    browserSync.init(serverConfig);
  }, 100);
};

// Scripts
export const scripts = () => src(paths.src.js, { sourcemaps: true })
  .pipe(webpack())
  .pipe(babel())
  .pipe(outputUglify)
  .pipe(concat('main.min.js'))
  .pipe(dest(paths.dest.js))
  .pipe(reload({ stream: true }));

// Styles 
export const styles = () => src(paths.src.style)
  .pipe(sourcemaps.init())
  .pipe(sass({
    soursemap: !isBuild,
    outputStyle: outputStyle
  }).on('error', sass.logError))
  .pipe(autoprefixer())
  .pipe(sourcemaps.write())
  .pipe(dest(paths.dest.style))
  .pipe(reload({ stream: true }));

// View 
export const view = () => src(paths.src.view)
  .pipe(pug({
    pretty: !isBuild
  }))
  .pipe(dest(paths.dest.view))
  .pipe(reload({ stream: true }));

// Images
export const images = () => src(paths.src.img)
  .pipe(dest(paths.dest.img));

export const watchFiles = () => {
  watch(paths.watch.view, series(view));
  watch(paths.watch.js, series(scripts));
  watch(paths.watch.style, series(styles));
  return;
};

export const dev = series(parallel(styles, view, scripts, images, sync, watchFiles));
export const build = series(parallel(styles, view, scripts, images));

export default dev;

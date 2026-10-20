const fs = require("fs");
const merge2 = require('merge2');
const gulp = require("gulp");
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const babelConfig = require('./.babelrc.js');

const strTsConfig = fs.readFileSync('./tsconfig.json', 'utf8');
const my = JSON.parse(strTsConfig.replace(/(\32*\/\/\s*.*)(?:[\r\n])/g, '').replace(/(\32*\/\*.+\*\/)/g, '').replace(/,([\r\n\s]*[{\]}])/g, (s, $1) => $1).replace(/\s*/g, ''));
const tsDefaultReporter = ts.reporter.defaultReporter();
const { src, dest } = gulp;
function babelify(js) {
  const stream = js
    .pipe(babel(babelConfig).on("error", function(e){console.error(e);}));
  return stream;
}
module.exports.default = function compile(cb) {
  const assets = src(['src/**/*.(png|svg|jpg|gif)']);
  const less = src(['src/**/*.less', 'src/**/*.css']);
  function error(e){
    tsDefaultReporter.error(e);
    throw new Error();
  }
  function finish(results) {
    tsDefaultReporter.finish(results);
  }

  const mainTsSource = src(['src/**/*.tsx', 'src/**/*.ts']).pipe(
    ts(my.compilerOptions, {
      error,
      finish,
    }),
  );
  const mainJsSource = src(['src/**/*.jsx', 'src/**/*.js']);
  const componentsSource = src(['components/**/*.ts']).pipe(
    ts(my.compilerOptions, {
      error,
      finish,
    }),
  );

  if (fs.existsSync('./lib')) {
    fs.rmdirSync("./lib", {recursive: true});
  }
  if (fs.existsSync('./typings')) {
    fs.rmdirSync("./typings", {recursive: true});
  }
  merge2([less, babelify(mainTsSource.js), babelify(mainJsSource), assets]).pipe(dest(()=>"lib"));
  componentsSource.pipe(dest(()=>"components"));
  mainTsSource.dts.pipe(dest(()=>"typings"));
  merge2([mainTsSource, mainJsSource, componentsSource]).on('error', function err(){
    cb(new Error());
    process.exit(1);
  }).on('finish', function fin(){cb();});
};
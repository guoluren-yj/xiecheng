const merge2 = require('merge2');
const { execSync } = require('child_process');
const through2 = require('through2');
const webpack = require('webpack');
const babel = require('gulp-babel');
const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const path = require('path');
const ts = require('gulp-typescript');
const gulp = require('gulp');
const rimraf = require('rimraf');
const stripCode = require('gulp-strip-code');
const sourcemaps = require('gulp-sourcemaps');
const runCmd = require('./tools/runCmd');
const getBabelCommonConfig = require('./tools/getBabelCommonConfig');
const transformLess = require('./tools/transformLess');
const getNpmArgs = require('./tools/utils/get-npm-args');
const { cssInjection } = require('./tools/utils/styleUtil');
const tsConfig = require('./tools/getTSCommonConfig')();
const replaceLib = require('./tools/replaceLib');

const tsDefaultReporter = ts.reporter.defaultReporter();
const cwd = process.cwd();
const libDir = path.join(cwd, 'lib');
const esDir = path.join(cwd, 'es');
const libRcDir = path.join(cwd, 'lib', 'rc-components');
const esRcDir = path.join(cwd, 'es', 'rc-components');

const packageJson = require(`${cwd}/package.json`);

function dist(done) {
  rimraf.sync(path.join(cwd, 'dist'));
  process.env.RUN_ENV = 'PRODUCTION';
  const webpackConfig = require(path.join(cwd, 'webpack.config.js'));
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    const buildInfo = stats.toString({
      colors: true,
      children: true,
      chunks: false,
      modules: false,
      chunkModules: false,
      hash: false,
      version: false,
    });
    console.log(buildInfo);
    done(0);
  });
}

function tag() {
  console.log('tagging');
  const { version } = packageJson;
  execSync(`git tag v${version}`);
  execSync(`git push origin ${version}:${version}`);
  execSync('git push origin master:master');
  console.log('tagged');
}

function babelify(js, modules) {
  const babelConfig = getBabelCommonConfig(modules);
  if (modules === false) {
    babelConfig.plugins.push(replaceLib);
  }
  let stream = js
    .pipe(sourcemaps.init())
    .pipe(babel(babelConfig))
    .pipe(
      through2.obj(function z(file, encoding, next) {
        this.push(file.clone());
        if (file.path.match(/[/\\]style[/\\]index\.js/)) {
          const content = file.contents.toString(encoding);
          file.contents = Buffer.from(cssInjection(content));
          file.path = file.path.replace(/index\.js/, 'css.js');
          this.push(file);
          next();
        } else {
          next();
        }
      }),
    )
    .pipe(sourcemaps.write('.'));
  if (modules === false) {
    stream = stream.pipe(
      stripCode({
        start_comment: '@remove-on-es-build-begin',
        end_comment: '@remove-on-es-build-end',
      }),
    );
  }
  return stream;
}

function compileRc(modules) {
  const source = ['components/rc-components/**/*.jsx', 'components/rc-components/**/*.js'];
  return babelify(gulp.src(source), modules);
}

function compile(modules) {
  const less = gulp.src(['components/**/*.less']).pipe(
    through2.obj(function (file, encoding, next) {
      this.push(file.clone());
      if (
        file.path.match(/[/\\]style[/\\]index\.less$/) ||
        file.path.match(/[/\\]style[/\\]v2-compatible-reset\.less$/)
      ) {
        transformLess(file.path)
          .then(css => {
            file.contents = Buffer.from(css);
            file.path = file.path.replace(/\.less$/, '.css');
            this.push(file);
            next();
          })
          .catch(e => {
            console.error(e);
          });
      } else {
        next();
      }
    }),
  );
  const assets = gulp.src(['components/**/*.@(png|svg|eot|ttf|woff)']);
  let error = 0;
  const source = ['components/**/*.tsx', 'components/**/*.ts', 'typings/**/*.d.ts'];
  const tsResult = gulp.src(source).pipe(
    ts(tsConfig, {
      error(e) {
        tsDefaultReporter.error(e);
        error = 1;
      },
      finish: tsDefaultReporter.finish,
    }),
  );

  function check() {
    if (error && !argv['ignore-error']) {
      process.exit(1);
    }
  }

  tsResult.on('finish', check);
  tsResult.on('end', check);

  return merge2([less, babelify(tsResult.js, modules), tsResult.dts, assets]);
}

function publish(tagString, done) {
  let args = ['publish', '--with-tools', '--access=public'];
  if (tagString) {
    args = args.concat(['--tag', tagString]);
  }
  const publishNpm = process.env.PUBLISH_NPM_CLI || 'npm';
  runCmd(publishNpm, args, code => {
    if (!argv['skip-tag']) {
      tag();
    }
    done(code);
  });
}

function pub(done) {
  dist(code => {
    if (code) {
      done(code);
      return;
    }
    const notOk = !packageJson.version.match(/^\d+\.\d+\.\d+$/);
    let tagString;
    if (argv['npm-tag']) {
      tagString = argv['npm-tag'];
    }
    if (!tagString && notOk) {
      tagString = 'next';
    }
    if (packageJson.scripts['pre-publish']) {
      runCmd('npm', ['run', 'pre-publish'], code2 => {
        if (code2) {
          done(code2);
          return;
        }
        publish(tagString, done);
      });
    } else {
      publish(tagString, done);
    }
  });
}

gulp.task(
  'check-git',
  gulp.series(done => {
    runCmd('git', ['status', '--porcelain'], (code, result) => {
      if (/^\?\?/m.test(result)) {
        return done(`There are untracked files in the working tree.\n${result}
      `);
      }
      if (/^([ADRM]| [ADRM])/m.test(result)) {
        return done(`There are uncommitted changes in the working tree.\n${result}
      `);
      }
      return done();
    });
  }),
);

gulp.task('clean', done => {
  rimraf.sync(path.join(cwd, '_site'));
  done();
});

gulp.task(
  'dist',
  gulp.series(done => {
    dist(done);
  }),
);

gulp.task('compile-with-es', done => {
  rimraf.sync(esDir);
  compile(false)
    .pipe(gulp.dest(esDir))
    .on('finish', done);
});

gulp.task('compile-with-lib', done => {
  rimraf.sync(libDir);
  compile()
    .pipe(gulp.dest(libDir))
    .on('finish', done);
});

gulp.task('compile-with-rc-es', done => {
  compileRc(false)
    .pipe(gulp.dest(esRcDir))
    .on('finish', done);
});

gulp.task('compile-with-rc-lib', done => {
  compileRc()
    .pipe(gulp.dest(libRcDir))
    .on('finish', done);
});

gulp.task(
  'compile',
  gulp.parallel(
    'compile-with-es',
    'compile-with-lib',
    'compile-with-rc-es',
    'compile-with-rc-lib',
  ),
);

gulp.task('pub', gulp.series('check-git', 'compile', pub));

gulp.task(
  'guard',
  gulp.series(done => {
    function reportError() {
      console.log(chalk.bgRed('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'));
      console.log(chalk.bgRed('!! `npm publish` is forbidden for this package. !!'));
      console.log(chalk.bgRed('!! Use `npm run pub` instead.        !!'));
      console.log(chalk.bgRed('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'));
    }

    const npmArgs = getNpmArgs();
    if (npmArgs) {
      for (let arg = npmArgs.shift(); arg; arg = npmArgs.shift()) {
        if (/^pu(b(l(i(sh?)?)?)?)?$/.test(arg) && npmArgs.indexOf('--with-tools') < 0) {
          reportError();
          done(1);
          return;
        }
      }
    }
    done();
  }),
);

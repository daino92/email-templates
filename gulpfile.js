const { src, dest, series, parallel, watch } = require("gulp");
const argv = require("yargs").argv;
const gulp_mjml = require("gulp-mjml");
const mjml = require("mjml");

const isProduction = argv.env === "production";

const { sendToEmail } = require("./sendEmails");

function watchAndCompileMJML() {
  const watcher = watch(["./src/**/*.mjml"]);
  watcher.on("change", function () {
    compileMJML();
  });
  watcher.on("add", function () {
    compileMJML();
  });
  watcher.on("unlink", function () {
    compileMJML();
  });
  //watcher.close();
}

function compileMJML() {
  const mjmlOptions = {
    keepComments: true,
    beautify: false,
    minify: false,
    validationLevel: "soft",
    filePath: ".",
    minifyOptions: {
      collapseWhitespace: true,
      minifyCSS: true,
      removeEmptyAttributes: false,
      // See html-minifier documentation for more available options
    },
  };
  return src(["./src/**/*.mjml", "!./src/**/_*.mjml"])
    .pipe(gulp_mjml(mjml, mjmlOptions))
    .pipe(dest("./dist"));
}

exports.watch = parallel(watchAndCompileMJML);
exports.send = series(compileMJML, sendToEmail);
exports.default = parallel(compileMJML);

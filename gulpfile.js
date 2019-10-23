// Extract methods from Gulp
// https://gulpjs.com/docs/en/api/src
const { src, dest, series, parallel, watch } = require("gulp");

// Import plugins
// https://gulpjs.com/docs/en/getting-started/using-plugins
const autoprefixer = require("gulp-autoprefixer");
const connect = require("gulp-connect");
const del = require("del");
const eslint = require("gulp-eslint");
const nunjucksRender = require("gulp-nunjucks-render");
const prettify = require("gulp-jsbeautifier");
const rename = require("gulp-rename");
const sass = require("gulp-dart-sass");
const size = require("gulp-size");
const webpack = require("webpack-stream");

const data = {
  projectName: "Huisarts Poelstra",
  environment: "development",
  googleAnalyticsID: "UA-26179509-4",
  sitemapRootUrl: "https://www.huisartspoelstra.nl"
};

const localisedData = {
  nl: {
    locale: "nl",
    languageCode: "nl-NL",
    links: [
      { label: "Welkom", url: "/nl/" },
      { label: "Spreekuren", url: "/nl/spreekuren/" },
      { label: "Spoedgeval", url: "/nl/spoedgeval/" },
      { label: "Inschrijving", url: "/nl/inschrijving/" },
      { label: "Herhaalrecepten", url: "/nl/herhaalrecepten/" },
      { label: "Sluitingsdagen", url: "/nl/sluitingsdagen/" },
      { label: "Medewerkers", url: "/nl/medewerkers/" },
      { label: "Interessante links", url: "/nl/interessante-links/" },
      { label: "Klachten", url: "/nl/klachten/" },
      { label: "Privacy", url: "/nl/privacy/" },
      { label: "Contact", url: "/nl/contact/" }
    ]
  },
  en: {
    locale: "en",
    languageCode: "en-NL",
    links: [
      { label: "Welcome", url: "/en/" },
      { label: "Consultations", url: "/en/consultations/" },
      { label: "Emergencies", url: "/en/emergencies/" },
      { label: "New patients", url: "/en/new-patients/" },
      { label: "Repeat prescriptions", url: "/en/repeat-prescriptions/" },
      { label: "Closing days", url: "/en/closing-days/" },
      { label: "Meet our team", url: "/en/our-team/" },
      { label: "Interesting links", url: "/en/interesting-links/" },
      { label: "Complaints", url: "/en/complaints/" },
      { label: "Privacy", url: "/en/privacy/" },
      { label: "Contact", url: "/en/contact/" }
    ]
  }
};

// Removes the dist folder
function clean() {
  return del(["dist"]);
}

// Copies over all files from `src/public` as they are to `dist/`
function assets() {
  return src("src/public/**/*").pipe(dest("dist/"));
}

// Compiles all the HTML
function nunjucks(locale) {
  const mergedData = Object.assign({}, data, localisedData[locale]);

  return src(`src/html/pages/${locale}/**/*.+(html|njk)`)
    .pipe(
      nunjucksRender({
        path: ["src/html"],
        data: {
          data: mergedData
        }
      })
    )
    .pipe(
      prettify({
        html: {
          indent_inner_html: true,
          indent_size: 2,
          max_preserve_newlines: 0
        }
      })
    )
    .pipe(dest(`dist/${locale}`));
}

// Compiles all the CSS
function css() {
  return src("src/css/app.scss")
    .pipe(
      sass({
        outputStyle: "compressed"
      }).on("error", sass.logError)
    )
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(rename("app.min.css"))
    .pipe(dest("dist/assets/css"));
}

// Check your JS syntax against ES Lint
function lintJs() {
  return src("src/js/app.js")
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Build the main JS file
// https://webpack.js.org/guides/integrations/#gulp
function buildJs() {
  return src("src/js/app.js")
    .pipe(
      webpack({
        module: {
          rules: [
            {
              test: /\.(js|jsx)$/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env", "@babel/preset-react"]
                }
              }
            }
          ]
        }
      })
    )
    .pipe(rename("app.min.js"))
    .pipe(dest("dist/assets/js"));
}

// Reports an overview of the `dist/` folder
function report() {
  return src(["dist/**/*"]).pipe(
    size({
      showFiles: true,
      showTotal: false
    })
  );
}

// Spins up a localhost server on http://localhost:9000
function localhost() {
  connect.server({
    root: "dist",
    port: 9000
  });
}

// Watches the `src/` folder for file changes and fires tasks accordingly
// https://gulpjs.com/docs/en/getting-started/watching-files
function watchers() {
  watch("src/public/**/*", assets);
  watch("src/html/**/*.njk", html);
  watch("src/css/**/*.scss", css);
  watch("src/js/**/*.js", js);
}

function dutch() {
  return nunjucks("nl");
}

function english() {
  return nunjucks("en");
}

// Create Gulp commands
// https://gulpjs.com/docs/en/getting-started/creating-tasks
const js = series(lintJs, buildJs);
const html = series(dutch, english);
const build = series(clean, parallel(assets, dutch, css, js), report);
const serve = series(build, parallel(localhost, watchers));

// Finally make those tasks available in Gulp CLI
exports.build = build;
exports.serve = serve;

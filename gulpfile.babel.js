"use strict";

// Gulp packages
import autoprefixer from "gulp-autoprefixer";
import babel from "gulp-babel";
import concat from "gulp-concat";
import connect from "gulp-connect";
import del from "del";
import eslint from "gulp-eslint";
import gulp from "gulp";
import minifyCSS from "gulp-clean-css";
import noop from "gulp-noop";
import nunjucksRender from "gulp-nunjucks-render";
import preprocess from "gulp-preprocess";
import prettify from "gulp-jsbeautifier";
import rename from "gulp-rename";
import replace from "gulp-replace";
import sass from "gulp-sass";
import sitemap from "gulp-sitemap";
import size from "gulp-size";
import tap from "gulp-tap";
import uglify from "gulp-uglify";
import util from "gulp-util";

// Constants used for building the project
const data = {
  projectName: "Huisarts Poelstra",
  environment: util.env.env || "development",
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
      { label: "Contact", url: "/en/contact/" }
    ]
  }
};

// Delete the dist folder
gulp.task("deleteDist", () => {
  return del(["dist"]);
});

// Copy over all files from public folder "as they are" to the dist folder
gulp.task("copyPublic", () => {
  return gulp
    .src("src/public/**/*")
    .pipe(gulp.dest("dist/"))
    .pipe(connect.reload());
});

// Copy the outdatedbrowser JS
gulp.task("copyOutdatedBrowserJs", () => {
  return gulp
    .src(
      "bower_components/outdated-browser/outdatedbrowser/outdatedbrowser.min.js"
    )
    .pipe(gulp.dest("dist/assets/js/"));
});

// Copy the outdatedbrowser CSS
gulp.task("copyOutdatedBrowserCss", () => {
  return gulp
    .src(
      "bower_components/outdated-browser/outdatedbrowser/outdatedbrowser.min.css"
    )
    .pipe(gulp.dest("dist/assets/css/"));
});

// Compile all HTML (Dutch pages only)
gulp.task("compileHtmlDutch", () => {
  return compileHtml("nl");
});

// Compile all HTML (English pages only)
gulp.task("compileHtmlEnglish", () => {
  return compileHtml("en");
});

function compileHtml(locale) {
  const mergedData = Object.assign({}, data, localisedData[locale]);
  return (
    gulp
      .src(`src/templates/pages/${locale}/**/*.+(html|nunjucks)`)
      // .pipe(tap(function(file, t) {
      //   util.log(file.dirname.toString())
      // }))
      .pipe(
        nunjucksRender({
          path: ["src/templates"],
          data: {
            data: mergedData
          }
        })
      )
      .pipe(prettify({ config: "./jsbeautifyrc.json" }))
      .pipe(gulp.dest(`dist/${locale}`))
      .pipe(connect.reload())
  );
}

gulp.task("sitemap", () => {
  return gulp
    .src(["dist/**/*.html", "!dist/google2dbd407974c11f6a.html"])
    .pipe(
      sitemap({
        siteUrl: data.sitemapRootUrl,
        changefreq: "monthly",
        priority: 0.5
      })
    )
    .pipe(gulp.dest("./dist"));
});

// Compile all CSS
gulp.task("compileCss", () => {
  return gulp
    .src("src/styles/**/*.scss")
    .pipe(
      sass({
        outputStyle: "expanded",
        includePaths: require("node-normalize-scss").includePaths
      }).on("error", sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: [
          "> 1% in AU",
          "Explorer > 9",
          "Firefox >= 17",
          "Chrome >= 10",
          "Safari >= 6",
          "iOS >= 6"
        ],
        cascade: false
      })
    )
    .pipe(minifyCSS({ specialComments: "none" }))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(gulp.dest("dist/assets/css"))
    .pipe(connect.reload());
});

// Lint app JS, warn about bad JS, break on errors
gulp.task("lintJs", () => {
  return gulp
    .src(["src/js/*.js"])
    .pipe(eslint())
    .pipe(eslint.format());
});

// Compile all JS
gulp.task("compileProjectJs", () => {
  return gulp
    .src(["src/js/*.js"])
    .pipe(preprocess({ context: data }))
    .pipe(babel())
    .pipe(
      data.environment !== "development"
        ? uglify({ preserveComments: "license" })
        : noop()
    )
    .pipe(rename({ extname: ".min.js" }))
    .pipe(gulp.dest("dist/assets/js"));
});

// Add vendor files to minified project JS
gulp.task("includeVendors", () => {
  return gulp
    .src(["src/js/vendor/google-analytics.js", "dist/assets/js/scripts.min.js"])
    .pipe(concat("scripts.min.js"), { newLine: "\n\n\n\n" })
    .pipe(replace(/^\s*\r?\n/gm, ""))
    .pipe(gulp.dest("dist/assets/js/"));
});

// Live reload JS files in browser
gulp.task("reloadJs", () => {
  return gulp.src(["dist/assets/js/**/*.js"]).pipe(connect.reload());
});

// Build all JS files
gulp.task(
  "compileJs",
  gulp.series("lintJs", "compileProjectJs", "includeVendors", "reloadJs")
);

// Watch all files and run tasks when files change
// To make Gulp watch itself we add the slurped trick
gulp.slurped = false; // step 1
gulp.task("watch", () => {
  if (!gulp.slurped) {
    // step 2
    gulp.watch(["src/public/**/*"], gulp.parallel("copyPublic"));
    gulp.watch(
      ["src/templates/**/*.+(html|nunjucks|json)"],
      gulp.parallel(["compileHtmlDutch", "compileHtmlEnglish"])
    );
    gulp.watch(["src/styles/**/*.scss"], gulp.series("compileCss"));
    gulp.watch(
      ["src/js/**/*.js", ".babelrc", ".eslintrc"],
      gulp.series("compileJs")
    );
    gulp.watch(
      ["gulpfile.babel.js", "package.json", "bower.json"],
      gulp.series(["build"])
    );
    gulp.watch(
      ["gulpfile.babel.js", "package.json", "bower.json"],
      gulp.series(["build"])
    );
    gulp.slurped = true; // step 3
  }
});

// Run a local server on http://localhost:9000
gulp.task("serve", () => {
  connect.server({
    root: "dist",
    livereload: true,
    port: 9000
  });
});

// Report all file sizes
gulp.task("report", () => {
  return gulp
    .src([
      "dist/**/*",
      "!dist/assets/favicons/**",
      "!dist/assets/fonts/**",
      "!dist/assets/img/**"
    ])
    .pipe(
      size({
        showFiles: true,
        showTotal: false
      })
    );
});

// Build the entire dist folder
gulp.task(
  "build",
  gulp.series(
    "deleteDist",
    gulp.parallel(
      gulp.series(
        gulp.parallel("compileHtmlDutch", "compileHtmlEnglish"),
        "sitemap"
      ),
      "compileCss",
      "compileJs",
      "copyPublic",
      "copyOutdatedBrowserJs",
      "copyOutdatedBrowserCss"
    ),
    "report"
  )
);

// Default gulp command
gulp.task("default", gulp.series("build", gulp.parallel("watch", "serve")));

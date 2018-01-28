// Envify replaces the NODE_ENV below with a plain string.
// Run `NODE_ENV=production gulp` to export the production config.
// Run `gulp` to export the development config.
// Documentation:
// https://github.com/hughsk/envify
// https://github.com/hughsk/uglifyify
if (process.env.NODE_ENV === "production") {
  module.exports = require("./production");
} else {
  module.exports = require("./development");
}

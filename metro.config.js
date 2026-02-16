const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// For web, we need fonts as assets for Metro, but they'll be served from static folder
config.resolver.assetExts.push(
  // Add font extensions
  "ttf",
  "otf",
  "woff",
  "woff2",
);

module.exports = config;

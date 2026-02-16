const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure fonts are treated as assets and copied correctly
config.resolver.assetExts.push(
  // Add font extensions
  "ttf",
  "otf",
  "woff",
  "woff2",
);

module.exports = config;

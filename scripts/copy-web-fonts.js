/**
 * Post-build script: Copy font files from Metro's bundled output
 * to a clean path without 'node_modules' (which some hosts may filter).
 *
 * Metro bundles fonts to:
 *   dist/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.<hash>.ttf
 *
 * This script copies them to:
 *   dist/_expo/static/fonts/Ionicons.ttf
 *
 * The fonts.css @font-face declarations reference the clean path.
 */

const fs = require("fs");
const path = require("path");

const srcDir = path.join(
  __dirname,
  "..",
  "dist",
  "assets",
  "node_modules",
  "@expo",
  "vector-icons",
  "build",
  "vendor",
  "react-native-vector-icons",
  "Fonts"
);

const destDir = path.join(__dirname, "..", "dist", "_expo", "static", "fonts");

// Create destination directory
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".ttf"));

  for (const file of files) {
    // Strip the content hash: Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf → Ionicons.ttf
    const cleanName = file.replace(/\.[a-f0-9]{32}\.ttf$/, ".ttf");
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, cleanName));
  }

  console.log(
    `✅ Copied ${files.length} font files to dist/_expo/static/fonts/`
  );
} else {
  console.warn("⚠️  Metro font source directory not found:", srcDir);
  console.warn(
    "   Fonts will only be available via Metro's default asset paths."
  );
}

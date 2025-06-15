import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dist directory exists
const distDir = path.join(__dirname, "../dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Clean dist directory
console.log("Cleaning dist directory...");
fs.readdirSync(distDir).forEach((file) => {
  fs.rmSync(path.join(distDir, file), { recursive: true, force: true });
});

// Compile TypeScript
console.log("Compiling TypeScript...");
execSync("tsc", { stdio: "inherit" });

// Copy static files
console.log("Copying static files...");
const staticFiles = [
  { src: "manifest.json", dest: "manifest.json" },
  { src: "src/popup/popup.html", dest: "popup/popup.html" },
  { src: "src/assets", dest: "assets" },
];

staticFiles.forEach(({ src, dest }) => {
  const sourcePath = path.join(__dirname, "..", src);
  const destPath = path.join(distDir, dest);

  if (fs.existsSync(sourcePath)) {
    if (fs.lstatSync(sourcePath).isDirectory()) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.cpSync(sourcePath, destPath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(sourcePath, destPath);
    }
  }
});

// Create zip file
console.log("Creating zip file...");
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")
);
const zipName = `url-redirector-text-replacer-${packageJson.version}.zip`;
const zipPath = path.join(__dirname, "..", zipName);

// Remove existing zip if it exists
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Create zip using system zip command
execSync(`cd ${distDir} && zip -r ${zipPath} .`, { stdio: "inherit" });

console.log("Build completed successfully!");
console.log(`Extension package: ${zipPath}`);

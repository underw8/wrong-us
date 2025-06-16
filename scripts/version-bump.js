#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the package.json path
const packagePath = path.join(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

// Get the manifest.json path for Chrome extension
const manifestPath = path.join(__dirname, "../manifest.json");
const manifestJson = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

// Build number tracking file
const buildNumberPath = path.join(__dirname, "../build-number.json");

// Get current build number or initialize
let buildData = { buildNumber: 1 };
try {
  if (fs.existsSync(buildNumberPath)) {
    buildData = JSON.parse(fs.readFileSync(buildNumberPath, "utf8"));
  }
} catch {
  console.log("🥷 Initializing ninja build tracking...");
}

// Get version bump type from command line argument (patch, minor, major)
const bumpType = process.argv[2] || "patch";

// Current date for version format
const now = new Date();
const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
const month = (now.getMonth() + 1).toString().padStart(2, "0");
const day = now.getDate().toString().padStart(2, "0");
const dateString = `${year}${month}${day}`;

// Parse current version to get major version
const currentVersion = packageJson.version;
let major = 1; // Default major version for extension

// Try to extract major version from current version if it follows our format
const versionMatch = currentVersion.match(/^(\d+)\.(\d{6})\.(\d+)$/);
if (versionMatch) {
  major = parseInt(versionMatch[1]);
}

// Determine new version based on bump type
let newMajor = major;
let patch = 0;

// Check if we're building on the same date as the last build
const lastDateMatch = currentVersion.match(/^\d+\.(\d{6})\.\d+$/);
const lastDate = lastDateMatch ? lastDateMatch[1] : null;

if (lastDate === dateString) {
  // Same date, increment patch
  const patchMatch = currentVersion.match(/^\d+\.\d{6}\.(\d+)$/);
  patch = patchMatch ? parseInt(patchMatch[1]) + 1 : 0;
} else {
  // New date, reset patch to 0
  patch = 0;
}

switch (bumpType) {
  case "major":
    newMajor = major + 1;
    patch = 0; // Reset patch on major bump
    break;
  case "minor":
    // For this format, minor bump means new date with patch 0
    patch = 0;
    break;
  case "patch":
  default:
    // patch is already calculated above
    break;
}

// Create new version in format: major.YYMMDD.patch
const newVersion = `${newMajor}.${dateString}.${patch}`;

// Increment build number
buildData.buildNumber += 1;

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");

// Update manifest.json for Chrome extension
manifestJson.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 2) + "\n");

// Update build number file
fs.writeFileSync(buildNumberPath, JSON.stringify(buildData, null, 2));

console.log(`🕵️ Wrong Us - The Internet Imposter v${newVersion}`);
console.log(`🔢 Build: ${buildData.buildNumber}`);
console.log(`📦 Build type: ${bumpType}`);

// Create version info file for build metadata
const versionInfo = {
  version: newVersion,
  buildNumber: buildData.buildNumber,
  displayVersion: `v${newVersion} - Build ${buildData.buildNumber}`,
  buildDate: new Date().toISOString(),
  buildType: bumpType,
  gitCommit: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || "local",
  environment: process.env.NODE_ENV || "development",
  extensionName: manifestJson.name,
  description: manifestJson.description,
};

const versionFilePath = path.join(__dirname, "../src/version.json");
fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));

console.log(`✅ Version info written to src/version.json`);
console.log(`📋 Display format: ${versionInfo.displayVersion}`);
console.log(`🥷 Ninja mission updated in manifest.json`);

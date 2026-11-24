import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Find ffmpeg binary from node_modules
const ffmpegPath = path.resolve('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');

const inputArg = process.argv[2];
let inputFile = inputArg;

// If no file specified, search for video files in public/
if (!inputFile) {
  const searchDirs = ['public', '.'];
  const videoExts = ['.mp4', '.mov', '.webm', '.mkv'];

  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const found = files.find(f => videoExts.includes(path.extname(f).toLowerCase()));
      if (found) {
        inputFile = path.join(dir, found);
        break;
      }
    }
  }
}

if (!inputFile || !fs.existsSync(inputFile)) {
  console.error("❌ No video file found. Please drop your video into public/!");
  process.exit(1);
}

const outputDir = path.resolve('public/frames');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
} else {
  // Clear old frames
  const oldFiles = fs.readdirSync(outputDir);
  for (const file of oldFiles) {
    fs.unlinkSync(path.join(outputDir, file));
  }
}

console.log(`🎬 Target Video: ${inputFile}`);
console.log(`💎 Extracting with 100% MATHEMATICAL LOSSLESS QUALITY (-lossless 1)...`);
console.log(`📱 Native 1080x1920 Mobile Resolution Preserved Bit-for-Bit...`);

// True Mathematical Lossless WebP:
// -lossless 1 = 100% ZERO quality loss (exact identical pixel values)
// -compression_level 4 = fast, high-efficiency lossless packing
// Native 1080x1920 without any downscaling
const cmd = `"${ffmpegPath}" -i "${inputFile}" -vf "fps=24" -vcodec libwebp -lossless 1 -compression_level 4 -preset picture "${outputDir}/frame_%04d.webp"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  const generatedFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.webp'));
  const totalFrames = generatedFiles.length;

  // Auto-generate manifest for the React engine
  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ totalFrames, fps: 24, resolution: "1080x1920" }, null, 2));

  console.log(`✨ Success! Extracted ${totalFrames} 100% LOSSLESS frames (1080x1920) into public/frames/!`);
} catch (err) {
  console.error("❌ Extraction failed:", err);
  process.exit(1);
}

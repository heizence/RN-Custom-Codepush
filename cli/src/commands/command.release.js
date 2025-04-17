const chalk = require("chalk");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");
const FormData = require("form-data");
const { uuidv4 } = require("uuid");
const archiver = require("archiver");

const API = require("../libs/APIs");

const printCommandGuide = () => {
  console.log(`Usage: greenlight-codepush release <appName> <platform> [options]\n`);
  console.log("options : ");
  console.log(`  -d, --deploymentName           Deployment to release the update to  [string] [default: "Staging"]`);
  console.log(`  -m, --mandatory                Specifies whether this release should be considered mandatory  [boolean] [default: false]`);
  console.log(
    `  -t, --targetBinaryVersion      Semver expression that specifies the binary app version(s) this release is targeting (e.g. 1.1.0, ~1.2.3). If omitted, the release will target the exact version specified in the "Info.plist" (iOS), "build.gradle" (Android) or "Package.appxmanifest" (Windows) files.  [string] [default: null]`
  );
  console.log(`  -v, --version                  display version  [boolean]`);
  console.log(`\nexample : `);
  console.log(
    `    release MyApp android -d Production  Releases the React Native Android project in the current working directory to the "MyApp" app's "Production" deployment`
  );
};

const buildAndReleaseBundle = async (appName, platform, options) => {
  console.log(chalk.blue(`Running "release" command:`));

  const { deployment, isMandatory } = options;
  let targetBinaryVersion = options.targetBinaryVersion;

  // console.log("appName : ", appName);
  // console.log("platform : ", platform);
  // console.log("deployment: ", deployment);
  // console.log("isMandatory: ", isMandatory);
  // console.log("targetBinaryVersion: ", targetBinaryVersion);

  const allChecked = await checkArgsAndOptions(appName, platform, options);
  if (!allChecked) return;

  const bundleOutputDir = path.resolve(os.tmpdir(), `codepush_bundle_${platform}`);
  const bundleOutput = path.join(bundleOutputDir, "index.bundle");
  const assetsDest = path.join(bundleOutputDir, "assets");
  const zipFilePath = path.resolve(os.tmpdir(), `codepush_bundle_${platform}.zip`);

  if (!targetBinaryVersion) {
    if (platform === "android") {
      targetBinaryVersion = getAndroidVersionName();
    } else if (platform === "ios") {
      targetBinaryVersion = getiOSVersionName();
    }

    if (!targetBinaryVersion) {
      console.log(chalk.red("❌ Failed to detect target binary version."));
      return;
    }

    console.log(chalk.yellow(`📌 Detected version: ${targetBinaryVersion}`));
  }

  try {
    console.log(chalk.blue("📦 1. Bundling the React Native app..."));

    // 번들 디렉토리 정리
    fs.rmSync(bundleOutputDir, { recursive: true, force: true });
    fs.mkdirSync(bundleOutputDir, { recursive: true });

    // 1. React Native 번들 생성
    execSync(`npx react-native bundle --platform ${platform} --dev false --entry-file index.js --bundle-output ${bundleOutput} --assets-dest ${assetsDest}`, {
      stdio: "inherit",
    });

    console.log(chalk.green("✅ Bundle created successfully"));

    // 2. .zip 파일로 압축
    console.log(chalk.blue(`\n📦 2. Zipping the bundle...`));

    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        console.log(chalk.green(`✅ Zip created: ${zipFilePath}`));
        resolve();
      });

      archive.on("error", err => reject(err));

      archive.pipe(output);
      archive.file(bundleOutput, { name: "index.bundle" });
      archive.directory(assetsDest, "assets");
      archive.finalize();
    });

    // 3. 서버로 업로드
    console.log(chalk.blue(`\n⬆️  3. Uploading to CodePush server...`));

    const form = new FormData();
    form.append("appName", appName);
    form.append("deployment", deployment);
    //form.append("isMandatory", String(isMandatory));
    form.append("targetBinaryVersion", targetBinaryVersion);
    form.append("bundle", fs.createReadStream(zipFilePath));

    // 3. 서버 요청
    const res = await API.uploadBundle(form);
    console.log("### res : ", res);

    if (res?.success) {
      console.log(chalk.green(`✅ Release successful: ${res.data.message}`));
    }
  } catch (err) {
    console.log(chalk.red(`❌ Error during release: ${err.message}`));
  } finally {
    // 4. 생성된 임시 파일 삭제
    console.log(chalk.yellow("🧹 Cleaning up temporary files..."));
    fs.rmSync(bundleOutputDir, { recursive: true, force: true });
    if (fs.existsSync(zipFilePath)) fs.rmSync(zipFilePath);
    console.log(chalk.green("✅ Cleaned up."));
  }
};

const getAndroidVersionName = () => {
  try {
    const gradlePath = path.resolve("android", "app", "build.gradle");
    const gradleContent = fs.readFileSync(gradlePath, "utf-8");

    const match = gradleContent.match(/versionName\s+["'](.+?)["']/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

const getiOSVersionName = () => {
  const plistPath = findInfoPlistPath();
  if (!plistPath) return null;

  const content = fs.readFileSync(plistPath, "utf-8");
  const match = content.match(/<key>CFBundleShortVersionString<\/key>\s*<string>(.+?)<\/string>/);
  return match ? match[1] : null;
};

const findInfoPlistPath = () => {
  try {
    const iosDir = path.resolve("ios");
    const files = fs.readdirSync(iosDir);
    const appDir = files.find(file => fs.statSync(path.join(iosDir, file)).isDirectory());
    if (!appDir) return null;

    const plistPath = path.join(iosDir, appDir, "Info.plist");
    return fs.existsSync(plistPath) ? plistPath : null;
  } catch (error) {
    //console.error(error);
    return null;
  }
};

const checkArgsAndOptions = async (appName, platform, options) => {
  const { deployment, isMandatory, targetBinaryVersion } = options;

  /* procedure
  check appname at server
  if appname does not exist, print error log and return
  else, check platform
  if platform string is correct(between "aos" and "ios"), check deployment
  if deployment does not exist, print error log and return
  else, check targetBinaryVersion
  if targetBinaryVersion does not exist, extract version string from native code(both android and ios)
  if cannot get targetBinaryVersion print error log and return
  else, proceed release
  */

  const res = await API.checkBundleOptions({ appName, platform, deployment, targetBinaryVersion });

  if (res.success) return true;
  return false;
};

const handleReleaseCommand = async (appName, platform, options) => {
  if (!appName || !platform) {
    printCommandGuide();
  } else {
    buildAndReleaseBundle(appName, platform, options);
  }
};

module.exports = handleReleaseCommand;

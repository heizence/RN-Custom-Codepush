#!/usr/bin/env node
const { Command } = require("commander");
const program = new Command();
const chalk = require("chalk");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");
const FormData = require("form-data");
const { uuidv4 } = require("uuid");
const archiver = require("archiver");

const commandHandlers = require("./src/commands/command.index");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

program
  .version("1.0.0")
  .description("greenlight-codepush CLI - Command Line Interface for CodePush Management and Authorization")
  .action(() => {
    commandHandlers.start();
  });

program
  .command("login")
  .description("Log in to your CodePush account")
  .option("--provider <provider>", "Authentication provider (github or google)")
  .action(async () => {
    commandHandlers.login();
  });

program
  .command("logout")
  .description("Logout of the current session.")
  .action(async () => {
    commandHandlers.logout();
  });

program
  .command("register")
  .description("Register a new CodePush account")
  .action(async () => {
    commandHandlers.register();
  });

program
  .command("app")
  .arguments("[arg1] [arg2] [arg3]")
  .description("View and manage your CodePush apps")
  .action(async (arg1 = "", arg2 = "", arg3 = "") => {
    commandHandlers.app(arg1, arg2, arg3);
  });

program
  .command("deployment")
  .arguments("[arg1] [arg2] [arg3] [arg4]")
  .description("View and manage your CodePush deployments by app")
  .action(async (arg1 = "", arg2 = "", arg3 = "", arg4 = "") => {
    commandHandlers.deployment(arg1, arg2, arg3, arg4);
  });

program
  .command("release")
  .description("Release a new update to CodePush server")
  .option("-m, --isMandatory", "isMandatory")
  .option("-a, --app <appName>", "App name")
  .option("-p, --platform <platform>", "Platform: android | ios")
  .option("-d, --deployment <deploymentName>", "Deployment name") // Production || Staging
  .action(async options => {
    try {
      console.log("options: ", options);
      const { isMandatory, app, platform, deployment } = options;
      if (!app || !platform || !deployment) {
        console.log(`Usage: greenlight-codepush release -m <isMandatory> -a <appName> -p <platform> -d <deploymentName> \n`);
        return;
      }

      const bundleOutputDir = path.resolve(os.tmpdir(), `codepush_bundle_${platform}`);
      const bundleOutput = path.join(bundleOutputDir, "index.bundle");
      const assetsDest = path.join(bundleOutputDir, "assets");
      const zipFilePath = path.resolve(os.tmpdir(), `codepush_bundle_${platform}.zip`);

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
      console.log(chalk.blue("📦 2. Zipping the bundle..."));

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
      console.log(chalk.blue("⬆️  3. Uploading to CodePush server..."));

      const form = new FormData();
      form.append("app", app);
      form.append("deployment", deployment);
      form.append("targetBinaryVersion", targetBinaryVersion);
      form.append("releaseId", uuidv4());
      form.append("bundle", fs.createReadStream(zipFilePath));

      // 3. 서버 요청
      const res = await axios.post(`${process.env.SERVER_URL}/release`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      });

      console.log(chalk.green(`✅ Release successful: ${res.data.message}`));
    } catch (err) {
      console.log(chalk.red(`❌ Error during release: ${err.message}`));
    } finally {
      // 4. 생성된 임시 파일 삭제
      // console.log(chalk.yellow("🧹 Cleaning up temporary files..."));
      // fs.rmSync(bundleOutputDir, { recursive: true, force: true });
      // if (fs.existsSync(zipFilePath)) fs.rmSync(zipFilePath);
      // console.log(chalk.green("✅ Cleaned up."));
    }
  });

program
  .command("rollback")
  .description("Rollback the latest release for an app deployment")
  .action(async () => {
    console.log(`Uploading bundle from ${bundlePath}...`);
    // Add logic to handle the bundle upload here
  });

// for test

program
  .command("upload <bundlePath>")
  .description("Upload a new bundle to the server")
  .action(async () => {
    console.log(`Uploading bundle from ${bundlePath}...`);
    // Add logic to handle the bundle upload here
  });

program
  .command("status")
  .description("Check the status of the current deployment")
  .action(() => {
    console.log("Checking deployment status...");
    // Add logic to check the status of the app here
  });

program.parse(process.argv);

if (process.argv.length < 3) {
  program.help();
}

#!/usr/bin/env node
const { Command } = require("commander");
const program = new Command();
const chalk = require("chalk");
const dotenv = require("dotenv");
const path = require("path");
const open = require("open");
const { input } = require("@inquirer/prompts");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");
const FormData = require("form-data");
const { uuidv4 } = require("uuid");
const archiver = require("archiver");

const packageJson = require("./package.json");
const API = require("./src/libs/APIs");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = process.env.PORT || 3000;
const url = process.env.SERVER_URL || "http://localhost";

const homeDirectory = os.homedir();
const tokenDirectory = path.join(homeDirectory, ".greenlight-codepush.config"); // /Users/{username}/.code-push.config
const tokenFilePath = path.join(tokenDirectory, "token.json");

program
  .version("1.0.0")
  .description("greenlight-codepush CLI - Command Line Interface for CodePush Management and Authorization")
  .action(() => {
    const asciiArt = [
      "   ______                     __        __    __     ______          __     ____             __  ",
      "  / ____/_______  ___  ____  / (_)___ _/ /_  / /_   / ____/___  ____/ /__  / __ \\__  _______/ /_ ",
      " / / __/ ___/ _ \\/ _ \\/ __ \\/ / / __ `/ __ \\/ __/  / /   / __ \\/ __  / _ \\/ /_/ / / / / ___/ __ \\",
      "/ /_/ / /  /  __/  __/ / / / / / /_/ / / / / /_   / /___/ /_/ / /_/ /  __/ ____/ /_/ (__  ) / / /",
      "\\____/_/   \\___/\\___/_/ /_/_/_/\\__, /_/ /_/\\__/   \\____/\\____/\\__,_/\\___/_/    \\__,_/____/_/ /_/" + "            CLI v" + packageJson.version,
      "                              /____/                                                              ",
      "===================================================================================================",
    ];
    asciiArt.forEach(line => {
      console.log(chalk.green(line)); // Apply green color to each line
    });
    console.log("");
    console.log("Greenlight CodePush is a service that enables you to deploy mobile app updates directly to your users' devices.\n");
  });

program
  .command("login")
  .description("Log in to your CodePush account")
  .option("--provider <provider>", "Authentication provider (github or google)")
  .action(async () => {
    console.log(`Logging in...`);
    try {
      if (fs.existsSync(tokenFilePath)) {
        const data = fs.readFileSync(tokenFilePath, "utf8");
        const { token } = JSON.parse(data);

        const res = await API.verifyToken(token);
        if (res.success) {
          console.log("You are already logged in from this machine.");
          return;
        }
      }

      open(`${url}:${port}/auth/login`);
      const tokenInput = await input({
        message: "Please enter your access token: ",
        validate: input => {
          if (!input) {
            return "Token cannot be empty";
          }
          return true;
        },
      });

      const res = await API.verifyToken(tokenInput);
      if (res.success) {
        if (!fs.existsSync(tokenDirectory)) {
          fs.mkdirSync(tokenDirectory, { recursive: true });
        }
        fs.writeFileSync(tokenFilePath, JSON.stringify({ token: tokenInput }), "utf8");

        console.log(
          `Successfully logged-in. Your session file was written to ${tokenFilePath}. You can run the code-push logout command at any time to delete this file and terminate your session.`
        );
      } else {
        console.log("Invalid token. Please try again.");
        return true;
      }
    } catch (error) {
      console.error("Error verifying token:", error.message);
    }
  });

program
  .command("logout")
  .description("Logout of the current session.")
  .action(async () => {
    if (fs.existsSync(tokenFilePath)) {
      fs.unlinkSync(tokenFilePath);
      console.log(`Successfully logged out.`);
    } else {
      console.log("Already logged out.");
    }
  });

program
  .command("register")
  .description("Register a new CodePush account")
  .action(async () => {
    if (fs.existsSync(tokenFilePath)) {
      console.log(`The access token already exists. Please log in.`);
    } else {
      console.log(`Opening your browser...`);

      open(`${url}:${port}/auth/register`);
      const tokenInput = await input({
        message: "Please enter your access token: ",
        validate: input => {
          if (!input) {
            return "Token cannot be empty";
          }
          return true;
        },
      });

      const res = await API.verifyToken(tokenInput);
      if (res.success) {
        if (!fs.existsSync(tokenDirectory)) {
          fs.mkdirSync(tokenDirectory, { recursive: true });
        }
        fs.writeFileSync(tokenFilePath, JSON.stringify({ token: tokenInput }), "utf8");

        console.log(
          `Successfully registered and logged-in. Your session file was written to ${tokenFilePath}. You can run the code-push logout command at any time to delete this file and terminate your session.`
        );
      } else {
        console.log("Invalid token. Please try again.");
        return true;
      }
    }
  });

program
  .command("app")
  .arguments("[arg1] [arg2] [arg3]")
  .description("View and manage your CodePush apps")
  .action(async (arg1 = "", arg2 = "", arg3 = "") => {
    // console.log("arg1 : ", arg1);
    // console.log("arg2 : ", arg2);
    // console.log("arg3 : ", arg3);
    switch (arg1) {
      case "":
        console.log(`Usage: greenlight-codepush app <command>\n`);
        console.log("commands : ");
        console.log(`  greenlight-codepush app add       Add a new app to your account`);
        console.log(`  greenlight-codepush app remove    Remove an app from your account`);
        console.log(`  greenlight-codepush app rename    Rename an existing app`);
        console.log(`  greenlight-codepush app list      Lists the apps associated with your account`);
        break;
      case "add":
        switch (arg2) {
          case "":
            console.log(`Usage: greenlight-codepush app add <appName>\n`);
            break;
          default:
            API.addApp({ appName: arg2 });
            break;
        }
        break;
      case "list":
        API.getApplist();

        break;
      case "remove":
        switch (arg2) {
          case "":
            console.log(`Usage: greenlight-codepush app remove <appName>\n`);
            break;
          default:
            API.removeApp({ appName: arg2 });
            break;
        }
        break;
      case "rename":
        switch (arg2) {
          case "":
            console.log(`Usage: greenlight-codepush app rename <currentAppName> <newAppName>\n`);
            break;
          default:
            switch (arg3) {
              case "":
                console.log(`Usage: greenlight-codepush app rename <currentAppName> <newAppName>\n`);
                break;
              default:
                const res = await API.renameApp({ currentAppName: arg2, newAppName: arg3 });
                // console.log(res.message);
                break;
            }
            break;
        }
        break;
      default:
        break;
    }
  });

program
  .command("deployment")
  .arguments("[arg1] [arg2] [arg3]")
  .description("Shows CodePush deployments history by app")
  .action(async (arg1 = "", arg2 = "", arg3 = "") => {
    console.log("arg1 : ", arg1);
    console.log("arg2 : ", arg2);
    console.log("arg3 : ", arg3);

    switch (arg1) {
      case "":
        console.log(`Usage: greenlight-codepush deployment history <appName> <deploymentName>\n`);
        break;
      default:
        switch (arg2) {
          case "":
            console.log(`Usage: greenlight-codepush deployment history <appName> <deploymentName>\n`);
            break;
          default:
            switch (arg3) {
              case "":
                console.log(`Usage: greenlight-codepush deployment history <appName> <deploymentName>\n`);
                break;
              default:
                const res = await API.getDeploymentHistory({ appName: arg2, deploymentName: arg3 });

                break;
            }
            break;
        }
        break;
    }
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

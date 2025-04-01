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
const axios = require("axios");
const packageJson = require("./package.json");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = process.env.PORT || 3000;
const url = process.env.SERVER_URL || "http://localhost";

const homeDirectory = os.homedir();
const tokenDirectory = path.join(homeDirectory, ".code-push.config"); // /Users/{username}/.code-push.config
const tokenFilePath = path.join(tokenDirectory, "token.json");

const verifyTokenAPI = async tokenInput => {
  const response = await axios.post(
    `${url}:${port}/auth/verifyToken`,
    {
      token: tokenInput,
    },
    {
      headers: {
        "Content-Type": "application/json", // Explicitly set the content type as JSON
      },
    }
  );

  if (response.data.success) {
    return true;
  } else {
    return false;
  }
};

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

        if (verifyTokenAPI(token)) {
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

      if (verifyTokenAPI(tokenInput)) {
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
  .command("upload <bundlePath>")
  .description("Upload a new bundle to the server")
  .action(async () => {
    console.log(`Uploading bundle from ${bundlePath}...`);
    // Add logic to handle the bundle upload here
  });

program
  .command("release <version>")
  .description("Release a new update for your app")
  .option("--deployment <deployment>", "Deployment environment (staging or production)")
  .action((version, cmd) => {
    console.log(`Releasing version ${version} to ${cmd.deployment || "staging"}...`);
    // Add logic to release the version here
  });

// Define status command
program
  .command("status")
  .description("Check the status of the current deployment")
  .action(() => {
    console.log("Checking deployment status...");
    // Add logic to check the status of the app here
  });

// Define rollback command
program
  .command("rollback <version>")
  .description("Rollback to a previous version")
  .option("--deployment <deployment>", "Deployment environment (staging or production)")
  .action((version, cmd) => {
    console.log(`Rolling back to version ${version} in ${cmd.deployment || "staging"}...`);
    // Add logic to rollback the version here
  });

// Display help if no command is provided
program.parse(process.argv);

if (process.argv.length < 3) {
  program.help();
}

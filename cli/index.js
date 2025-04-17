#!/usr/bin/env node
const { Command } = require("commander");
const program = new Command();
const dotenv = require("dotenv");
const path = require("path");

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
  .arguments("[appName] [platform]")
  .description("Release a new update to CodePush server")
  .option("-d, --deployment <deploymentName>", "Deployment name")
  .option("-m, --isMandatory", "isMandatory")
  .option("-t, --targetBinaryVersion <targetBinaryVersion>", "Version: x.x.x")
  .action(async (appName, platform, options) => {
    commandHandlers.release(appName, platform, options);
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

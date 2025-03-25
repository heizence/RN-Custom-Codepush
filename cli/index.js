#!/usr/bin/env node

const { Command } = require("commander");
const program = new Command();
const dotenv = require("dotenv");
const path = require("path");
const open = require("open");
const { input } = require("@inquirer/prompts");
const axios = require("axios"); // To make HTTP requests

//dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = process.env.PORT || 3000;
const url = process.env.SERVER_URL || "http://localhost";

console.log(`${url}:${port}/auth/verifyToken`);

program.version("1.0.0").description("greenlight-codepush CLI - Command Line Interface for CodePush Management and Authorization");

// Define login command
program
  .command("login")
  .description("Log in to your CodePush account")
  .option("--provider <provider>", "Authentication provider (github or google)")
  .action(async () => {
    console.log(`Logging in...`);
    // Add logic to authenticate the user here
    open(`${url}:${port}/auth/login`);

    try {
      // After the user has logged in via OAuth, prompt for the token
      const tokenInput = await input({
        message: "Please enter your access token: ",
        validate: input => {
          if (!input) {
            return "Token cannot be empty";
          }
          return true;
        },
      });

      console.log("check tokenInput : ", tokenInput);
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
        console.log("Login successful! Token is valid.");
        // Save the token locally or use it for further requests
      } else {
        console.log("Invalid token. Please try again.");
        return true;
      }
    } catch (error) {
      console.error("Error verifying token:", error.message);
    }
  });

// Define upload command
program
  .command("upload <bundlePath>")
  .description("Upload a new bundle to the server")
  .action(bundlePath => {
    console.log(`Uploading bundle from ${bundlePath}...`);
    // Add logic to handle the bundle upload here
  });

// Define release command
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

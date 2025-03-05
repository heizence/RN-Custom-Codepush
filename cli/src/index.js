// Main page in which CLI is executed

const { Command } = require("commander");
const release = require("./commands/release");

const program = new Command();

program.name("codepush-cli").description("CLI for managing CodePush updates on custom server").version("1.0.0");

// Define the 'release' command
program
  .command("release")
  .description("Release a new update to CodePush server")
  .requiredOption("-a, --app <appName>", "Name of the app")
  .requiredOption("-p, --platform <platform>", "Platform (ios or android)")
  .requiredOption("-d, --deployment <deploymentName>", "Deployment name (e.g., Production)")
  .requiredOption("-b, --bundle <bundleFile>", "Path to the bundle zip file")
  .option("--server-url <url>", "Custom server URL", "http://localhost:3000") // default to localhost
  .action(release.handleRelease);

program.parse(process.argv);

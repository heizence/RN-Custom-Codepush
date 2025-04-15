const path = require("path");
const open = require("open");
const { input } = require("@inquirer/prompts");
const fs = require("fs");
const os = require("os");
const dotenv = require("dotenv");
const API = require("../libs/APIs");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const port = process.env.PORT || 3000;
const url = process.env.SERVER_URL || "http://localhost";

const homeDirectory = os.homedir();
const tokenDirectory = path.join(homeDirectory, ".greenlight-codepush.config"); // /Users/{username}/.code-push.config
const tokenFilePath = path.join(tokenDirectory, "token.json");

const checkLoginStatus = async () => {
  if (fs.existsSync(tokenFilePath)) {
    const data = fs.readFileSync(tokenFilePath, "utf8");
    const { token } = JSON.parse(data);
    const res = await API.verifyToken(token);

    if (res.success) {
      console.log(`The access token already exists. Please log in.`);
      return true;
    }
  }
  return false;
};

const handleRegister = async () => {
  const isLoggedIn = await checkLoginStatus();
  if (isLoggedIn) return;
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
};

module.exports = handleRegister;

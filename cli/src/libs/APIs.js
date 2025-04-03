const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");
const chalk = require("chalk");
const fs = require("fs");
const os = require("os");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const commonAPI = async (method = "post", reqPath, reqParamsOrBody, needAuth = true) => {
  let accessToken;
  if (needAuth) {
    const homeDirectory = os.homedir();
    const tokenDirectory = path.join(homeDirectory, ".greenlight-codepush.config"); // /Users/{username}/.code-push.config
    const tokenFilePath = path.join(tokenDirectory, "token.json");

    if (fs.existsSync(tokenFilePath)) {
      const data = fs.readFileSync(tokenFilePath, "utf8");
      const { token } = JSON.parse(data);
      accessToken = token;
    } else {
      console.log("You need to login in from this machine.");
      return;
    }
  }
  const baseUrl = process.env.SERVER_URL || "http://localhost";
  const port = process.env.PORT || 3000;

  //console.log("baseURL : ", `${baseUrl}:${port}/`);
  return axios({
    baseURL: `${baseUrl}:${port}/`,
    url: reqPath,
    method,
    headers: {
      Authorization: accessToken, // Send token in the request
      Accept: "application/json",
    },
    data: method === "post" ? reqParamsOrBody : undefined,
    params: method === "get" ? reqParamsOrBody : undefined,
    timeout: 40000,
  })
    .then(response => {
      //console.log(`[commonAPI] [${reqPath}]success : `, response.data);
      console.log(response.data.message);

      const dataToDisplay = response.data.data;
      if (dataToDisplay) {
        if (dataToDisplay.table) console.table(dataToDisplay.table);
      }
      return response.data;
    })
    .catch(error => {
      //console.log(`[commonAPI] [${path}]error : `, error.response?.data);
      console.log(chalk.red("[Error] " + error.response?.data.message));
      return error.response?.data;
    });
};

const verifyToken = token => commonAPI("post", "auth/verifyToken", { token }, false);
const addApp = body => commonAPI("post", "app/add", body);
const getApplist = () => commonAPI("get", "app/list", {});
const removeApp = body => commonAPI("post", "app/remove", body);
const renameApp = body => commonAPI("post", "app/rename", body);

module.exports = {
  verifyToken,
  addApp,
  getApplist,
  removeApp,
  renameApp,
};

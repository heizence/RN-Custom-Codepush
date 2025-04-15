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
      //console.log(`[commonAPI] [${path}]error : `, error);
      if (!error.response) {
        console.log(chalk.red("[Error] Cannot connect to server!"));
      } else {
        console.log(chalk.red("[Error] " + error.response?.data.message));
      }

      return error.response?.data;
    });
};

const commonMultipartAPI = async (reqPath, formData, needAuth = true) => {
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
    method: "post",
    headers: {
      Authorization: accessToken, // Send token in the request
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    },
    data: formData,
    timeout: 40000,
  })
    .then(response => {
      //console.log(`[commonMultipartAPI] [${reqPath}]success : `, response.data);
      //console.log(response.data.message);

      const dataToDisplay = response.data.data;
      if (dataToDisplay) {
        if (dataToDisplay.table) console.table(dataToDisplay.table);
        else if (dataToDisplay.multipleTable) {
          dataToDisplay.multipleTable.forEach(element => {
            console.log(`\n${element.title}`);
            console.table(element.table);
          });
        }
      }
      return response.data;
    })
    .catch(error => {
      //console.log(`[commonMultipartAPI] [${path}]error : `, error.response?.data);
      console.log(chalk.red("[Error] " + error.response?.data.message));
      return error.response?.data;
    });
};

const verifyToken = token => commonAPI("post", "auth/verifyToken", { token }, false);
const addApp = body => commonAPI("post", "app/add", body);
const getApplist = () => commonAPI("get", "app/list", {});
const addDeployment = body => commonAPI("post", "deployment/add", body);
const clearDeployment = body => commonAPI("post", "deployment/clear", body);
const removeDeployment = body => commonAPI("post", "deployment/remove", body);
const renameDeployment = body => commonAPI("post", "deployment/rename", body);
const getDeploymentList = params => commonAPI("get", "deployment/list", params);
const getDeploymentHistory = params => commonAPI("get", "deployment/history", params);
const removeApp = body => commonAPI("post", "app/remove", body);
const renameApp = body => commonAPI("post", "app/rename", body);

const uploadBundleFile = body => commonMultipartAPI("post", "codepush/upload", body);

module.exports = {
  verifyToken,
  addApp,
  getApplist,
  addDeployment,
  clearDeployment,
  removeDeployment,
  renameDeployment,
  getDeploymentList,
  getDeploymentHistory,
  removeApp,
  renameApp,
};

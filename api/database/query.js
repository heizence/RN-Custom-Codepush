const generateDeploymentKey = require("../services/generateDeploymentKey");
const db = require("./db");

// Function to execute an SQL query safely
async function runQuery(query, params = []) {
  try {
    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      return null;
    }
    return rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
    //return null;
  }
}

// 🔹 Secure User Login
async function loginUser(accountId) {
  console.log(`\n[query]loginUser`);
  const query = `SELECT id, account_id, email, user_name, type, created_at FROM greenlight_codepush_dev_db.users WHERE account_id = ?;`;
  return await runQuery(query, [accountId]);
}

async function findUser(accountId) {
  console.log(`\n[query]findUser`);
  const query = `SELECT id, account_id, email, user_name, type, created_at FROM greenlight_codepush_dev_db.users WHERE account_id = ?;`;
  return await runQuery(query, [accountId]);
}

// 사용자 등록
async function registerUser(accountId, email = "", userName = "", type) {
  const checkUser = await findUser(accountId);
  console.log("checkUser : ", checkUser);
  if (checkUser) {
    // already signed up user!
    console.log("already signed up user!");
    return null;
  } else {
    console.log("new user!");
    const query = `INSERT INTO greenlight_codepush_dev_db.users (id, account_id, email, user_name, type, created_at) VALUES(UUID(), ?, ?, ?, ?, current_timestamp());`;
    return await runQuery(query, [accountId, email, userName, type]);
  }
}

async function findApp(appName) {
  console.log(`\n[query]findApp`);
  const query = `SELECT id, app_name, production_key, staging_key, owner_id, created_at FROM greenlight_codepush_dev_db.apps WHERE app_name = ?;`;
  return await runQuery(query, [appName]);
}

async function getAppListByUser(userId) {
  console.log(`\n[query]getAppListByUser`);
  const query = `SELECT id, app_name, production_key, staging_key, owner_id, created_at FROM greenlight_codepush_dev_db.apps WHERE owner_id = ?;`;
  return await runQuery(query, [userId]);
}

async function addApp(appName, accountId) {
  console.log(`\n[query]addApp`);
  const checkApp = await findApp(appName);
  if (checkApp) {
    console.log("already added app!");
    return null;
  } else {
    console.log("new app!");
    const checkUser = await findUser(accountId);
    if (!checkUser) {
      return null;
    }

    const userId = checkUser[0].id;
    const productionKey = generateDeploymentKey();
    const stagingKey = generateDeploymentKey();

    const query = `INSERT INTO greenlight_codepush_dev_db.apps (id, app_name, production_key, staging_key, owner_id, created_at) VALUES(UUID(), ?, ?, ?, ?, current_timestamp());`;
    return await runQuery(query, [appName, productionKey, stagingKey, userId]);
  }
}

async function removeApp(appName, accountId) {
  console.log(`\n[query]removeApp`);
  const checkUser = await findUser(accountId);
  if (!checkUser) {
    return null;
  }
  const userId = checkUser[0].id;
  console.log("appName : ", appName);
  console.log("userId : ", userId);

  const query = `DELETE FROM greenlight_codepush_dev_db.apps WHERE app_name = ? AND owner_id = ?`;
  return await runQuery(query, [appName, userId]);
}

async function renameApp(currentAppName, newAppName, accountId) {
  console.log(`\n[query]renameApp`);
  const checkUser = await findUser(accountId);
  if (!checkUser) {
    return null;
  }
  const userId = checkUser[0].id;

  const findQuery = `SELECT id, app_name, production_key, staging_key, owner_id, created_at FROM greenlight_codepush_dev_db.apps WHERE app_name = ? AND owner_id = ?`;
  const result = await runQuery(findQuery, [currentAppName, userId]);

  if (result) {
    const appId = result[0].id;
    const query = `UPDATE greenlight_codepush_dev_db.apps SET app_name = ? WHERE id = ?`;
    return await runQuery(query, [newAppName, appId]);
  } else {
    console.log("no app found!");
    return null;
  }
}

module.exports = {
  loginUser,
  findUser,
  registerUser,
  getAppListByUser,
  addApp,
  removeApp,
  renameApp,
};

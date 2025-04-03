const { responseDto } = require("../DTO/response");
const { isValidName, generateRandomkey } = require("../services/utils");
const db = require("./db");

// Function to execute an SQL query safely
async function runQuery(query, params = []) {
  try {
    const [rows] = await db.query(query, params);
    if (rows) {
      return rows;
    }
    return null;
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}

// 🔹 Secure User Login
async function loginUser(accountId) {
  console.log(`\n[query]loginUser`);
  const query = `SELECT id, account_id, email, user_name, type, created_at FROM greenlight_codepush_dev_db.users WHERE account_id = ?;`;
  return await runQuery(query, [accountId]);
}

async function findUser(accountId) {
  console.log(`\n[query]findUser. accountId : `, accountId);
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
    const id = generateRandomkey(50);
    const query = `INSERT INTO greenlight_codepush_dev_db.users (id, account_id, email, user_name, type, created_at) VALUES(?, ?, ?, ?, ?, current_timestamp());`;
    return await runQuery(query, [id, accountId, email, userName, type]);
  }
}

async function findApp(appName) {
  console.log(`\n[query]findApp`);
  const query = `SELECT id, app_name, production_key, staging_key, owner_id, created_at FROM greenlight_codepush_dev_db.apps WHERE app_name = ?;`;
  return await runQuery(query, [appName]);
}

async function getAppListByUser(accountId) {
  console.log(`\n[query]getAppListByUser`);
  const checkUser = await findUser(accountId);
  if (!checkUser) {
    return null;
  }

  const userId = checkUser[0].id;
  console.log("userId : ", userId);
  const query = `SELECT app_name, production_key, staging_key, created_at FROM greenlight_codepush_dev_db.apps WHERE owner_id = ?;`;
  const res = await runQuery(query, [userId]);
  console.log("res : ", res);
  if (res.length > 0) {
    return responseDto(true, 200, ``, { table: res });
  } else if (res.length === 0) {
    return responseDto(true, 200, `No app added yet!`);
  }
  return null;
}

async function addApp(appName, accountId) {
  console.log(`\n[query]addApp`);

  if (!isValidName(appName)) {
    return responseDto(false, 400, "Invalid name! Name must not contain /, , *, ?, <, >, |, and : ");
  } else if (appName.length > 20) {
    return responseDto(false, 400, "App name is too long!");
  }

  const checkApp = await findApp(appName);
  if (checkApp) {
    return responseDto(false, 400, `An app named "${appName}" already exists.`);
  } else {
    const checkUser = await findUser(accountId);
    if (!checkUser) {
      return null;
    }

    const userId = checkUser[0].id;
    const productionKey = generateRandomkey(30);
    const stagingKey = generateRandomkey(30);
    const appId = generateRandomkey(50);

    const query = `INSERT INTO greenlight_codepush_dev_db.apps (id, app_name, production_key, staging_key, owner_id, created_at) VALUES(?, ?, ?, ?, ?, current_timestamp());`;
    const res = await runQuery(query, [appId, appName, productionKey, stagingKey, userId]);

    if (res) {
      const apps = [
        { Name: "Production", "Deployment Key": productionKey },
        { Name: "Staging", "Deployment Key": stagingKey },
      ];

      return responseDto(true, 200, `Successfully added the "${appName}" app, along with the following default deployments:`, { table: apps });
    }
    return null;
  }
}

async function removeApp(appName, accountId) {
  console.log(`\n[query]removeApp`);
  const checkUser = await findUser(accountId);
  if (!checkUser) {
    return null;
  }
  const userId = checkUser[0].id;
  const query = `DELETE FROM greenlight_codepush_dev_db.apps WHERE app_name = ? AND owner_id = ?`;

  const res = await runQuery(query, [appName, userId]);
  if (res.affectedRows > 0) {
    return responseDto(true, 200, `Successfully removed the "${appName}" app.`);
  } else if (res.affectedRows === 0) {
    return responseDto(false, 400, `App "${appName}" does not exist.`);
  }
  return null;
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
    const res = await runQuery(query, [newAppName, appId]);
    console.log("res : ", res);
    if (res) {
      return responseDto(true, 200, `Successfully renamed the "${currentAppName}" app to "${newAppName}".`);
    }
    return null;
  } else {
    return responseDto(false, 400, `App "${currentAppName}" does not exist.`);
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

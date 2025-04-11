const { responseDto } = require("../DTO/response");
const { isValidName, generateRandomkey } = require("../services/utils");
const { db, getConnection } = require("./db");

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

// Query for finding a specific user by account_id
async function findUser(accountId) {
  console.log(`\n[query]findUser. accountId : `, accountId);
  const query = `SELECT id, account_id, email, user_name, type, created_at FROM greenlight_codepush_dev_db.users WHERE account_id = ?;`;
  return await runQuery(query, [accountId]);
}

// Query for registering a new user
async function registerUser(accountId, email = "", userName = "", type) {
  const checkUser = await findUser(accountId);
  if (checkUser) {
    return null;
  } else {
    const id = generateRandomkey(50);
    const query = `INSERT INTO greenlight_codepush_dev_db.users (id, account_id, email, user_name, type, created_at) VALUES(?, ?, ?, ?, ?, current_timestamp());`;
    return await runQuery(query, [id, accountId, email, userName, type]);
  }
}

async function findApp(userId, appName) {
  console.log(`\n[query]findApp`);

  let query;
  if (appName) {
    // for checking a specific app
    query = `SELECT id, app_name, owner_id, created_at FROM greenlight_codepush_dev_db.apps WHERE owner_id = ? AND app_name = ?;`;
  } else {
    // for request getAppListByUser
    query = `SELECT app_name, created_at FROM greenlight_codepush_dev_db.apps WHERE owner_id = ?;`;
  }
  return await runQuery(query, [userId, appName]);
}

// Query for listup all apps by user
async function getAppListByUser(accountId) {
  console.log(`\n[query]getAppListByUser`);
  const checkUser = await findUser(accountId);
  if (!checkUser) {
    return null;
  }

  const userId = checkUser[0].id;
  const res = await findApp(userId);

  if (res.length > 0) {
    return responseDto(true, 200, ``, { table: res });
  } else if (res.length === 0) {
    return responseDto(true, 200, `No app added yet!`);
  }
  return null;
}

// Query for add a new app for a specific user
async function addApp(appName, accountId) {
  console.log(`\n[query]addApp`);

  if (!isValidName(appName)) {
    return responseDto(false, 400, "Invalid name! Name must not contain /, , *, ?, <, >, |, and : ");
  } else if (appName.length > 20) {
    return responseDto(false, 400, "App name is too long!");
  }

  const checkUser = await findUser(accountId);
  if (!checkUser) {
    return null;
  }

  const userId = checkUser[0].id;

  const checkApp = await findApp(userId, appName);
  if (checkApp && checkApp.length) {
    return responseDto(false, 400, `An app named "${appName}" already exists.`);
  } else {
    const appId = generateRandomkey(50);
    const connection = await getConnection(); // for transaction

    try {
      await connection.beginTransaction();

      // add new app
      const addAppQuery = `INSERT INTO greenlight_codepush_dev_db.apps (id, app_name, owner_id, created_at) VALUES(?, ?, ?, current_timestamp());`;

      await connection.execute(addAppQuery, [appId, appName, userId]);

      // add PRODUCTION and STAGING deployments
      const productionId = generateRandomkey(50);
      const productionKey = generateRandomkey(30);
      const stagingId = generateRandomkey(50);
      const stagingKey = generateRandomkey(30);

      const addDeploymentQuery = `INSERT INTO greenlight_codepush_dev_db.deployments (id, app_id, deployment_name, deployment_key, created_at) VALUES(?, ?, ?, ?, current_timestamp()), (?, ?, ?, ?, current_timestamp());`;

      await connection.execute(addDeploymentQuery, [productionId, appId, "PRODUCTION", productionKey, stagingId, appId, "STAGING", stagingKey]);

      await connection.commit();

      const apps = [
        { Name: "Production", "Deployment Key": productionKey },
        { Name: "Staging", "Deployment Key": stagingKey },
      ];

      return responseDto(true, 200, `Successfully added the "${appName}" app, along with the following default deployments:`, { table: apps });
    } catch (error) {
      await connection.rollback();
      console.error("Transaction failed:", error);
      return null;
    } finally {
      connection.release();
    }
  }
}

// Query for remove a specific app owned by a user
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

// Query for rename a specific app owned by a user
async function renameApp(currentAppName, newAppName, accountId) {
  console.log(`\n[query]renameApp`);
  const checkUser = await findUser(accountId);
  if (!checkUser) {
    return null;
  }
  const userId = checkUser[0].id;
  const findQuery = `SELECT id, app_name, owner_id, created_at FROM greenlight_codepush_dev_db.apps WHERE app_name = ? AND owner_id = ?`;
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

// Query for get all deployments history for a specific app
async function findDeployment(appId, deploymentName) {
  console.log(`\n[query]findDeployment`);

  // find deployment
  const findDeploymentQuery = `SELECT deployment_name, deployment_key, created_at FROM greenlight_codepush_dev_db.deployments WHERE app_id = ? AND deployment_name = ?`;

  return await runQuery(findDeploymentQuery, [appId, deploymentName]);
}

async function getDeploymentHistory(accountId, appName, deploymentName) {
  console.log(`\n[query]getDeploymentHistory`);

  const checkUser = await findUser(accountId);
  console.log("checkUser : ", checkUser);
  if (!checkUser) {
    return null;
  }

  // find app
  const userId = checkUser[0].id;
  const checkApp = await findApp(userId, appName);

  if (checkApp.length === 0) {
    return responseDto(false, 404, `App ${appName} doesn't exist!`);
  }

  // find deployments
  const appId = checkApp[0].id;
  const deployments = await findDeployment(appId, deploymentName);

  if (deployments.length === 0) {
    return responseDto(false, 404, `Deployment ${deploymentName} doesn't exist!`);
  }
  return responseDto(true, 200, ``, { table: deployments });
}

module.exports = {
  findUser,
  registerUser,
  getAppListByUser,
  addApp,
  getDeploymentHistory,
  removeApp,
  renameApp,
};

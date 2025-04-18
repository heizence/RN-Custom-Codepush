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
    throw error;
  }
}

async function checkAndGetNecessaryData(userId, appName, deploymentName) {
  if (appName) {
    const checkApp = await findApp(userId, appName);
    if (checkApp.length === 0) return null;

    const appId = checkApp[0].id;
    if (deploymentName) {
      const deployments = await findDeployment(appId, deploymentName);

      if (deployments.length === 0) return null;
      return deployments[0].id;
    }
    return appId;
  }
  return userId;
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

/******************* Apps ******************/

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
async function getAppListByUser(userId) {
  console.log(`\n[query]getAppListByUser`);

  const res = await findApp(userId);

  if (res.length > 0) {
    return responseDto(true, ``, { table: res });
  } else if (res.length === 0) {
    return responseDto(true, `No app added yet!`);
  }
  return null;
}

// Query for add a new app for a specific user
async function addApp(userId, appName) {
  console.log(`\n[query]addApp`);

  if (!isValidName(appName)) {
    return responseDto(false, "Invalid name! Name must not contain /, , *, ?, <, >, |, and : ");
  } else if (appName.length > 20) {
    return responseDto(false, "App name is too long!");
  }

  const checkApp = await findApp(userId, appName);
  if (checkApp && checkApp.length) {
    return responseDto(false, `An app named "${appName}" already exists.`);
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

      return responseDto(true, `Successfully added the "${appName}" app, along with the following default deployments:`, { table: apps });
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
async function removeApp(userId, appName) {
  console.log(`\n[query]removeApp`);

  const query = `DELETE FROM greenlight_codepush_dev_db.apps WHERE app_name = ? AND owner_id = ?`;

  const res = await runQuery(query, [appName, userId]);
  if (res.affectedRows > 0) {
    return responseDto(true, `Successfully removed the "${appName}" app.`);
  } else if (res.affectedRows === 0) {
    return responseDto(false, `App "${appName}" does not exist.`);
  }
  return null;
}

// Query for rename a specific app owned by a user
async function renameApp(userId, currentAppName, newAppName) {
  console.log(`\n[query]renameApp`);

  const appId = await checkAndGetNecessaryData(userId, currentAppName);
  if (!appId) return responseDto(false, `App "${currentAppName}" does not exist.`);

  const query = `UPDATE greenlight_codepush_dev_db.apps SET app_name = ? WHERE id = ?`;
  const res = await runQuery(query, [newAppName, appId]);

  if (res) {
    return responseDto(true, `Successfully renamed the "${currentAppName}" app to "${newAppName}".`);
  }
  return null;
}

/******************* Deployments ******************/

// Query for get a specific deployment for a specific app
async function findDeployment(appId, deploymentName) {
  console.log(`\n[query]findDeployment`);

  // find deployment
  const findDeploymentQuery = `SELECT deployment_name, deployment_key, created_at FROM greenlight_codepush_dev_db.deployments WHERE app_id = ? AND deployment_name = ?`;

  return await runQuery(findDeploymentQuery, [appId, deploymentName]);
}

// Query for get all deployments for a specific app
async function getDeploymentList(userId, appName) {
  console.log(`\n[query]getDeploymentList`);

  const appId = await checkAndGetNecessaryData(userId, appName);
  if (!appId) {
    return responseDto(false, `App "${appName}" doesn't exist!`);
  }

  const query = `SELECT deployment_name, deployment_key, created_at FROM greenlight_codepush_dev_db.deployments WHERE app_id = ?;`;

  const res = await runQuery(query, [appId]);

  if (res.length > 0) {
    return responseDto(true, ``, { table: res });
  } else if (res.length === 0) {
    return responseDto(false, `No deployments in app ${appName}.`);
  }
  return null;
}

// Query for add a new app for a specific app
async function addDeployment(userId, appName, deploymentName) {
  console.log(`\n[query]addDeployment`);

  if (!isValidName(appName)) {
    return responseDto(false, "Invalid name! Name must not contain /, , *, ?, <, >, |, and : ");
  } else if (appName.length > 20) {
    return responseDto(false, "Deployment name is too long!");
  }

  const appId = await checkAndGetNecessaryData(userId, appName);
  if (!appId) {
    return responseDto(false, `App "${appName}" doesn't exist!`);
  }

  const deployments = await findDeployment(appId, deploymentName);

  if (deployments && deployments.length) {
    return responseDto(false, `A deployment named "${deploymentName}" already exists.`);
  } else {
    // add PRODUCTION and STAGING deployments
    const deploymentId = generateRandomkey(50);
    const deploymentKey = generateRandomkey(30);

    const addDeploymentQuery = `INSERT INTO greenlight_codepush_dev_db.deployments (id, app_id, deployment_name, deployment_key, created_at) VALUES(?, ?, ?, ?, current_timestamp());`;

    const res = await runQuery(addDeploymentQuery, [deploymentId, appId, deploymentName, deploymentKey]);

    if (res) {
      const deployment = [{ Name: deploymentName, "Deployment Key": deploymentKey }];

      return responseDto(true, `Successfully added the "${deploymentName}" deployment to "${appName}:".`, { table: deployment });
    }
    return null;
  }
}

// Query for clear all update and rollback history for a specific deployment
async function clearDeployment(userId, appName, deploymentName) {
  console.log(`\n[query]clearDeployment`);

  const checkApp = await findApp(userId, appName);

  if (checkApp.length === 0) {
    return responseDto(false, `App "${appName}" doesn't exist!`);
  }

  const appId = checkApp[0].id;
  const deployments = await findDeployment(appId, deploymentName);

  if (deployments.length === 0) {
    return responseDto(false, `Deployment "${deploymentName}" doesn't exist!`);
  }

  const deploymentId = deployments[0].id;
  const query = `DELETE FROM greenlight_codepush_dev_db.updates WHERE deployment_id = ?;`;

  const res = await runQuery(query, [deploymentId]);
  if (res) {
    return responseDto(true, `Successfully cleared the "${deploymentName}" deployment.`);
  }
  return null;
}

async function removeDeployment(userId, appName, deploymentName) {
  console.log(`\n[query]removeDeployment`);

  const checkApp = await findApp(userId, appName);

  if (checkApp.length === 0) {
    return responseDto(false, `App "${appName}" doesn't exist!`);
  }

  const appId = checkApp[0].id;
  const query = `DELETE FROM greenlight_codepush_dev_db.deployments WHERE app_id = ? AND deployment_name = ?;`;

  const res = await runQuery(query, [appId, deploymentName]);

  if (res.affectedRows > 0) {
    return responseDto(true, `Successfully removed the "${deploymentName}" deployment.`);
  } else if (res.affectedRows === 0) {
    return responseDto(false, `Deployment "${deploymentName}" doesn't exist.`);
  }
  return null;
}

async function renameDeployment(userId, appName, currentDeploymentName, newDeploymentName) {
  console.log(`\n[query]renameDeployment`);
  const checkApp = await findApp(userId, appName);

  if (checkApp.length === 0) {
    return responseDto(false, `App "${appName}" doesn't exist!`);
  }

  // find deployments
  const appId = checkApp[0].id;
  const deployments = await findDeployment(appId, newDeploymentName);

  if (deployments && deployments.length) {
    return responseDto(false, `A deployment named "${newDeploymentName}" already exists.`);
  }

  const query = `UPDATE greenlight_codepush_dev_db.deployments SET deployment_name = ? WHERE app_id = ? AND deployment_name = ?;`;

  const res = await runQuery(query, [newDeploymentName, appId, currentDeploymentName]);
  if (res.affectedRows > 0) {
    return responseDto(true, `Successfully renamed the "${currentDeploymentName}" deployment to "${newDeploymentName}".`);
  } else if (res.affectedRows === 0) {
    return responseDto(false, `Deployment "${currentDeploymentName}" doesn't exist.`);
  }
  return null;
}

async function getDeploymentHistory(userId, appName, deploymentName) {
  console.log(`\n[query]getDeploymentHistory`);

  const checkApp = await findApp(userId, appName);

  if (checkApp.length === 0) {
    return responseDto(false, `App "${appName}" doesn't exist!`);
  }

  // find deployments
  const appId = checkApp[0].id;
  const deployments = await findDeployment(appId, deploymentName);

  if (deployments.length === 0) {
    return responseDto(false, `Deployment "${deploymentName}" doesn't exist!`);
  }

  const deploymentId = deployments[0].id;

  const query = `
    SELECT version, label, release_notes, is_mandatory, is_active, created_at FROM greenlight_codepush_dev_db.updates WHERE deployment_id = ?;
    
    SELECT r.rolled_back_by, r.rolled_back_at, r.reason, u.id as update_id, u.version, u.label FROM greenlight_codepush_dev_db.rollbacks r LEFT JOIN greenlight_codepush_dev_db.updates u ON r.update_id = u.id WHERE r.deployment_id = ?;
  `;

  const res = await runQuery(query, [deploymentId, deploymentId]);
  const [updates, rollbacks] = res;

  if (updates.length > 0 || rollbacks.length > 0) {
    return responseDto(true, ``, {
      multipleTable: [
        { title: "Updates", table: updates },
        { title: "Rollbacks", table: rollbacks },
      ],
    });
  } else if (res.length === 0) {
    return responseDto(false, `No history in deployment "${deploymentName}".`);
  }
}

/******************* Codepush ******************/
async function checkArgsAndOptions(userId, appName, platform, deploymentName, targetBinaryVersion) {
  console.log(`\n[query]checkArgsAndOptions`);
  const checkApp = await findApp(userId, appName);

  if (checkApp.length === 0) {
    return responseDto(false, `App "${appName}" doesn't exist!`);
  }

  if (!Boolean(platform === "android" || platform === "ios")) {
    return responseDto(false, `Platform must be either "android" or "ios".`);
  }

  const appId = checkApp[0].id;
  const deployments = await findDeployment(appId, deploymentName);

  if (deployments.length === 0) {
    return responseDto(false, `Deployment "${deploymentName}" doesn't exist.`);
  }

  if (targetBinaryVersion) {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!semverRegex.test(targetBinaryVersion)) {
      return responseDto(false, `Please use a semver-compliant target binary version range, for example "1.0.0".`);
    }
  }

  return responseDto(true, ``);
}

module.exports = {
  findUser,
  registerUser,
  getAppListByUser,
  addApp,
  removeApp,
  renameApp,
  addDeployment,
  clearDeployment,
  removeDeployment,
  renameDeployment,
  getDeploymentList,
  getDeploymentHistory,
  checkArgsAndOptions,
};

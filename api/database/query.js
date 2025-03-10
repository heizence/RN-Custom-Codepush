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
  console.log("accountId : ", accountId);
  const query = `SELECT id, account_id, email, user_name, type, created_at FROM greenlight_codepush_dev_db.users WHERE account_id = ?;`;
  return await runQuery(query, [accountId]);
}

async function findUser(accountId) {
  console.log(`\n[query]findUser`);
  console.log("accountId : ", accountId);
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

module.exports = {
  loginUser,
  findUser,
  registerUser,
};

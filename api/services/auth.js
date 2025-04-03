const path = require("path");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const dotenv = require("dotenv");
const { loginUser, registerUser } = require("../database/query");
const { generateJWT } = require("./jwt-utils");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const ENV = { ...process.env };

// Do not delete accessToken, refreshToken parameters!
const loginCallback = async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await loginUser(profile.id);
    if (!user) {
      done(null, { success: false });
    } else {
      const token = generateJWT(user[0].account_id, user[0].email);
      done(null, { user, token, success: true });
    }
  } catch (err) {
    done(err);
  }
};

const registerCallback = (type = "github") => {
  // Do not delete accessToken, refreshToken parameters!
  return async (accessToken, refreshToken, profile, done) => {
    try {
      const {
        id,
        username, // for github
        displayName, // for google
        emails, // for google
      } = profile;

      let user;
      if (type === "github") {
        user = await registerUser(id, null, username, type);
      } else if (type === "google") {
        user = await registerUser(id, emails[0].value, displayName, "google");
      }

      if (user) {
        const token = generateJWT(user.account_id, user.type, user.user_name);
        done(null, { user, token, success: true });
      } else {
        done(null, { success: false });
      }
    } catch (err) {
      done(err);
    }
  };
};

/******************* GitHub OAuth Strategy ******************/

passport.use(
  "github-login",
  new GitHubStrategy(
    {
      clientID: ENV.GITHUB_CLIENT_ID,
      clientSecret: ENV.GITHUB_CLIENT_SECRET,
      callbackURL: `${ENV.SERVER_URL}:${ENV.PORT}/auth/login/github/callback`,
    },
    loginCallback
  )
);

passport.use(
  "github-register",
  new GitHubStrategy(
    {
      clientID: ENV.GITHUB_CLIENT_ID,
      clientSecret: ENV.GITHUB_CLIENT_SECRET,
      callbackURL: `${ENV.SERVER_URL}:${ENV.PORT}/auth/register/github/callback`,
    },
    registerCallback("github")
  )
);

// Serialize and Deserialize user (store/retrieve user information in the session)
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  // Retrieve user from session (typically from your database)
  done(null, id);
});

/******************* Google OAuth Strategy ******************/
passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: `${ENV.SERVER_URL}:${ENV.PORT}/auth/login/google/callback`,
      scope: ["profile", "email"], // You can specify other scopes if needed
    },
    loginCallback
  )
);

passport.use(
  "google-register",
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: `${ENV.SERVER_URL}:${ENV.PORT}/auth/register/google/callback`,
      scope: ["profile", "email"], // You can specify other scopes if needed
    },
    registerCallback("google")
  )
);

// Serialize and Deserialize user (store/retrieve user information in the session)
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  // Retrieve user from session (typically from your database)
  done(null, id);
});

module.exports = passport;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const db = require("../database/db");
const dotenv = require("dotenv");
const { loginUser, registerUser } = require("../database/query");
const { verifyToken, generateJWT } = require("./jwt-utils");
dotenv.config();

const ENV = { ...process.env };

/******************* GitHub OAuth Strategy ******************/

passport.use(
  "github-login",
  new GitHubStrategy(
    {
      clientID: ENV.GITHUB_CLIENT_ID,
      clientSecret: ENV.GITHUB_CLIENT_SECRET,
      callbackURL: `${ENV.SERVER_URL}:${ENV.PORT}/auth/login/github/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const user = await loginUser(profile.id);
        if (!user) {
          done(`Account not found. Have you registered with the CLI?`, null);
        } else {
          const token = generateJWT(user.account_id, user.type, user.user_name);
          done(null, { user, token });
        }
      } catch (err) {
        done(err);
      }
    }
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
    async function (accessToken, refreshToken, profile, done) {
      try {
        const { id, username } = profile;
        const user = await registerUser(id, null, username, "github");
        if (user) {
          done(null, profile);
        } else {
          done(null, { message: `Register failed` });
        }
      } catch (err) {
        done(err);
      }
    }
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
    async function (accessToken, refreshToken, profile, done) {
      try {
        const user = await loginUser(profile.id);
        if (!user) {
          done(`Account not found. Have you registered with the CLI?`, null);
        } else {
          const token = generateJWT(user.account_id, user.type, user.user_name);
          done(null, { user, token });
        }
      } catch (err) {
        done(err);
      }
    }
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
    async function (accessToken, refreshToken, profile, done) {
      try {
        const { id, displayName, emails } = profile;
        console.log("emails.value : ", emails);
        const user = await registerUser(id, emails[0].value, displayName, "google");
        if (user) {
          done(null, profile);
        } else {
          done(`Register failed`, null);
        }
      } catch (err) {
        done(err);
      }
    }
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

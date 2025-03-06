const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
dotenv.config();

const ENV = { ...process.env };

/******************* GitHub OAuth Strategy ******************/
passport.use(
  new GitHubStrategy(
    {
      clientID: ENV.GITHUB_CLIENT_ID,
      clientSecret: ENV.GITHUB_CLIENT_SECRET,
      callbackURL: `${ENV.SERVER_URL}:${ENV.PORT}/auth/github/callback`,
    },
    function (accessToken, refreshToken, profile, done) {
      // Store profile info in your database or session
      console.log("github strategy callback!!!");
      return done(null, profile);
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
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: `${ENV.SERVER_URL}:${ENV.PORT}/auth/google/callback`,
      scope: ["profile", "email"], // You can specify other scopes if needed
    },
    function (accessToken, refreshToken, profile, done) {
      // Store profile info in your session or database
      return done(null, profile);
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

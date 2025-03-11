const express = require("express");
const router = express.Router();
const passport = require("../services/auth.js"); // The passport configuration

router.get("/login", (req, res) => {
  res.render("authProvider", { action: "login" }); // Use flash messages for errors
});

router.get("/register", (req, res) => {
  res.render("authProvider", { action: "register" }); // Use flash messages for errors
});

/******************* GitHub Authentication Router ******************/
router.get("/login/github", passport.authenticate("github-login"));
router.get("/login/github/callback", passport.authenticate("github-login", { failureRedirect: "/auth/callback/message" }), (req, res) => {
  const success = req.user.success;
  if (success) {
    const token = req.user.token;
    res.render("authSuccess", { token });
  } else {
    res.render("message", {
      message: `<h1>Account not found.</h1>
      <h1>Have you registered with the CLI?</h1>`,
    });
  }
});

router.get("/register/github", passport.authenticate("github-register"));
router.get("/register/github/callback", passport.authenticate("github-register", { failureRedirect: "/auth/callback/message" }), (req, res) => {
  const success = req.user.success;
  if (success) {
    const token = req.user.token;
    res.render("authSuccess", { token });
  } else {
    res.render("message", {
      message: `<h1>Register failed.</h1>
      <h1>The account has already been registered!</h1>`,
    });
  }
});

/******************* Google Authentication Router ******************/
router.get("/login/google", passport.authenticate("google-login"));
router.get("/login/google/callback", passport.authenticate("google-login", { failureRedirect: "/login" }), (req, res) => {
  const success = req.user.success;
  if (success) {
    const token = req.user.token;
    res.render("authSuccess", { token });
  } else {
    res.render("message", {
      message: `<h1>Account not found.</h1>
      <h1>Have you registered with the CLI?</h1>`,
    });
  }
});

router.get("/register/google", passport.authenticate("google-register"));
router.get("/register/google/callback", passport.authenticate("google-register", { failureRedirect: "/auth/callback/message" }), (req, res) => {
  const success = req.user.success;
  if (success) {
    const token = req.user.token;
    res.render("authSuccess", { token });
  } else {
    res.render("message", {
      message: `<h1>Register failed.</h1>
      <h1>The account has already been registered!</h1>`,
    });
  }
});

router.get("/callback/message", (req, res) => {
  // Successful authentication, redirect to dashboard
  console.log(`\n[router]callback/message`);
  console.log("res : ", res);
  const message = req.user.message || "";
  console.log("message : ", message);
  res.render("dashboard", { message }); // Use flash messages for errors
});

router.get("/logout", (req, res) => {
  // req.logout clears the session data, effectively logging the user out.
  req.logout(err => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    // Need to delete jwt token file stored at local.
    res.redirect("/auth/login"); // Redirect to login after logout
  });
});

module.exports = router;

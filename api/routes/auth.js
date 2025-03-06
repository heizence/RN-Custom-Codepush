const express = require("express");
const router = express.Router();
const passport = require("../services/auth.js"); // The passport configuration

// Render login page (assuming `login.ejs` exists in views)
router.get("/auth/login", (req, res) => {
  res.render("authenticate", { action: "login" }); // Use flash messages for errors
});

/******************* GitHub Authentication Router ******************/
router.get("/auth/login/github", passport.authenticate("github"));

router.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/login" }), (req, res) => {
  res.redirect("/dashboard"); // Redirect to dashboard or home after successful login
});

/******************* Google Authentication Router ******************/
router.get("/auth/login/google", passport.authenticate("google"));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  // Successful authentication, redirect to dashboard
  res.redirect("/dashboard");
});

router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.redirect("/auth/login"); // Redirect to login after logout
  });
});

module.exports = router;

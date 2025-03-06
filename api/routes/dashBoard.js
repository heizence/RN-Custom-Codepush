const express = require("express");
const router = express.Router();

// Ensure the user is authenticated for the dashboard route
router.get("/dashBoard", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("dashboard"); // Render the dashboard if authenticated
  } else {
    res.redirect("/login"); // Redirect to login if not authenticated
  }
});

module.exports = router;

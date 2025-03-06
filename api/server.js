// The entry point of the application. It configures Express, loads routes, and starts the server.

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/auth");
const codePushRoutes = require("./routes/codePushRequest");
const dashBoardRoutes = require("./routes/dashBoard");

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set views directory
app.use("/images", express.static(path.join(__dirname, "views", "images")));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "300mb", extended: true }));
app.use(cors()); // Allow all origins, be more restrictive in production
app.use(
  session({
    secret: "1234abcd",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use(authRoutes);
app.use(dashBoardRoutes);
app.use("/api/codepush", codePushRoutes);

// Start the server
app.listen(port, () => {
  console.log(`\n## CodePush server running on ${process.env.SERVER_URL}:${port}\n`);
});

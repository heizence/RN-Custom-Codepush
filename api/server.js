// The entry point of the application. It configures Express, loads routes, and starts the server.

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const userAuthRoutes = require("./routes/userAuth");
const userAppsRoutes = require("./routes/userApps");
const deploymentRoutes = require("./routes/deployments");
const codePushRoutes = require("./routes/codePushRequest");
const dashBoardRoutes = require("./routes/dashBoard");
const CheckTokenMiddleware = require("./middlewares/checkToken");
const { responseDto } = require("./DTO/response");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

//dotenv.config({ path: __dirname + "../.env" });

// Initialize express
const app = express();
const port = process.env.PORT || 3000;
const url = process.env.SERVER_URL || "http://localhost";

// main(/) route
app.get("/", (req, res) => {
  console.log(`\nCodePush server is ready on ${url}:${port}\n`);
  res.send("Greenlight Codepush server is ready!");
});

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set views directory
app.use("/images", express.static(path.join(__dirname, "views", "images")));

// Middlewares
app.use(express.json()); // This is important to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // For form data (optional, if needed)
app.use(cors()); // Allow all origins, be more restrictive in production
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use("/auth", userAuthRoutes);
app.use(dashBoardRoutes);

app.use("/app", CheckTokenMiddleware, userAppsRoutes);
app.use("/deployment", CheckTokenMiddleware, deploymentRoutes);
app.use("/codepush", CheckTokenMiddleware, codePushRoutes);

// For error handling
app.use((err, req, res, next) => {
  //console.error("🚨 Error Middleware:", err.stack);
  console.log("error middleware");
  res.status(501).json(responseDto(false, "Internal Server Error", err));
});

// Start the server
app.listen(port, () => {
  console.log(`\nCodePush server running on ${url}:${port}\n`);
});

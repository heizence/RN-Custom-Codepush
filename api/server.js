// The entry point of the application. It configures Express, loads routes, and starts the server.

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

const codePushRoutes = require("./routes/codePushRoutes");

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "300mb", extended: true }));
app.use(cors()); // Allow all origins, be more restrictive in production

app.use("/main", (req, res) => {
  console.log("main route get!!");
  res.send("codepush server ready!");
});

// Use routes
app.use("/api/codepush", codePushRoutes);

// Start the server
app.listen(port, () => {
  console.log(`CodePush server running on port ${port}`);
});

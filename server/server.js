// Import dependencies
const express = require("express");
const morgan = require("morgan"); // logging middleware
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("express-jwt");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
// Import routes
const authRouter = require("./routes/auth-route");
const userRouter = require("./routes/user-route");
const lectureRouter = require("./routes/lecture-route");
const courseRouter = require("./routes/course-route");
const mail = require("./controllers/email-controller");
const statsRouter = require("./routes/usage-route");
const uploadRouter = require("./routes/upload-route");
const semesterRouter = require("./routes/semester-route");
const tracingRouter = require("./routes/tracing-routes");
// Set default port for express app
const PORT = process.env.PORT || 4001;

// Create express app
const app = express();

// Apply middleware
// Note: Keep this at the top, above routes
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// Set-up logging
app.use(morgan("tiny"));

// Routes
app.use("/api/auth", authRouter);
// For the rest of the code, all APIs require authentication
app.use(
  jwt({
    secret: jwtSecret,
    algorithms: ["sha1", "RS256", "HS256"],
    getToken: (req) => req.cookies.token,
  })
);
app.use("/api/user", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/lectures", lectureRouter);
app.use("/api/stats", statsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/semesters", semesterRouter);
app.use("/api/tracing", tracingRouter);

// To return a better object in case of errors
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ message: "Authorization error" });
  }
});

// Implement 500 error route
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something is broken.");
});

// Implement 404 error route
app.use(function (req, res, next) {
  res.status(404).send("Sorry we could not find that.");
});
// Start express app
app.listen(PORT, function () {
  startMailCron();
  console.log(`Server is running on: ${PORT}`);
});

function startMailCron() {
  mail.startScheduler("0 0 0 * * *");
}

module.exports = app;

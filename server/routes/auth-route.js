// Import express
const express = require("express");

// Import user-controller
const userRoutes = require("./../controllers/user-controller");

// Create router
const router = express.Router();

router.post("/login", userRoutes.login);

router.post("/logout", userRoutes.logout);

// Export router
module.exports = router;

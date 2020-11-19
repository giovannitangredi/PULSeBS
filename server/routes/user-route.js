// Import express
const express = require("express");

// Import books-controller
const userRoutes = require("./../controllers/user-controller");

// Create router
const router = express.Router();

router.get("/", userRoutes.get);

// Export router
module.exports = router;

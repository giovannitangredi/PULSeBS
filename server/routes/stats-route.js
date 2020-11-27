// Import express
const express = require("express");

// Import usage-controller
const usageRoutes = require("../controllers/usage-controller");

// Create router
const router = express.Router();

router.get("/systemStats", usageRoutes.getSystemStats);
router.get("/lecturesStats", usageRoutes.getAllLecturesStats);

// Export router
module.exports = router;

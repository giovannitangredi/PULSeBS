// Import express
const express = require("express");

// Import usage-controller
const usageRoutes = require("../controllers/usage-controller");

// Create router
const router = express.Router();

router.get("/system", usageRoutes.getSystemStats);
router.get("/lectures", usageRoutes.getAllLecturesStats);

// Export router
module.exports = router;

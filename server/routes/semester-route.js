// Import express
const express = require("express");

// Import controller
const semesterRoutes = require("./../controllers/semester-controller");

// Create router
const router = express.Router();

router.get("/", semesterRoutes.getSemester);
router.get("/future", semesterRoutes.getFutureSemesters);

// Export router
module.exports = router;

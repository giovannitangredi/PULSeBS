// Import express
const express = require("express");

// Import controller
const semesterRoutes = require("./../controllers/semester-controller");

// Create router
const router = express.Router();

router.get("/", semesterRoutes.getSemester);
//router.post("/:", semesterRoutes.setSemester);

// Export router
module.exports = router;

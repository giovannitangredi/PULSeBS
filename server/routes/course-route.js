// Import express
const express = require("express");

// Import books-controller
const courseRoutes = require("./../controllers/course-controller");
const lectureRoutes = require("./../controllers/lecture-controller");

// Create router
const router = express.Router();

router.get("/", courseRoutes.getCourses);
router.get("/:courseid/lectures", lectureRoutes.getScheduledLectures);

// Export router
module.exports = router;
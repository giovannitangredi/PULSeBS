const express = require("express");

// Import lecture-controller
const lectureRoutes = require("./../controllers/lecture_booking-controller");

// Create router
const router = express.Router();

router.get("/studentlectures", lectureRoutes.getStudentLectures);

// Export router
module.exports = router;
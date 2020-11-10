const express = require("express");

// Import lecture-controller
const lectureRoutes = require("./../controllers/lecture_booking-controller");

// Create router
const router = express.Router();

router.get("/studentbooking", lectureRoutes.getBookingLectures);

// Export router
module.exports = router;
// Import express
const express = require("express");

// Import books-controller
const lectureRoutes = require("./../controllers/lecture-controller");

// Create router
const router = express.Router();

router.get("/bookable", lectureRoutes.getBookingLectures);
router.post("/:lectureId/book", lectureRoutes.newBooking);
router.get("/previousbooking", lectureRoutes.getExistentBooking);
router.get("/:lectureid/students", lectureRoutes.getBookedStudents);
// Export router
module.exports = router;


const express = require("express");

// Import lecture-controller
const lectureRoutes = require("./../controllers/lecture-controller");

// Create router
const router = express.Router();

router.get("/bookable", lectureRoutes.getBookingLectures);
router.post("/:lectureId/book", lectureRoutes.newBooking);
router.get("/previousbooking", lectureRoutes.getExistentBooking);
router.get("/:lectureid/students", lectureRoutes.getBookedStudents);
router.put("/:lectureid/convert", lectureRoutes.convertDistanceLecture);
router.delete("/:lectureid/cancelbook", lectureRoutes.cancelBooking);
router.delete("/:lectureId", lectureRoutes.deleteLecture);
// Export router
module.exports = router;

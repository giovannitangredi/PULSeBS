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

// `/future/*` routes:  Used to retrieve data about entities related to future lectures.
//                      This is used by to implement the Bookability Batch Update feature
//                      used by the Support Officer.
router.get("/future", lectureRoutes.getFutureLectures);
router.get("/future/teachers", lectureRoutes.getFutureTeachers);
router.get("/future/courses", lectureRoutes.getFutureCourses);

router.post("/bookable", lectureRoutes.updateBookability);
// Export router
module.exports = router;

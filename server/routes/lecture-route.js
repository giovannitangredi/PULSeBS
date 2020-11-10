const express = require("express");

// Import lecture-controller
const lectureRoutes = require("./../controllers/lecture-controller");

// Create router
const router = express.Router();

router.get("/bookable/:userId", lectureRoutes.getBookingLectures);
router.get("/:lectureId/book", lectureRoutes.newBooking);
router.get("/previousbooking", lectureRoutes.getExistentBooking);

// Export router
module.exports = router;
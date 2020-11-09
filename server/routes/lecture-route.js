const express = require("express");

// Import lecture-controller
const lecturebookingRoutes = require("./../controllers/lecture-controller");

// Create router
const router = express.Router();

router.get("/newbooking", lecturebookingRoutes.newBooking);

// Export router
module.exports = router;
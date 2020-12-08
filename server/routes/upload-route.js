// Import express
const express = require("express");

// Import upload-controller
const uploadRoutes = require("./../controllers/upload-controller");

// Import upload-middlewara
const upload = require("./../middlewares/upload-middlewares");
// Create router
const router = express.Router();

router.post("/students", upload.single("file"), uploadRoutes.uploadStudents);
router.post("/teachers", upload.single("file"), uploadRoutes.uploadProfessors);
router.post("/courses", upload.single("file"), uploadRoutes.uploadCourses);
router.post(
  "/enrollments",
  upload.single("file"),
  uploadRoutes.uploadEnrollments
);
router.post("/schedule", upload.single("file"), uploadRoutes.uploadSchedule);

// Export router
module.exports = router;

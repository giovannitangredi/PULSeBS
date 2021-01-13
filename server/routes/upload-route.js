// Import express
const express = require("express");

// Import upload-controller
const uploadRoutes = require("./../controllers/upload-controller");

// Import upload-middlewara
const upload = require("./../middlewares/upload-middlewares");
// Create router
const router = express.Router();

router.post("/students", upload, uploadRoutes.uploadStudents);
router.post("/teachers", upload, uploadRoutes.uploadProfessors);
router.post("/courses", upload, uploadRoutes.uploadCourses);
router.post("/enrollments", upload, uploadRoutes.uploadEnrollments);
router.post("/schedule/:semesterid",upload,uploadRoutes.uploadSchedule);

// Export router
module.exports = router;

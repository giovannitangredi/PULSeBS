// Import express
const express = require("express");

// Import upload-controller
const tracingRoutes = require("./../controllers/tracing-controller");

// Create router
const router = express.Router();

router.get('/:ssn/search',tracingRoutes.searchBySsn);
router.get('/:studentId/report',tracingRoutes.getContactTracingReport);

// Export router
module.exports = router;

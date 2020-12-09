const multer = require("multer");

const csvFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("text/csv") ||
    file.mimetype.includes("application/vnd.ms-excel") ||
    file.mimetype.includes("application/octet-stream")
  ) {
    cb(null, true);
  } else {
    cb("Please upload only csv file.", false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${__dirname}/../../resources/static/uploads/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadFile = multer({ storage: storage, fileFilter: csvFilter });
module.exports = uploadFile;

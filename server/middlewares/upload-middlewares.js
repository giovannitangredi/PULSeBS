const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${__dirname}/../../resources/static/uploads/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadFile = ((req, res, next) => {

  var handler = multer({ 

    storage: storage, 

    fileFilter: (req, file, cb) => {
      if (
        file.mimetype.includes("text/csv") ||
        file.mimetype.includes("application/vnd.ms-excel") ||
        file.mimetype.includes("application/octet-stream")
      ) {
        cb(null, true);
      } else {
        cb("Please upload only csv file.", false);
        res.status(400).json("Please upload only csv file.");
      }
    }, 
    limits: {
    fileSize: 8000000 // 8MB max file
  }
  }).single("file");
  handler(req, res, next);
});
module.exports = uploadFile;

const knex = require("./../db");
const fs = require("fs");
const csv = require("fast-csv");
const moment = require("moment");
const bcrypt = require("bcrypt");

checkSupportOfficer = async (userId) => {
  const user = await knex
    .select({ role: "role" })
    .from("user")
    .where("id", userId)
    .catch(() => {
      throw { msg: `There was an error retrieving user info`, status: 400 };
    });
  if (user.length == 1 && !["support officer"].includes(user[0].role)) {
    return false;
  }
  return true;
};

exports.uploadStudents = async (req, res) => {
  const userId = req.user.id;
  let path = `${__dirname}/../../resources/static/uploads/` + req.file.filename;
  try {
    if (!(await checkSupportOfficer(userId))) {
      throw {
        msg: `Only support officer can upload files.`,
        status: 401,
      };
    }
    if (req.file == undefined) {
      return res.status(501).send("Please upload a CSV file!");
    }
    let rows = [];
    fs.createReadStream(path)
      .pipe(
        csv.parse({
          headers: [
            "id",
            "name",
            "surname",
            "city",
            "email",
            "birthday",
            "ssn",
          ],
          renameHeaders: true,
        })
      )
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        row.password_hash = bcrypt.hashSync("password", 1);
        row.role = "student";
        rows.push(row);
      })
      .on("end", () => {
        var chunkSize = 100;
        knex
          .batchInsert("user", rows, chunkSize)
          .then(() => {
            res.status(200).send({
              message:
                "Uploaded the file successfully: " +
                req.file.originalname +
                "/nRows inserted: " +
                rows.length,
            });
          })
          .catch((error) => {
            res.status(502).send({
              message: "Fail to import data into database!",
              error: error.message,
            });
          });
      });
  } catch (error) {
    res.status(error.status).send({
      message: error.msg,
    });
  }
  fs.unlinkSync(path);
};

exports.uploadProfessors = async (req, res) => {
  const userId = req.user.id;
  let path = `${__dirname}/../../resources/static/uploads/` + req.file.filename;
  try {
    if (!(await checkSupportOfficer(userId))) {
      throw {
        msg: `Only support officer can upload files.`,
        status: 401,
      };
    }
    if (req.file == undefined) {
      return res.status(501).send("Please upload a CSV file!");
    }

    let rows = [];

    fs.createReadStream(path)
      .pipe(
        csv.parse({
          headers: ["id", "name", "surname", "email", "ssn"],
          renameHeaders: true,
        })
      )
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        row.password_hash = bcrypt.hashSync("password", 1);
        row.role = "teacher";
        rows.push(row);
      })
      .on("end", () => {
        var chunkSize = 100;
        knex
          .batchInsert("user", rows, chunkSize)
          .then(() => {
            res.status(200).send({
              message:
                "Uploaded the file successfully: " +
                req.file.originalname +
                "/nRows inserted: " +
                rows.length,
            });
          })
          .catch((error) => {
            console.log(error);
            res.status(502).send({
              message: "Fail to import data into database!",
              error: error.message,
            });
          });
      });
  } catch (error) {
    res.status(error.status).send({
      message: "Could not upload the file: " + req.file.originalname,
    });
  }
  fs.unlinkSync(path);
};

exports.uploadCourses = async (req, res) => {
  const userId = req.user.id;
  let path = `${__dirname}/../../resources/static/uploads/` + req.file.filename;
  try {
    if (!(await checkSupportOfficer(userId))) {
      throw {
        msg: `Only support officer can upload files.`,
        status: 401,
      };
    }
    if (req.file == undefined) {
      return res.status(501).send("Please upload a CSV file!");
    }

    let rows = [];

    fs.createReadStream(path)
      .pipe(
        csv.parse({
          headers: ["id", "year", "semester", "name", "main_prof"],
          renameHeaders: true,
        })
      )
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", () => {
        var chunkSize = 100;
        knex
          .batchInsert("course", rows, chunkSize)
          .then(() => {
            res.status(200).send({
              message:
                "Uploaded the file successfully: " +
                req.file.originalname +
                "/nRows inserted: " +
                rows.length,
            });
          })
          .catch((error) => {
            console.log(error);
            res.status(502).send({
              message: "Fail to import data into database!",
              error: error.message,
            });
          });
      });
  } catch (error) {
    res.status(error.status).send({
      message: "Could not upload the file: " + req.file.originalname,
    });
  }
  fs.unlinkSync(path);
};

exports.uploadEnrollments = async (req, res) => {
  const userId = req.user.id;
  let path = `${__dirname}/../../resources/static/uploads/` + req.file.filename;
  try {
    if (!(await checkSupportOfficer(userId))) {
      throw {
        msg: `Only support officer can upload files.`,
        status: 401,
      };
    }
    if (req.file == undefined) {
      return res.status(501).send("Please upload a CSV file!");
    }

    let rows = [];

    fs.createReadStream(path)
      .pipe(
        csv.parse({ headers: ["course_id", "student_id"], renameHeaders: true })
      )
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", () => {
        var chunkSize = 100;
        knex
          .batchInsert("course_available_student", rows, chunkSize)
          .then(() => {
            res.status(200).send({
              message:
                "Uploaded the file successfully: " +
                req.file.originalname +
                "/nRows inserted: " +
                rows.length,
            });
          })
          .catch((error) => {
            console.log(error);
            res.status(502).send({
              message: "Fail to import data into database!",
              error: error.message,
            });
          });
      });
  } catch (error) {
    res.status(error.status).send({
      message: "Could not upload the file: " + req.file.originalname,
    });
  }
  fs.unlinkSync(path);
};

exports.uploadSchedule = async (req, res) => {
  const userId = req.user.id;
  const semesterId = req.params.semesterid;
  let path = `${__dirname}/../../resources/static/uploads/` + req.file.filename;
  try {
    if (!(await checkSupportOfficer(userId))) {
      throw {
        msg: `Only support officer can upload files.`,
        status: 401,
      };
    }
    const semester = await knex
      .select({
        sid: "sid",
        inserted_lectures: "inserted_lectures",
      })
      .from("semester")
      .where("sid", semesterId);
    if (semester[0].inserted_lectures === 1) {
      throw {
        msg: `Already inserted the lecture for Semester ` + semesterId,
        status: 504,
      };
    }

    if (req.file == undefined) {
      return res.status(501).send("Please upload a CSV file!");
    }

    let rows = [];
    fs.createReadStream(path)
      .pipe(
        csv.parse({
          headers: ["id", "room", "day", "capacity", "time"],
          renameHeaders: true,
        })
      )
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        rows.push(row);
        generateLectures(semesterId, row)
      })
      .on("end", () => {
        knex("semester")
          .update({ inserted_lectures: 1 })
          .where("sid", semesterId)
          .then(() => {
            res.status(200).send({
              message:
                "Uploaded the file successfully: " +
                req.file.originalname +
                "/nSchedule lecture inserted: " +
                rows.length,
            });
          });
      });
  } catch (error) {
    console.log(error);
    res.status(error.status).send({
      message: "Could not upload the file: " + req.file.originalname,
    });
  }
  fs.unlinkSync(path);
};

generateLectures = async (semesterId, lecture) => {
  try {
    const semester = await knex
      .select({
        start: "start",
        end: "end",
      })
      .from("semester")
      .where("sid", semesterId);
    let semesterDate = semester[0];

    const course = await knex
      .select({ main_prof: "main_prof" })
      .from("course")
      .where("id", lecture.id);
    let courseProf = course[0];

    let start = moment(semesterDate.start);
    let end = moment(semesterDate.end);
    let arr = [];

    let tmp = start.clone().day(lecture.day);
    if (tmp.isSameOrAfter(start, "d")) {
      //check if the day of the first week is after the start date, if true add a date

      arr.push(createLecture(lecture, courseProf, tmp));
    }
    while (tmp.add(7, "days").isBefore(end)) {
      //generate all days until the end date adding 7 days each time

      arr.push(createLecture(lecture, courseProf, tmp));
    }
    await knex("lecture").insert(arr);
  } catch (error) {
    console.log(error);
    throw { msg: `There was an error`, status: 503 };
  }
};

createLecture = (lecture, courseProf, date) => {
  let row = {};
  row.course = lecture.id;
  row.lecturer = courseProf.main_prof;
  row.capacity = lecture.capacity;
  row.status = "presence";
  row.room = lecture.room;
  let times = lecture.time.split("-");
  let [hour, minute] = times[0].split(":");
  date.set({ hour, minute });
  row.start = date.format("YYYY-MM-DD HH:mm:ss");
  [hour, minute] = times[1].split(":");
  date.set({ hour, minute });
  row.end = date.format("YYYY-MM-DD HH:mm:ss");
  return row;
};

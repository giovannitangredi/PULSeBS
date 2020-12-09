const knex = require("./../db");
const fs = require("fs");
const csv = require("fast-csv");
const moment = require("moment");
const bcrypt = require("bcrypt");

const checkSupportOfficer = async (userId) => {
  const user = await knex
    .select({ role: "role" })
    .from("user")
    .where("id", userId)
    .catch(() => {
      throw { msg: `There was an error retrieving user info`, status: 400 };
    });
  if (user.length == 1 && !["supportOfficer"].includes(user[0].role)) {
    return false;
  }
  return true;
};

const readFile = async (userId, path, type, semesterId) => {
  //type: student, teacher, course, enrollment, schedule
  let err = {};
  const headers = {
    student: ["id", "name", "surname", "city", "email", "birthday", "ssn"],
    teacher: ["id", "name", "surname", "email", "ssn"],
    course: ["id", "year", "semester", "name", "main_prof"],
    enrollment: ["course_id", "student_id"],
    schedule: ["id", "room", "day", "capacity", "time"],
  };
  const tables = {
    student: "user",
    teacher: "user",
    course: "course",
    enrollment: "course_available_student",
    schedule: "lecture",
  };
  if (!(await checkSupportOfficer(userId))) {
    throw {
      msg: "Only support officer can upload files.",
      status: 401,
    };
  }
  let rows = [];
  fs.createReadStream(path)
    .pipe(
      csv.parse({
        headers: headers[type],
        renameHeaders: true,
      })
    )
    .on("error", (error) => {
      throw {
        msg: error,
      };
    })
    .on("data", (row) => {
      if (["student", "teacher"].includes(type)) {
        row.password_hash = bcrypt.hashSync("password", 1);
        row.role = type;
      }
      if (type === "schedule") {
        generateLectures(semesterId, row);
      }
      rows.push(row); //keep for schedule?
    })
    .on("end", () => {
      if (type != "schedule") {
        var chunkSize = 100;
        knex
          .batchInsert(tables[type], rows, chunkSize)
          .then(() => {
            console.log("SUCCESS");
            return rows.length;
          })
          .catch((err) => {
            console.log("ERRORE ", err); //ritorna errore
            throw {
              status: 500,
              msg: `There was an error inserting the ${type}s`,
            };
          });
      }
    });
};

exports.uploadStudents = async (req, res) => {
  const userId = req.user.id;
  let path = `${__dirname}/../../resources/static/uploads/` + req.file.filename;

  try {
    const rows = await readFile(userId, path, "student", null);
    res.status(200).send({
      rows_lenght: rows,
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (error) {
    console.log(error);
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
    const rows = await readFile(userId, path, "teacher", null);
    res.status(200).send({
      rows_lenght: rows,
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (error) {
    console.log(error);
    res.status(error.status).send({
      message: error.msg,
    });
  }
  fs.unlinkSync(path);
};

exports.uploadCourses = async (req, res) => {
  const userId = req.user.id;
  let path = `${__dirname}/../../resources/static/uploads/` + req.file.filename;
  try {
    const rows = await readFile(userId, path, "course", null);
    res.status(200).send({
      rows_lenght: rows,
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (error) {
    console.log(error);
    res.status(error.status).send({
      message: error.msg,
    });
  }

  fs.unlinkSync(path);
};

exports.uploadEnrollments = async (req, res) => {
  const userId = req.user.id;
  let path = `${__dirname}/../../resources/static/uploads/` + req.file.filename;
  try {
    const rows = await readFile(userId, path, "enrollment", null);
    res.status(200).send({
      rows_lenght: rows,
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (error) {
    console.log(error);
    res.status(error.status).send({
      message: error.msg,
    });
  }

  fs.unlinkSync(path);
};

exports.uploadSchedule = async (req, res) => {
  const userId = req.user.id;
  const semesterId = req.body.semesterid;
  let path = `${__dirname}/../../resources/static/uploads/` + req.file.filename;
  try {
    if (!semesterId) {
      throw {
        msg: "No params included",
        status: 500,
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
    await readFile(userId, path, "schedule", semesterId);
    res.status(200).send({
      message:
        "Uploaded the file successfully: " +
        req.file
          .originalname /* +
      "\nRows inserted: " +
      rows.length,*/,
    });
  } catch (error) {
    console.log(error);
    res.status(error.status).send({
      message: error.msg,
    });
  } /*
  knex("semester")
  .update({ inserted_lectures: 1 })
  .where("sid", semesterId)*/

  fs.unlinkSync(path);
};

const generateLectures = async (semesterId, lecture) => {
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

      arr.push(createLecture(lecture, courseProf, tmp)); //nome della lezione incrementale?
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

const createLecture = (lecture, courseProf, date) => {
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

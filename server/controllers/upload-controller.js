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
/*
const checkDuplicate = async (values) => {  //check duplicate elements (same id)
  //console.log(values)
  let valueArr = values.map(function(item){ return item.id });
  valueArr.some(function(item, idx){ 
    console.log(valueArr.indexOf(item) != idx)
    return valueArr.indexOf(item) != idx    //return true if ther is duplicate
});
}*/

const readFile = async (userId, path, type, semesterId) => {
  //type: student, teacher, course, enrollment, schedule
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
  return new Promise(async (resolve, reject) => {
    if (!(await checkSupportOfficer(userId))) {
      reject({
        msg: "Only support officer can upload files.",
        status: 401,
      });
      return;
    }
    let rows = [];
    //var totInsert = 0;
    fs.createReadStream(path)
      .pipe(
        csv.parse({
          headers: headers[type],
          renameHeaders: true,
        })
      )
      .on("error", (error) => {
        reject({
          msg: error,
        });
      })
      .on("data", (row) => {
        if (["student", "teacher"].includes(type)) {
          row.password_hash = bcrypt.hashSync("password", 1);
          row.role = type;
        }
        if (type === "schedule") {
          generateLectures(semesterId, row).catch((error) => {
            reject({
              status: 500,
              msg: `There was an error inserting the schedule`,
            });
          });
        } else {
          rows.push(row);
        }
      })
      .on("end", () => {
        if (type != "schedule") {
          var chunkSize = 100;
          knex
            .batchInsert(tables[type], rows, chunkSize)
            .then(() => {
              console.log("SUCCESS");
              resolve(rows.length);
            })
            .catch((err) => {
              reject({
                status: 500,
                msg: `There was an error inserting the ${type}s`,
              });
            });
        } else {
          resolve();
        }
      });
  });
};

exports.uploadStudents = async (req, res) => {
  const userId = req.user.id;
  let path = `${__dirname}/../../resources/static/uploads/` + req.file.filename;
  try {
    const tot = await readFile(userId, path, "student", null);
    res.status(200).send({
      tot_insert: tot,
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
    const tot = await readFile(userId, path, "teacher", null);
    res.status(200).send({
      tot_insert: tot,
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
    const tot = await readFile(userId, path, "course", null);
    res.status(200).send({
      tot_insert: tot,
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
    const tot = await readFile(userId, path, "enrollment", null);
    res.status(200).send({
      tot_insert: tot,
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
  const semesterId = req.params.semesterid;
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
    const prova = await knex.select("course", "lecturer","start","end","room","capacity","status")
    .from("lecture"); // TODO: Don't know why when I remove this prova line even when it is not used, related test fails
    /*console.log("ELENCO IN CONTROLER",prova)*/
    await knex("semester")
      .update({ inserted_lectures: 1 })
      .where("sid", semesterId); //no more insert of lecture for the selected semester
    res.status(200).send({
      //tot_insert: tot,
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (error) {
    res.status(error.status).send({
      message: error.msg,
    });
  }
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
    const days = [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat","Sun"];
    const regex =
      "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$";
    if (lecture.time.match(regex) === null || !days.includes(lecture.day) ) {
      return 0;
    }
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
    return arr.length;
  } catch (error) {
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

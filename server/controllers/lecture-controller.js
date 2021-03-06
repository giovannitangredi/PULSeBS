const moment = require("moment");
const knex = require("./../db");
const emailController = require("./email-controller");

//Get all available bookings by one student before deadline
exports.getBookingLectures = async (req, res) => {
  const studentId = req.user && req.user.id;
  const today = moment().format("YYYY-MM-DD HH:mm:ss");
  const deadline = moment(today).add(12, "hours").format("YYYY-MM-DD HH:mm:ss");
  knex
    .select(
      { id: "lecture.id" },
      { course: "course.name" },
      { lecturer_name: "user.name" },
      { lecturer_surname: "user.surname" },
      { start: "start" },
      { end: "end" },
      { status: "lecture.status" },
      { room: "lecture.room" },
      { year: "course.year" },
      { semester: "course.semester" },
      { capacity: "capacity" },
      knex.raw(`IFNULL(bookedStudent,0) as booked_students`)
    )
    .from("lecture")
    .join(
      "course_available_student",
      "lecture.course",
      "=",
      "course_available_student.course_id"
    )
    .joinRaw(
      `LEFT JOIN (	select lecture_booking.lecture_id as l_id,count(*) as bookedStudent
                           from lecture_booking
                          group by lecture_booking.lecture_id) countbook  ON countbook.l_id=lecture.id`
    )
    .join("user", "lecture.lecturer", "user.id")
    .join("course", "lecture.course", "course.id")
    .whereNotIn("lecture.id", function () {
      //don't select the lectures already booked
      this.select("lecture_id")
        .from("lecture_booking")
        .where("student_id", studentId);
    })
    .andWhere("course_available_student.student_id", studentId) //select only lectures that student can attend
    .andWhere("start", ">", deadline) //deadline (before 12 hours)
    .then(async (queryResults) => {
      const stuff = await Promise.all(
        queryResults.map(async (item) => {
          var rItem = { ...item };
          rItem.candidate =
            (
              await knex("waiting_list").where({
                lecture_id: item.id,
                student_id: studentId,
              })
            ).length > 0;
          return rItem;
        })
      );
      res.json(stuff);
    })
    .catch((err) => {
      res.json({
        message: `There was an error retrieving the scheduled lectures: ${err}`,
      });
    });
};

//Get existent bookings by one student
exports.getExistentBooking = async (req, res) => {
  const studentId = req.user && req.user.id;
  knex
    .select(
      { id: "lecture.id" },
      { course: "course.name" },
      { lecturer_name: "user.name" },
      { lecturer_surname: "user.surname" },
      { start: "lecture.start" },
      { end: "lecture.end" },
      { room: "lecture.room" },
      { year: "course.year" },
      { semester: "course.semester" },
      { capacity: "lecture.capacity" },
      { booked_at: "lecture_booking.booked_at" },
      { status: "lecture.status" }
    )
    .from("lecture")
    .join("lecture_booking", "lecture.id", "=", "lecture_booking.lecture_id")
    .join("user", "lecture.lecturer", "user.id")
    .join("course", "lecture.course", "course.id")
    .where("lecture_booking.student_id", studentId)
    .orderBy("start", "asc")
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.json({
        message: `There was an error retrieving the student's lectures: ${err}`,
      });
    });
};

//Insert new booking of a lecture

exports.newBooking = async (req, res) => {
  // Insert new booking from table lecture_booking
  const studentId = req.user && req.user.id;
  const lectureId = req.params.lectureId;
  const today = moment().format("YYYY-MM-DD HH:mm:ss");
  knex
    .select(
      { start: "start" },
      { status: "status" },
      { capacity: "capacity" },
      { courseName: "course.name" }
    )
    .from("lecture")
    .join("course", "lecture.course", "=", "course.id")
    .where("lecture.id", lectureId) // needs to check whether user can book.
    .then(async ([lectureQueryResults]) => {
      const lecture = lectureQueryResults;

      if (lecture.status !== "presence") {
        throw `Lecture of the course ${lecture.courseName} is a remote one, can't be bookable`;
      }
      const alreadyBooked =
        (
          await knex("lecture_booking").count("* as booked").where({
            lecture_id: lectureId,
            student_id: studentId,
          })
        )[0].booked > 0;
      if (alreadyBooked) {
        throw `You already booked lecture.`;
      }
      if (
        (
          await knex("waiting_list").where({
            lecture_id: lectureId,
            student_id: studentId,
          })
        ).length !== 0
      ) {
        throw "You are already part of the waiting list.";
      }
      const bookedSeats = (
        await knex("lecture_booking")
          .count("student_id as booked_seats")
          .where({
            lecture_id: lectureId,
          })
      )[0].booked_seats;
      if (bookedSeats >= lecture.capacity) {
        knex("waiting_list")
          .insert({
            lecture_id: lectureId,
            student_id: studentId,
            booked_at: today,
          })
          .then(() => {
            res.json({ message: `You've been added to the waiting list.` });
          });
      } else {
        knex("lecture_booking")
          .insert({
            // insert new record
            lecture_id: lectureId,
            student_id: studentId, //idstudent
            booked_at: today, //time
          })
          .then(() => {
            // Send a success message in response
            res.json({ message: `Booking created.` });

            // Get the user information
            const userQuery = knex
              .select("name", "surname", "email")
              .from("user")
              .where("id", req.user.id);

            // Get the lecture information
            const lectureQuery = knex
              .select({ courseName: "course.name" }, { start: "start" })
              .from("lecture")
              .join("course", "lecture.course", "=", "course.id")
              .where("lecture.id", req.params.lectureId);

            Promise.all([userQuery, lectureQuery])
              .then(([userQueryResults, lectureQueryResults]) => {
                // Send an email confirmation
                const user = userQueryResults[0];
                const lecture = lectureQueryResults[0];

                const emailSubject = "Booking confirmation";
                const emailBody = `Dear ${user.name} ${user.surname},<br/> \
            You have successfully booked a seat for the lesson of the course ${lecture.courseName} scheduled for ${lecture.start}<br/><br/>\
            Thanks,<br/>The PULSeBS Team`;

                emailController.sendMail(user.email, emailSubject, emailBody);
              })
              .catch((err) => {
                console.error("There was an error sending the email: " + err);
              });
          })
          .catch((err) => {
            // Send a error message in response
            throw `There was an error creating the booking.`;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        message: `There was an error booking the lecture: ${err}`,
      });
    });
};

// Cancel booking from table lecture_booking

exports.cancelBooking = async (req, res) => {
  const lectureId = req.params.lectureid;
  const studentId = req.user && req.user.id;

  knex("lecture_booking")
    .where("lecture_id", lectureId)
    .andWhere("student_id", studentId)
    .del()
    .then(async (result) => {
      if (result === 0) throw "No booking to cancel.";

      const [waiting] = await knex("waiting_list")
        .where("lecture_id", lectureId)
        .orderBy("booked_at", "asc")
        .limit(1);
      if (waiting) {
        const { lecture_id, student_id, booked_at } = waiting;

        await knex("lecture_booking").insert({
          lecture_id,
          student_id,
          booked_at,
        });
        await knex("waiting_list")
          .where("lecture_id", lecture_id)
          .andWhere("student_id", student_id)
          .del();

        sendCandidateToReserveChangeEmail(lecture_id, student_id);
      }
      res.json({ message: "Booking cancelled." });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ message: `There was an error canceling the booking: ${err}` });
    });
};
// Get the list of lectures scheduled for a course
exports.getScheduledLectures = async (req, res) => {
  const courseId = req.params.courseid;
  knex
    .select(
      { id: "l.id" },
      { course: "l.course" },
      { start: "l.start" },
      { end: "l.end" },
      { capacity: "l.capacity" },
      { lecturer_id: "u.id" },
      { lecturer_name: "u.name" },
      { lecturer_surname: "u.surname" },
      { status: "l.status" },
      { room: "l.room" }
    )
    .from({ l: "lecture" })
    .join({ u: "user" }, "l.lecturer", "=", "u.id")
    .where("l.course", courseId)
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.json({
        message: `There was an error retrieving the scheduled lectures`,
      });
    });
};

// Get the list of students booked for a lecture
exports.getBookedStudents = async (req, res) => {
  const lectureId = req.params.lectureid;
  knex
    .select(
      { id: "user.id" },
      { name: "user.name" },
      { surname: "user.surname" },
      { email: "user.email" },
      { status: "lecture_booking.status" }
    )
    .from("lecture_booking")
    .join("user", "lecture_booking.student_id", "=", "user.id")
    .join("lecture", "lecture.id", "lecture_booking.lecture_id")
    .where("lecture_booking.lecture_id", lectureId)
    .andWhere("lecture.status", "presence") //show only presence lecture
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.status(400).json({
        message: `There was an error retrieving the students list`,
      });
    });
};

// Turn a presence lecture into a distance one
exports.convertDistanceLecture = async (req, res) => {
  const lectureId = req.params.lectureid;
  const today = moment().format("YYYY-MM-DD HH:mm:ss");
  const deadline = moment(today)
    .add(30, "minutes")
    .format("YYYY-MM-DD HH:mm:ss");
  knex
    .select({ start: "start" }, { status: "status" }, { lecturer: "lecturer" })
    .from("lecture")
    .where("id", lectureId)
    .then(([lectureQueryResults]) => {
      const lecture = lectureQueryResults;
      if (
        moment(deadline).isBefore(lecture.start) &&
        lecture.status === "presence" &&
        lecture.lecturer === req.user.id
      ) {
        knex("lecture")
          .where("id", lectureId)
          .update({
            status: "distance",
            capacity: "0",
          })
          .then(() => {
            res.status(204).json({
              message: `Presence lecture turned into a distance one`,
            });
          })
          .catch((err) => {
            res.status(304).json({
              message: `There was an error converting the lecture into a distance one`,
            });
          });
      } else if (lecture.lecturer != req.user.id) {
        res.status(401).json({
          message: `Professor can convert only his lecture`,
        });
      } else if (lecture.status === "distance") {
        res.status(304).json({
          message: `Presence lecture can't be turned into a distance one: Already a distance one!`,
        });
      } else {
        res.status(304).json({
          message: `Presence lecture can't be turned into a distance one: Lecture starting in 30 minutes!`,
        });
      }
    })
    .catch((err) => {
      res.status(404).json({
        message: `There was an error searching the lecture`,
      });
    });
};

exports.deleteLecture = async (req, res) => {
  const lectureId = req.params.lectureId;
  try {
    const lectureQuery = await knex
      .select(
        { id: "l.id" },
        { course: "l.course" },
        { start: "l.start" },
        { lecturer: "l.lecturer" }
      )
      .from({ l: "lecture" })
      .where("l.id", lectureId);
    if (lectureQuery.length == 1) {
      const lecture = lectureQuery[0];
      const deadlineToCancel = moment()
        .add(1, "hours")
        .format("YYYY-MM-DD HH:mm:ss");
      if (
        lecture.lecturer == req.user.id &&
        lecture.start.localeCompare(deadlineToCancel) > 0
      ) {
        sendEmailsForCancelledLecture(lectureId);
        await knex("lecture").where("id", lectureId).del();
        res.status(202).send();
      } else {
        throw new Error("The lecture can't be cancelled.");
      }
    } else {
      throw new Error("The lecture doesn't exist.");
    }
  } catch (err) {
    res
      .status(400)
      .json({ message: `There was an error cancelling the lecture: ${err}` });
  }
};

// Record the attendances of a lecture  
exports.recordAttendances = async (req, res) => {
  const userId = req.user.id;
  const lectureId = req.params.lectureid;
  const presentStudents = req.body.studentlist;
  console.log(presentStudents);
  let queries;

  try {
    if(!Array.isArray(presentStudents)) {
      throw {
        msg: `Invalid body: an array containing the student ids is expected`,
        status: 422,
      };
    }
    const [lecture] = await knex
      .select(
        { id: "l.id" },
        { start: "l.start" },
        { lecturer: "l.lecturer" },
        { status: "l.status" }
      )
      .from({ l: "lecture" })
      .where("l.id", lectureId);

    if(!lecture) {
      throw {
        msg: `The lecture doesn't exist`,
        status: 404,
      };
    } else if(lecture.lecturer != userId) {
      throw {
        msg: `Only the teacher of this course can record attendances`,
        status: 401,
      };
    } else if(lecture.status != "presence") {
      throw {
        msg: `Cannot record attendances of remote lecture`,
        status: 400,
      };
    } else if( !(
      moment().isSame(moment(lecture.start, "YYYY-MM-DD HH:mm:ss"), "day") 
      && moment().isSameOrAfter(moment(lecture.start, "YYYY-MM-DD HH:mm:ss"))
    )) {
      throw {
        msg: `Attendances can only be recorded on the same day of the lecture after its start time`,
        status: 400,
      };
    }

    const bookedStudents = 
        ( 
          await knex.select("student_id")
            .from("lecture_booking")
            .where("lecture_id", lectureId)
        ).map(student => student.student_id);
    
    const absentStudents = bookedStudents.filter(studentId => !presentStudents.includes(studentId));
    
    await knex.transaction(trx => {
      // set the status to "present" for all the students in presentStudents...
      queries = 
        presentStudents.map( 
          studentId => 
            knex("lecture_booking")
              .where("lecture_id", lectureId)
              .andWhere("student_id", studentId)
              .update({status: "present"})
              .transacting(trx)
        );
      
      // ... and set the status to "absent" for all the other students in absentStudents
      queries.push(
        ...absentStudents.map( 
          studentId => 
            knex("lecture_booking")
              .where("lecture_id", lectureId)
              .andWhere("student_id", studentId)
              .update({status: "absent"})
              .transacting(trx)
        )
      );

      Promise.all(queries)
        .then((result) => {
          if(result.includes(0)) {
            trx.rollback({
              msg: `There was an error recording the attendances: Wrong ids in the list`,
              status: 400,
            });
          } else {
            trx.commit();
          }
        })
        .catch((err) => { 
          console.error(err);
          trx.rollback({
            msg: `There was an error recording the attendances`,
            status: 500,
          }); 
        });
    });

    res.status(204).send();

  } catch (err) {
    console.log(err);
    res
      .status(err.status)
      .json({
        message: err.msg,
      });
  }
};

const sendEmailsForCancelledLecture = async (lectureId) => {
  const result = await knex
    .select(
      { id: "user.id" },
      { name: "user.name" },
      { surname: "user.surname" },
      { email: "user.email" },
      { lectureCourseName: "course.name" },
      { lectureStart: "lecture.start" }
    )
    .from("lecture_booking")
    .join("user", "lecture_booking.student_id", "=", "user.id")
    .join("lecture", "lecture.id", "=", "lecture_booking.lecture_id")
    .join("course", "lecture.course", "=", "course.id")
    .where("lecture_booking.lecture_id", lectureId);

  const emailSubject = "Lecture cancel information";
  const emailBody = (
    name,
    surname,
    lectureCourseName,
    lectureStart
  ) => `Dear ${name} ${surname},<br/> \
  The lecture from the ${lectureCourseName} course you booked, that was scheduled for ${lectureStart}, was cancelled by the teacher,\
    <br/>The PULSeBS Team`;

  const queue = result.map((item) =>
    emailController.sendMail(
      item.email,
      emailSubject,
      emailBody(
        item.name,
        item.surname,
        item.lectureCourseName,
        item.lectureStart
      )
    )
  );
  try {
    await Promise.all(queue);
  } catch (err) {
    console.log(`There was an error cancelling the lecture: ${err}`);
  }
};

const sendCandidateToReserveChangeEmail = async (lectureId, studentId) => {
  try {
    const [result] = await knex
      .select(
        { id: "user.id" },
        { name: "user.name" },
        { surname: "user.surname" },
        { email: "user.email" },
        { lectureStart: "lecture.start" },
        { lectureCourseName: "course.name" }
      )
      .from("lecture_booking")
      .join("user", "lecture_booking.student_id", "=", "user.id")
      .join("lecture", "lecture.id", "=", "lecture_booking.lecture_id")
      .join("course", "lecture.course", "=", "course.id")
      .where("lecture_booking.lecture_id", lectureId)
      .andWhere("user.id", studentId)
      .limit(1);

    console.log(result);
    if (!result) throw "Lecture does not exist.";

    const emailSubject = "You are moved from candidate list to Reserved List";
    const emailBody = (
      name,
      surname,
      lectureCourseName,
      lectureStart
    ) => `Dear ${name} ${surname},<br/> \
  Your request state for lecture from the ${lectureCourseName} course scheduled for ${lectureStart} has changed from candidate to reserve. Now you can participate in this lecture,\
  <br/>The PULSeBS Team`;

    await emailController.sendMail(
      result.email,
      emailSubject,
      emailBody(
        result.name,
        result.surname,
        result.lectureCourseName,
        result.lectureStart
      )
    );
  } catch (err) {
    console.log(`There was an error cancelling the lecture: ${err}`);
  }
};

// Retrieves all lectures all the lectures that will be held in the future (startTime > currentTime).
exports.getFutureLectures = async (req, res) => {
  const user = req.user && req.user.id;
  knex
    .select({ id: "id", role: "role" })
    .from("user")
    .where("id", user)
    .then(async (result) => {
      if (result[0].role != "supportOfficer") {
        return res.status(401).json({
          message:
            "Unauthorized access, only support officers can access this data.",
        });
      }
      const lectures = await knex("lecture")
        .select({
          id: "lecture.id",
          prof: "user.surname",
          course: "course.name",
          start: "lecture.start",
          end: "lecture.end",
          year: "course.year",
        })
        .join("course", "course.id", "=", "lecture.course")
        .join("user", "user.id", "=", "lecture.lecturer")
        .where("lecture.start", ">=", moment().format("YYYY-MM-DD HH:mm:ss"));

      res.json(lectures);
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the data about the lectures: ${err}`,
      });
    });
};

// Retrieves the professors that will teach lectures in the future.
exports.getFutureTeachers = async (req, res) => {
  const user = req.user && req.user.id;
  knex
    .select({ id: "id", role: "role" })
    .from("user")
    .where("id", user)
    .then(async (result) => {
      if (result[0].role != "supportOfficer") {
        return res.status(401).json({
          message:
            "Unauthorized access, only support officers can access this data.",
        });
      }
      const profs = await knex("user")
        .distinct({ id: "user.id", name: "user.name", surname: "user.surname" })
        .join("lecture", "user.id", "=", "lecture.lecturer")
        .where("user.role", "teacher")
        .andWhere("lecture.start", ">", moment().format("YYYY-MM-DD HH:mm:ss"));
            res.json(profs);
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the data about the teachers: ${err}`,
      });
    });
};

// Retrieves courses that will have lectures in the future.
exports.getFutureCourses = async (req, res) => {
  const userId = req.user && req.user.id;
  knex
    .select({ id: "id", role: "role" })
    .from("user")
    .where("id", userId)
    .then(async (result) => {
      if (result[0].role != "supportOfficer") {
        return res.status(401).json({
          message:
            "Unauthorized access, only support officers can access this data.",
        });
      }
      const courses = await knex("course")
        .select({
          id: "course.id",
          name: "course.name",
          prof: "user.surname",
          year: "course.year",
          semester: "course.semester",
        })
        .distinct("course.id")
        .join("user", "user.id", "=", "course.main_prof")
        .join("lecture", "lecture.course", "=", "course.id")
        .where("lecture.start", ">", moment().format("YYYY-MM-DD HH:mm:ss"));
      res.json(courses);
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving data about the courses: ${err}`,
      });
    });
};

// Updates bookability (turns a lecture either unbookable or bookable)
// in batch (all, by set of years, semesters, professors, courses, lectures).
exports.updateBookability = async (req, res) => {
  const userId = req.user && req.user.id;
  knex
    .select({ id: "id", role: "role" })
    .from("user")
    .where("id", userId)
    .then(async (result) => {
      if (result[0].role != "supportOfficer") {
        res.status(401).json({
          message:
            "Unauthorized access, only support officers can access this data.",
        });
      }
      const { bookable, granularity, batchItems } = req.body;
      let updateResult;
      if (batchItems.length === 0 && granularity !== "all") {
        res.status(421).json({
          message: "No op, data given didn't modify the database.",
        });
      } else {
        const newStatus = bookable ? "presence" : "distance";
        switch (granularity) {
          case "all":
            updateResult = await knex("lecture")
              .where("start", ">", moment().format("YYYY-MM-DD HH:mm:ss"))
              .update({ status: newStatus })
              .debug();
            break;
          case "by year":
            updateResult = await knex("lecture")
              .update({ status: newStatus })
              .where("start", ">", moment().format("YYYY-MM-DD HH:mm:ss"))
              .whereIn("course", function () {
                this.select("id").from("course").whereIn("year", batchItems);
              });
            break;
          case "by semester":
            updateResult = await knex("lecture")
              .update({ status: newStatus })
              .where("start", ">", moment().format("YYYY-MM-DD HH:mm:ss"))
              .whereIn("course", function () {
                this.select("id")
                  .from("course")
                  .whereIn("semester", batchItems);
              });
            break;
          case "by professor":
            updateResult = await knex("lecture")
              .whereIn("lecture.lecturer", batchItems)
              .where("start", ">", moment().format("YYYY-MM-DD HH:mm:ss"))
              .update({ status: newStatus })
              .debug();
            break;
          case "by course":
            updateResult = await knex("lecture")
              .whereIn("lecture.course", batchItems)
              .where("start", ">", moment().format("YYYY-MM-DD HH:mm:ss"))
              .update({ status: newStatus })
              .debug();
            break;
          case "by lecture":
            updateResult = await knex("lecture")
              .whereIn("lecture.id", batchItems)
              .where("start", ">", moment().format("YYYY-MM-DD HH:mm:ss"))
              .update({ status: newStatus })
              .debug();
            break;
          default: 
           return res.status(400).json({
              message: `There was an error updating the bookability of the selected lectures: invalid granularity value.`,
            }).send();
        }
        if (updateResult) {
          res.status(204).send();
        }
        else 
        {
          res.status(304).send({message: `Selected parameters didn't affect any lecture.` });
        }
      }
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error updating the bookability of the selected lectures: ${err}`,
      });
    });
};

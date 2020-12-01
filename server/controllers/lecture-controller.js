const moment = require("moment");
const knex = require("./../db");
const emailController = require("./email-controller");

//Get all available bookings by one student before deadline
exports.getBookingLectures = async (req, res) => {
  const studentId = req.user && req.user.id;
  const today = moment().format("YYYY-MM-DD HH:mm:ss");
  const deadline = moment(today).add(12, "hours").format("YYYY-MM-DD HH:mm:ss");
  const dateShown = moment(today).add(2, "weeks").format("YYYY-MM-DD HH:mm:ss");
  knex
    .select(
      { id: "lecture.id" },
      { name: "lecture.name" },
      { course: "course.name" },
      { lecturer_name: "user.name" },
      { lecturer_surname: "user.surname" },
      { start: "start" },
      { end: "end" },
      { status: "lecture.status" },
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
    .andWhere("start", "<", dateShown) //show only lecture in two weeks
    .then((queryResults) => {
      res.json(queryResults);
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
  const today = moment().format("YYYY-MM-DD HH:mm:ss");
  const dateShown = moment(today).add(2, "weeks").format("YYYY-MM-DD HH:mm:ss");
  knex
    .select(
      { id: "lecture.id" },
      { name: "lecture.name" },
      { course: "course.name" },
      { lecturer_name: "user.name" },
      { lecturer_surname: "user.surname" },
      { start: "start" },
      { end: "end" },
      { capacity: "capacity" },
      { booked_at: "booked_at" },
      { status: "status" }
    )
    .from("lecture")
    .join("lecture_booking", "lecture.id", "=", "lecture_booking.lecture_id")
    .join("user", "lecture.lecturer", "user.id")
    .join("course", "lecture.course", "course.id")
    .where("lecture_booking.student_id", studentId)
    .andWhere("start", ">", today) //show only future lectures
    .andWhere("start", "<", dateShown) //show only lecture in two weeks
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
    .select({ name: "name" }, { start: "start" }, { status: "status" })
    .from("lecture")
    .where("id", lectureId)
    .then(([lectureQueryResults]) => {
      const lecture = lectureQueryResults;
      if (lecture.status === "presence") {
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
              .select(
                { name: "lecture.name" },
                { courseName: "course.name" },
                { start: "start" }
              )
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
            You have successfully booked a seat for the lesson ${lecture.name} of the course ${lecture.courseName} scheduled for ${lecture.start}<br/><br/>\
            Thanks,<br/>The PULSeBS Team`;

                emailController.sendMail(user.email, emailSubject, emailBody);
              })
              .catch((err) => {
                console.error("There was an error sending the email: " + err);
              });
          })
          .catch((err) => {
            // Send a error message in response
            res.json({ message: `There was an error creating the booking` });
          });
      } else {
        res.json({
          message: `Lecture '${lecture.name}' is a remote one, can't be bookable`,
        });
      }
    })
    .catch((err) => {
      res.json({
        message: `There was an error searching the lecture`,
      });
    });
};

// Get the list of lectures scheduled for a course
exports.getScheduledLectures = async (req, res) => {
  const courseId = req.params.courseid;
  knex
    .select(
      { id: "l.id" },
      { name: "l.name" },
      { course: "l.course" },
      { start: "l.start" },
      { end: "l.end" },
      { capacity: "l.capacity" },
      { lecturer_id: "u.id" },
      { lecturer_name: "u.name" },
      { lecturer_surname: "u.surname" },
      { status: "l.status" }
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
      { email: "user.email" }
    )
    .from("lecture_booking")
    .join("user", "lecture_booking.student_id", "=", "user.id")
    .join("lecture", "lecture.id", "lecture_booking.lecture_id")
    .where("lecture_booking.lecture_id", lectureId)
    .andWhere("status", "presence") //show only presence lecture
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.json({
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
    .select({ name: "name" }, { start: "start" }, { status: "status" }, { lecturer: "lecturer"})
    .from("lecture")
    .where("id", lectureId)
    .then(([lectureQueryResults]) => {
      const lecture = lectureQueryResults;
      if (
        moment(deadline).isBefore(lecture.start) &&
        lecture.status === "presence" && lecture.lecturer === req.user.id
      ) {
        knex("lecture")
          .where("id", lectureId)
          .update({
            status: "distance",
            capacity: "0"
          })
          .then(() => {
            res.status(204).json({
              message: `Presence lecture '${lecture.name}' turned into a distance one`
            });
          })
          .catch((err) => {
            res.status(304).json({
              message: `There was an error converting the lecture into a distance one`
            });
          });
      } 
      else if (lecture.lecturer != req.user.id) {
        res.status(401).json({
          message: `Professor can convert only his lecture`
        });
      }  
          else if (lecture.status === "distance") {
        res.status(304).json({
          message: `Presence lecture '${lecture.name}' can't be turned into a distance one: Already a distance one!`
        });
      } else {
        res.status(304).json({
          message: `Presence lecture '${lecture.name}' can't be turned into a distance one: Lecture starting in 30 minutes!`
        });
      }
    })
    .catch((err) => {
      res.status(404).json({
        message: `There was an error searching the lecture`
      });
    });
};

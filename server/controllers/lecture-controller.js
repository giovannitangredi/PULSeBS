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
    /*.raw(`select lecture.id,lecture.name as name,course.name as course,user.name as lecturer_name,user.surname as lecturer_surname,start,end,capacity, IFNULL(bookedStudent,0) as booked_students
  from  lecture,user,course
  LEFT JOIN (	select lecture_booking.lecture_id as l_id,count(*) as bookedStudent
        from lecture_booking
        group by lecture_booking.lecture_id) countbook  ON countbook.l_id=lecture.id
  INNER JOIN course_available_student ON
      course_available_student.course_id=lecture.course		
  where lecture.lecturer=user.id and course.id=lecture.course
    and lecture.id not in (
  select lecture_id from lecture_booking where student_id = ?
  )
  and course_available_student.student_id = ?
  and start > ?
  and start < ?
  `, [studentId,studentId,deadline,dateShown])*/
    .select(
      { id: "lecture.id" },
      { name: "lecture.name" },
      { course: "course.name" },
      { lecturer_name: "user.name" },
      { lecturer_surname: "user.surname" },
      { start: "start" },
      { end: "end" },
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
      { booked_at: "booked_at" }
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
  //console.log(req.user);
  const today = moment().format("YYYY-MM-DD HH:mm:ss");

  knex("lecture_booking")
    .insert({
      // insert new record
      lecture_id: req.params.lectureId,
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
      { lecturer_surname: "u.surname" }
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
    .where("lecture_booking.lecture_id", lectureId)
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.json({
        message: `There was an error retrieving the students list`,
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

  let string =
    "select lecture from lectures where lesson starts in more than 1 hour, which this teacher owns and teaches.";
};

sendEmailsForCancelledLecture = async (lectureId) => {

  const result = await knex
    .select(
      { id: "user.id" },
      { name: "user.name" },
      { surname: "user.surname" },
      { email: "user.email" },
      { lectureName: "lecture.name" },
      { lectureCourseName: "course.name" },
      { lectureStart: "lecture.start" }
    )
    .from("lecture_booking")
    .join("user", "lecture_booking.student_id", "=", "user.id")
    .join("lecture", "lecture.id", "=", "lecture_booking.lecture_id")
    .join("course", "lecture.course", "=", "course.id")
    .where("lecture_booking.lecture_id", lectureId);

  const emailSubject = "Lecture cancel information";
  const emailBody = (name, surname, lectureName, lectureCourseName, lectureStart) => `Dear ${name} ${surname},<br/> \
    Your booked lecture ${lectureName} of the course ${lectureCourseName} scheduled for ${lectureStart} is canceled by the teacher,\
    <br/>The PULSeBS Team`;

  const queue = result.map(item => emailController.sendMail(item.email, emailSubject, emailBody(item.name, item.surname, item.lectureName, item.lectureCourseName, item.lectureStart)))
  try {
    await Promise.all(queue)
  } catch (err) {
    console.log(`There was an error cancelling the lecture: ${err}`);
  }
}
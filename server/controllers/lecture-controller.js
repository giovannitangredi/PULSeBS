const moment = require("moment");
const knex = require("./../db");

//Get all available bookings by one student before deadline
exports.getBookingLectures = async (req, res) => {
  const studentId = req.user && req.user.id;
  today = moment().format("YYYY-MM-DD HH:mm:ss");
  deadline = moment(today).add(12, "hours").format("YYYY-MM-DD HH:mm:ss");
  dateShown = moment(today).add(2, "weeks").format("YYYY-MM-DD HH:mm:ss");

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
  and start > "2020-11-17 05:30:53"
  and start < "2020-11-30 17:30:53"
  `, [studentId,studentId])*/
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
  today = moment().format("YYYY-MM-DD HH:mm:ss");

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
    .select({id: "l.id"}, {name: "l.name"}, {course: "l.course"}, {start: "l.start"}, {end: "l.end"}, 
      {capacity: "l.capacity"}, {lecturer_id: "u.id"}, {lecturer_name: "u.name"}, {lecturer_surname: "u.surname"})
    .from({l: "lecture"})
    .join({u: "user"}, "l.lecturer", "=", "u.id")
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
    .select({id: "user.id"}, {name: "user.name"}, {surname: "user.surname"}, {email: "user.email"})
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
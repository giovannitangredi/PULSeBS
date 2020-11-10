const moment = require("moment");
const knex = require("./../db");


//Get all available bookings by one student before deadline
exports.getBookingLectures = async (req, res) => {
    const studentId = req.user && req.user.id;  //studente autenticato
    today = moment().format('YYYY-MM-DD HH:mm:ss');
    deadline = moment(today).add(12, 'hours');
    dateShown = moment(today).add(2, 'weeks');
    console.log(today)
    console.log(deadline)
    
    knex
      //.select(knex.raw('lecture.id, name, course, lecturer, start, end, capacity, count(*) as booked_students'))
      .select({id: "lecture.id"}, {name: "name"}, {course: "course"}, {start: "start"}, {end: "end"}, {capacity: "capacity"})
      .from("lecture")
      .join("lecture_booking", "lecture.lecture_id", "=", "lecture_booking.lecture_id")
      .join("course_available_student", "lecture.course", "=", "course_available_student.course_id")
      .whereNotIn("lecture.lecture_id", function() {  //don't select the lectures already booked
        this.select("lecture_id")
        .from("lecture_booking")
        .where("student_id", studentId)
      })
      .andWhere("course_available_student", studentId)  //select only lectures that student can ayttend
      .andWhere("start", ">", deadline )   //deadline (before 12 hours)
      .andWhere("start", "<", dateShown)    //show only lecture in two weeks  
      .groupBy("lecture.lecture_id")
      .count("* as booked_students")
      .then((queryResults) => {
        res.json(queryResults);
      })
      .catch((err) => {
        res.json({
          message: `There was an error retrieving the student's lectures: ${err}`,
        });
      });
  };
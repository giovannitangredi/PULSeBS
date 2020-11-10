const knex = require("../db");
const moment = require("moment");

//Insert new booking of a lecture

exports.newBooking = async (req, res) => {
    // Insert new booking from table lecture_booking
    const studentId = req.user && req.user.id;
    console.log(req.user);
    today = moment().format('YYYY-MM-DD HH:mm:ss');

    knex("lecture_booking")
      .insert({
        // insert new record
        lecture_id: req.body.lecture_id,
        student_id: studentId,//idstudent  
        booked_at: today  //time
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

//Get existent bookings by one student

exports.getExistentBooking = async (req, res) => {
  const studentId = req.user && req.user.id;  //studente autenticato
  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  const dateShown = moment(today).add(2, 'weeks');
  console.log(today)

  knex
    .select({lecture_id: "lecture.id"}, {name: "name"}, {course: "course"}, {start: "start"}, {end: "end"}, {capacity: "capacity"}, {booked_at: "booked_at"})
    .from("lecture")
    .join("lecture_booking", "lecture.lecture_id", "=", "lecture_booking.lecture_id")
    .where("lecture.student_id", studentId)
    .andWhere("start", ">", today )   //show only future lectures
    .andWhere("start", "<", dateShown)    //show only lecture in two weeks  
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.json({
        message: `There was an error retrieving the student's lectures: ${err}`,
      });
    });
};
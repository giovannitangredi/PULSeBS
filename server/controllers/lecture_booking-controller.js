const knex = require("../db");
const moment = require("moment");

//Insert new booking of a lecture

exports.newBooking = async (req, res) => {
    // Insert new booking from table lecture_booking
    const studentId = req.user && req.user.id;
    console.log(req.user);
    today = moment().format('YYYY-MM-DD HH:mm:ss');
    //console.log(moment(),moment().format())

    knex("lecture_booking")
      .insert({
        // insert new record
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
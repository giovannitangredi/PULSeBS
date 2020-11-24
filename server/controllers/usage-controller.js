const knex = require("../db");

/**
 * Get historical data about bookings
 * 
 * /courses/:courseid/bookings 
 *    -> Return the number of bookings for all the lectures of the course { :courseid }
 * 
 * /courses/:courseid/bookings?week={year}-{week} 
 *    -> Return the avarage of bookings for the lectures of the course { :courseid } scheduled for the week { ?week }
 * 
 *  /courses/:courseid/bookings?month={year}-{month}
 *    -> Return the avarage of bookings for the lectures of the course { :courseid } scheduled for the month { ?month }
 * */ 
exports.getBookingStats = async (req, res) => {
    const courseId = req.params.courseid;
    const week = req.query.week;
    const month = req.query.month;

    if(week) {
      // Get the avarage of bookings for the lectures of the course {courseid} in a given week
      knex
        .select( 
          {course_id: "sl.course_id"}, 
          {course_name: "sl.course_name"},
          {week: "st.week"}
        )
        .avg({booking: "su.booking"})
        .from({su: "stats_usage"})
        .join({sl: "stats_lecture"}, "su.lid", "=", "sl.lid")
        .join({st: "stats_time"}, "su.tid", "=", "st.tid")
        .where("sl.course_id", courseId)
        .andWhere("st.week", week)
        .groupBy("course_id", "course_name", "week")
        .then((queryResults) => {
          res.json(queryResults);
        })
        .catch((err) => {
          res.json({
            message: `There was an error retrieving the bookings`,
          });
        });
    }
    else if (month) {
      // Get the avarage of bookings for the lectures of the course {courseid} in a given month
      knex
        .select( 
          {course_id: "sl.course_id"}, 
          {course_name: "sl.course_name"}, 
          {month: "st.month"}
        )
        .avg({booking: "su.booking"})
        .from({su: "stats_usage"})
        .join({sl: "stats_lecture"}, "su.lid", "=", "sl.lid")
        .join({st: "stats_time"}, "su.tid", "=", "st.tid")
        .where("sl.course_id", courseId)
        .andWhere("st.month", month)
        .groupBy("course_id", "course_name", "month")
        .then((queryResults) => {
          res.json(queryResults);
        })
        .catch((err) => {
          res.json({
            message: `There was an error retrieving the bookings`,
          });
        });

    }
    else {
      // Get the number of bookings for all the lectures of the course {courseid}
      knex
        .select(
          {lecture_id:"sl.lecture_id"}, 
          {lecture_name: "sl.lecture_name"}, 
          {course_id: "sl.course_id"}, 
          {course_name: "sl.course_name"}, 
          {booking: "su.booking"}
        )
        .from({su: "stats_usage"})
        .join({sl: "stats_lecture"}, "su.lid", "=", "sl.lid")
        .where("sl.course_id", courseId)
        .then((queryResults) => {
          res.json(queryResults);
        })
        .catch((err) => {
          res.json({
            message: `There was an error retrieving the bookings`,
          });
        });
    }
  };
  
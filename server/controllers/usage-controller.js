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
  const userId = req.user.id;

  try {
    
    const user = await knex
    .select({ role: "role" })
    .from("user")
    .where("id", userId)
    .catch(() => {
      throw { msg: `There was an error retrieving user info`, status: 501 };
    });

    if(user.length == 1 && user[0].role != "teacher") {
      throw { msg:`Only teachers can get the bookings`, status: 401 };
    }

    if(week) {
      // Get the avarage of bookings for the lectures of the course {courseid} in a given week
      knex
        .select( 
          {course_id: "sl.course_id"}, 
          {course_name: "sl.course_name"},
          {week: "st.week"},
          knex.raw("avg(su.booking - su.cancellations) as booking")
        )
        .from({su: "stats_usage"})
        .join({sl: "stats_lecture"}, "su.lid", "=", "sl.lid")
        .join({st: "stats_time"}, "su.tid", "=", "st.tid")
        .where("sl.course_id", courseId)
        .andWhere("st.week", week)
        .andWhere(knex.raw("su.booking - su.cancellations"), ">", 0)
        .andWhere("st.date", "<", knex.raw("date('now')"))
        .groupBy("course_id", "course_name", "week")
        .then((queryResults) => {
          res.json(queryResults);
        })
        .catch(() => {
          throw { msg: `There was an error retrieving weekly bookings`, status: 501 };
        });
    }
    else if (month) {
      // Get the avarage of bookings for the lectures of the course {courseid} in a given month
      knex
        .select( 
          {course_id: "sl.course_id"}, 
          {course_name: "sl.course_name"}, 
          {month: "st.month"},
          knex.raw("avg(su.booking - su.cancellations) as booking")
        )
        .from({su: "stats_usage"})
        .join({sl: "stats_lecture"}, "su.lid", "=", "sl.lid")
        .join({st: "stats_time"}, "su.tid", "=", "st.tid")
        .where("sl.course_id", courseId)
        .andWhere("st.month", month)
        .andWhere(knex.raw("su.booking - su.cancellations"), ">", 0)
        .andWhere("st.date", "<", knex.raw("date('now')"))
        .groupBy("course_id", "course_name", "month")
        .then((queryResults) => {
          res.json(queryResults);
        })
        .catch(() => {
          throw { msg: `There was an error retrieving monthly bookings`, status: 501 };
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
          {date: "st.date" },
          knex.raw("(su.booking - su.cancellations) as booking")
        )
        .from({su: "stats_usage"})
        .join({sl: "stats_lecture"}, "su.lid", "=", "sl.lid")
        .join({st: "stats_time"}, "su.tid", "=", "st.tid")
        .where("sl.course_id", courseId)
        .andWhere(knex.raw("su.booking - su.cancellations"), ">", 0)
        .andWhere("st.date", "<", knex.raw("date('now')"))
        .then((queryResults) => {
          res.json(queryResults);
        })
        .catch(() => {
          throw { msg: `There was an error retrieving bookings`, status: 501 };
        });
    }      
  } catch(err) {
    res
      .status(err.status)
      .json({
        message: err.msg
      });
  }
};
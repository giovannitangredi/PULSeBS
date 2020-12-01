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
        .catch((err) => {
          res.json({
            message: `There was an error retrieving the bookings ${err}`,
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
        .catch((err) => {
          res.json({
            message: `There was an error retrieving the bookings ${err}`,
          });
        });
    }
  };
  
  exports.getSystemStats = async (req,res)=>{
    // Get the sum of all stats
    knex("stats_usage")
    .sum({cancellations: "cancellations",bookings:"booking",attendances:"attendance"})
    .then((queryResults)=>{
      res.json(queryResults);
    })
    .catch((err)=>{
      res.status(501).json({
        message: `There was an error retrieving the system stats: ${err}`,
      });
    });
  }

  exports.getAllLecturesStats = async (req,res)=>{
    knex
    .select(
      {lecture : "sl.lecture_name"},
      {course : "sl.course_name"},
      {cancellations :"su.cancellations"},
      {attendance : "su.attendance"},
      {booking : "su.booking"},
      {date : "st.date"}
    )
    .from({su: "stats_usage"})
    .join({sl: "stats_lecture"}, "su.lid", "=", "sl.lid")
    .join({st: "stats_time"}, "st.tid", "=", "su.tid")
    .then((queryResults)=>{
      res.json(queryResults);
    })
    .catch((err)=>{
      res.status(501).json({
        message: `There was an error retrieving the all the lectures stats: ${err}`,
      });
    });
  }
  
  exports.getCourseTotalStats = async (req,res)=>{
    // Get the sum of all stats for a single course with id = courseid
    const courseid= req.params.courseid
    knex("stats_usage")
    .sum({cancellations: "cancellations",bookings:"booking",attendances:"attendance"})
    .join({sl: "stats_lecture"}, "stats_usage.lid", "=", "sl.lid")
    .where("sl.course_id",courseid)
    .then((queryResults)=>{
      res.json(queryResults);
    })
    .catch((err)=>{
      res.status(501).json({
        message: `There was an error retrieving the course  stats: ${err}`,
      });
    });
  }

  exports.getCourseLecturesStats = async (req,res)=>{
    const courseid= req.params.courseid
    knex
    .select(
      {lecture : "sl.lecture_name"},
      {course : "sl.course_name"},
      {cancellations :"su.cancellations"},
      {attendance : "su.attendance"},
      {booking : "su.booking"},
      {date : "st.date"}
    )
    .from({su: "stats_usage"})
    .join({sl: "stats_lecture"}, "su.lid", "=", "sl.lid")
    .join({st: "stats_time"}, "st.tid", "=", "su.tid")
    .where("sl.course_id",courseid)
    .then((queryResults)=>{
      res.json(queryResults);
    })
    .catch((err)=>{
      res.status(501).json({
        message: `There was an error retrieving the all the course lectures stats: ${err}`,
      });
    });
  }
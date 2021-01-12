const { where } = require("../db");
const knex = require("../db");
const moment = require("moment");

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
 *
 * /courses/:courseid/bookings?fromWeek={year}-{week}&toWeek={year}-{week}
 *    -> For each week return the avarage bookings for the lectures of the course { :courseid } scheduled between fromWeek and toWeek. { ?fromWeek, ?toWeek }
 *
 *  /courses/:courseid/bookings?fromMonth={year}-{week}&toMonth={year}-{week}
 *    -> For each month return the avarage bookings for the lectures of the course { :courseid } scheduled between fromMonth and toMonth. { ?fromMonth, ?toMonth }
 * */
exports.getBookingStats = async (req, res) => {
  const courseId = req.params.courseid;
  const { week, month, fromWeek, toWeek, fromMonth, toMonth } = req.query;

  const userId = req.user.id;

  try {
    const user = await knex
      .select({ role: "role" })
      .from("user")
      .where("id", userId)
      .catch(() => {
        throw { msg: `There was an error retrieving user info`, status: 501 };
      });

    if (user.length == 1 && !["teacher", "manager"].includes(user[0].role)) {
      throw {
        msg: `Only teachers and managers can get the bookings.`,
        status: 401,
      };
    }
    if (fromWeek && toWeek) {
      // Get the avarage of bookings for the lectures of the course {courseid} in a given week
      knex
        .select(
          { course_id: "sl.course_id" },
          { course_name: "sl.course_name" },
          { week: "st.week" },
          knex.raw("avg(su.booking - su.cancellations) as booking"),
          knex.raw("avg(su.cancellations) as cancellations"),
          knex.raw("avg(su.attendance) as attendances")
        )
        .from({ su: "stats_usage" })
        .join({ sl: "stats_lecture" }, "su.lid", "=", "sl.lid")
        .join({ st: "stats_time" }, "su.tid", "=", "st.tid")
        .where("sl.course_id", courseId)
        .andWhere("st.week", ">=", fromWeek)
        .andWhere("st.week", "<=", toWeek)
        .andWhere(knex.raw("su.booking - su.cancellations"), ">", 0)
        .groupBy("course_id", "course_name", "week")
        .then((queryResults) => {
          res.json(queryResults);
        })
        .catch(() => {
          throw {
            msg: `There was an error retrieving weekly bookings`,
            status: 501,
          };
        });
    } else if (fromMonth && toMonth) {
      // Get the avarage of bookings for the lectures of the course {courseid} in a given month
      knex
        .select(
          { course_id: "sl.course_id" },
          { course_name: "sl.course_name" },
          { month: "st.month" },
          knex.raw("avg(su.booking - su.cancellations) as booking"),
          knex.raw("avg(su.cancellations) as cancellations"),
          knex.raw("avg(su.attendance) as attendances")
        )
        .from({ su: "stats_usage" })
        .join({ sl: "stats_lecture" }, "su.lid", "=", "sl.lid")
        .join({ st: "stats_time" }, "su.tid", "=", "st.tid")
        .where("sl.course_id", courseId)
        .andWhere("st.month", ">=", fromMonth)
        .andWhere("st.month", "<=", toMonth)
        .andWhere(knex.raw("su.booking - su.cancellations"), ">", 0)
        .groupBy("course_id", "course_name", "month")
        .then((queryResults) => {
          res.json(queryResults);
        })
        .catch(() => {
          throw {
            msg: `There was an error retrieving monthly bookings`,
            status: 501,
          };
        });
    } else if (week) {
      // Get the avarage of bookings for the lectures of the course {courseid} in a given week
      knex
        .select(
          { course_id: "sl.course_id" },
          { course_name: "sl.course_name" },
          { week: "st.week" },
          knex.raw("avg(su.booking - su.cancellations) as booking"),
          knex.raw("avg(su.cancellations) as cancellations"),
          knex.raw("avg(su.attendance) as attendances")
        )
        .from({ su: "stats_usage" })
        .join({ sl: "stats_lecture" }, "su.lid", "=", "sl.lid")
        .join({ st: "stats_time" }, "su.tid", "=", "st.tid")
        .where("sl.course_id", courseId)
        .andWhere("st.week", week)
        .andWhere(knex.raw("su.booking - su.cancellations"), ">", 0)
        .andWhere("st.date", "<", knex.raw("date('now')"))
        .groupBy("course_id", "course_name", "week")
        .then((queryResults) => {
          res.json(queryResults);
        })
        .catch(() => {
          throw {
            msg: `There was an error retrieving weekly bookings`,
            status: 501,
          };
        });
    } else if (month) {
      // Get the avarage of bookings for the lectures of the course {courseid} in a given month
      knex
        .select(
          { course_id: "sl.course_id" },
          { course_name: "sl.course_name" },
          { month: "st.month" },
          knex.raw("avg(su.booking - su.cancellations) as booking"),
          knex.raw("avg(su.cancellations) as cancellations"),
          knex.raw("avg(su.attendance) as attendances")
        )
        .from({ su: "stats_usage" })
        .join({ sl: "stats_lecture" }, "su.lid", "=", "sl.lid")
        .join({ st: "stats_time" }, "su.tid", "=", "st.tid")
        .where("sl.course_id", courseId)
        .andWhere("st.month", month)
        .andWhere(knex.raw("su.booking - su.cancellations"), ">", 0)
        .andWhere("st.date", "<", knex.raw("date('now')"))
        .groupBy("course_id", "course_name", "month")
        .then((queryResults) => {
          res.json(queryResults);
        })
        .catch(() => {
          throw {
            msg: `There was an error retrieving monthly bookings`,
            status: 501,
          };
        });
    } else {
      // Get the number of bookings for all the lectures of the course {courseid}
      knex
        .select(
          { lecture_id: "sl.lecture_id" },
          //{ lecture_name: "sl.lecture_name" },
          { course_id: "sl.course_id" },
          { course_name: "sl.course_name" },
          { date: "st.date" },
          knex.raw("(su.booking - su.cancellations) as booking"),
          knex.raw("su.cancellations as cancellations"),
          knex.raw("su.attendance as attendances")
        )
        .from({ su: "stats_usage" })
        .join({ sl: "stats_lecture" }, "su.lid", "=", "sl.lid")
        .join({ st: "stats_time" }, "su.tid", "=", "st.tid")
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
  } catch (err) {
    res.status(err.status).json({
      message: err.msg,
    });
  }
};

exports.getSystemStats = async (req, res) => {
  // Get the sum of all stats
  const user = req.user && req.user.id;
  knex
    .select({ id: "id", role: "role" })
    .from("user")
    .where("id", user)
    .then((result) => {
      if (result[0].role != "manager") {
        //console.log(result.role);
        res.status(401).json({
          message: "Unauthorized access, only managers can access this data.",
        });
      }
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the system stats: ${err}`,
      });
    });
  knex("stats_usage")
    .sum({
      cancellations: "cancellations",
      bookings: knex.raw("(booking-cancellations)"),
      attendances: "attendance",
    })
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the system stats: ${err}`,
      });
    });
};

exports.getAllLecturesStats = async (req, res) => {
  const user = req.user && req.user.id;
  knex
    .select({ id: "id", role: "role" })
    .from("user")
    .where("id", user)
    .then((result) => {
      if (result[0].role != "manager")
        res.status(401).json({
          message: "Unauthorized access, only managers can access this data.",
        });
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the system stats: ${err}`,
      });
    });
  knex
    .select(
      //{ lecture: "sl.lecture_name" },
      { course: "sl.course_name" },
      { courseId: "sl.course_id" },
      { cancellations: "su.cancellations" },
      { attendances: "su.attendance" },
      { bookings: knex.raw("(su.booking-su.cancellations)") },
      { date: "st.date" }
    )
    .from({ su: "stats_usage" })
    .join({ sl: "stats_lecture" }, "su.lid", "=", "sl.lid")
    .join({ st: "stats_time" }, "st.tid", "=", "su.tid")
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the all the lectures stats: ${err}`,
      });
    });
};

exports.getCourseTotalStats = async (req, res) => {
  // Get the sum of all stats for a single course with id = courseid
  const user = req.user && req.user.id;
  knex
    .select({ id: "id", role: "role" })
    .from("user")
    .where("id", user)
    .then((result) => {
      if (result[0].role != "manager")
        res.status(401).json({
          message: "Unauthorized access, only managers can access this data",
        });
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the system stats: ${err}`,
      });
    });
  const courseid = req.params.courseid;
  knex("stats_usage")
    .sum({
      cancellations: "cancellations",
      bookings: knex.raw("(booking-cancellations)"),
      attendances: "attendance",
    })
    .join({ sl: "stats_lecture" }, "stats_usage.lid", "=", "sl.lid")
    .where("sl.course_id", courseid)
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the course  stats: ${err}`,
      });
    });
};

exports.getCourseLecturesStats = async (req, res) => {
  const user = req.user && req.user.id;
  knex
    .select({ id: "id", role: "role" })
    .from("user")
    .where("id", user)
    .then((result) => {
      if (result[0].role != "manager")
        res.status(401).json({
          message: "Unauthorized access, only managers can access this data.",
        });
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the system stats: ${err}`,
      });
    });
  const courseid = req.params.courseid;
  knex
    .select(
      //{ lecture: "sl.lecture_name" },
      { course: "sl.course_name" },
      { cancellations: "su.cancellations" },
      { attendances: "su.attendance" },
      { bookings: knex.raw("(su.booking-su.cancellations)") },
      { date: "st.date" }
    )
    .from({ su: "stats_usage" })
    .join({ sl: "stats_lecture" }, "su.lid", "=", "sl.lid")
    .join({ st: "stats_time" }, "st.tid", "=", "su.tid")
    .where("sl.course_id", courseid)
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the all the course lectures stats: ${err}`,
      });
    });
};
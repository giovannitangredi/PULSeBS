const knex = require("./../db");
const moment = require("moment");

// Get the semester and the start and end date
exports.getSemester = async (req, res) => {
  knex
    .select("sid", "name", "start", "end", "inserted_lectures")
    .from("semester")
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.json({
        message: `There was an error retrieving the semester ${err}`,
      });
    });
};

// Retrieves semesters in which future lectures are scheduled.
exports.getFutureSemesters = async (req, res) => {
  const userId = req.user && req.user.id;
  knex
    .select({ id: "id", role: "role" })
    .from("user")
    .where("id", userId)
    .then(async (result) => {
      if (result[0].role != "supportOfficer") {
        res.status(401).json({
          message:
            "Unauthorized access, only support officers can access this data.",
        });
      }
      const semesters = await knex("semester")
        .select({ id: "sid", name: "name", start: "start", end: "end" })
        .where("end", ">", moment().format("YYYY-MM-DD"));
      res.json(semesters);
    })
    .catch((err) => {
      res.status(501).json({
        message: `There was an error retrieving the data about the semesters: ${err}`,
      });
    });
};

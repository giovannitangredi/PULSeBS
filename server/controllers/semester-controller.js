const knex = require("./../db");

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


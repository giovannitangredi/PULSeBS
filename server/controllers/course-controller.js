const knex = require("./../db");

// Get the list of courses taught by the teacher logged-in
exports.getCourses = async (req, res) => {
  const userId = req.user && req.user.id;
  knex
    .select("id", "name", "main_prof", "year", "semester")
    .from("course")
    .where("main_prof", userId)
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.json({
        message: `There was an error retrieving the courses list: ${err}`,
      });
    });
};

const knex = require("./../db");

// Get the semester and the start and end date
exports.getSemester = async (req, res) => {
  knex
    .select("sid", "name", "start", "end", "inserted_lecture")
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

/*
exports.setSemester = async (req, res) => {
    const name = req.body.name;
    const start = req.body.start;
    const end = req.body.end;
    knex("semester")
    .insert({
        name: name,
        start: start,
        end: end,
        inserted_lecture: 0
    })
      .then(() => {
        res.json({ message: `Semester ${name} from ${start} to ${end} inserted.` });
      })
      .catch((err) => {
        res.json({
          message: `There was an error retrieving the semester ${err}`,
        });
      });
  };*/

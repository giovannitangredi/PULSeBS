// Import path module
const path = require("path");

const environment = process.env.NODE_ENV || "development";
const dbPath = path.resolve(
  __dirname,
  environment === "testing" ? "db/testing.sqlite" : "db/database.sqlite"
);

// Create connection to SQLite database
const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
});

const initTable = (name, attribute_declaration_cb) => {
  knex.schema
    // Make sure the table doesn't exists
    // before trying to create a new one
    .hasTable(name)
    .then((exists) => {
      if (!exists) {
        return knex.schema
          .createTable(name, attribute_declaration_cb)
          .then(() => {
            // Log success message
            console.log(`Table '${name}' created`);
          })
          .catch((error) => {
            console.error(`There was an error creating table: ${error}`);
          });
      }
    })
    .then(() => {
      // Log success message
      console.log("done");
    })
    .catch((error) => {
      console.error(`There was an error setting up the database: ${error}`);
    });
};

initTable("user", (table) => {
  table.increments("id").primary();

  table.string("name").notNullable();

  table.string("surname").notNullable();

  table.string("password_hash").notNullable();

  table.string("email").notNullable();

  table.string("role").notNullable();
});

initTable("course", (table) => {
  table.increments("id").primary();

  table.string("name").notNullable();

  table.integer("main_prof").unsigned().notNullable();
  table.foreign("main_prof").references("user.id");
});

initTable("lecture", (table) => {
  table.increments("id").primary();

  table.string("name").notNullable();

  table.integer("course").unsigned().notNullable();
  table.foreign("course").references("course.id");

  table.integer("lecturer").unsigned().notNullable();
  table.foreign("lecturer").references("user.id");

  table.dateTime("start").notNullable();
  table.dateTime("end").notNullable();

  table.integer("capacity").unsigned().notNullable();
});

initTable("lecture_booking", (table) => {
  table.integer("lecture_id").notNullable();
  table.foreign("lecture_id").references("lecture.id");

  table.integer("student_id").notNullable();
  table.foreign("student_id").references("user.id");

  table.datetime("booked_at").notNullable();
});

initTable("course_available_student", (table) => {
  table.integer("course_id").notNullable();
  table.foreign("course_id").references("course.id");

  table.integer("student_id").notNullable();
  table.foreign("student_id").references("user.id");
});

initTable("stats_time", (table) => {
  table.increments("tid").primary();

  table.date("date").notNullable();
  table.string("week").notNullable();
  table.string("month").notNullable();
  table.integer("year").notNullable();
});

initTable("stats_lecture", (table) => {
  table.increments("lid").primary();

  table.string("lecture_id").notNullable();
  table.string("lecture_name").notNullable();

  table.integer("course_id").notNullable();
  table.string("course_name").notNullable();
});

initTable("stats_fact", (table) => {
  table.integer("tid").notNullable();
  table.foreign("tid").references("stats_time.tid");

  table.integer("lid").notNullable();
  table.foreign("lid").references("stats_lecture.lid");
  
  table.integer("booking").notNullable();
  table.integer("cancellations").notNullable();
  table.integer("attendance").notNullable();
});

initTable("_Variables", (table) => {
  table.string("name").primary();

  table.integer("int_value");
  table.date("date_value");
  table.string("string_value");
});
// Export the database
module.exports = knex;

const app = require("../server/server.js");
const knex = require("../server/db");
var request = require("supertest");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const moment = require("moment");

const officerCredentials = {
  email: "s274930@studenti.polito.it",
  password: "password",
};

const userCredentials = {
  email: "s900000@students.politu.it",
  password: "password",
};

const userTuple = {
  id: "1",
  name: "Ambra",
  surname: "Ferri",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "s900000@students.politu.it",
  role: "student",
  city: "Poggio Ferro",
  birthday: "1996-11-04",
  ssn: "MK97060783",
};

const teacherTuple = {
  id: "2",
  name: "John",
  surname: "Doe",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "john.doe@polito.it",
  role: "teacher",
  city: "Milano",
  birthday: "1971-11-04",
  ssn: "MR17121943",
};

const teacherCredentials = {
  email: teacherTuple.email,
  password: "password",
};

const officerTuple = {
  id: "3",
  name: "Enrico",
  surname: "Carraro",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "e_carra@qwerty.it",
  role: "supportOfficer",
  city: "Torino",
  birthday: "1991-11-04",
  ssn: "152",
};

const courseTuple = {
  id: "1",
  name: "Software Engineering II",
  main_prof: teacherTuple.id,
  year: 1,
  semester: 1,
};

const lectureTuple = {
  id: "1",
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment()
    .subtract(1, "days")
    .subtract(1, "hours")
    .format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 125,
  status: "presence",
  room: 1,
};

const semesterTuple = {
  sid: 5,
  name: "s1",
  start: "2020-09-28",
  end: "2021-01-16",
  inserted_lectures: 1,
};

describe("Semester test", async function () {
  const authenticatedUser = request.agent(app);
  this.timeout(100000);
  before(async () => {
    await knex("user").del();
    await knex("semester").del();
    await knex("lecture").del();
    await knex("user").insert(userTuple);
    await knex("user").insert(teacherTuple);
    await knex("user").insert(officerTuple);
    await knex("semester").insert(semesterTuple);
    await knex("lecture").insert(lectureTuple);
  });

  describe("Get Semester Details ", async () => {
    //now let's login the user before we run any tests
    const authenticatedUser = request.agent(app);
    before(async () => {
      await knex("user").del();
      await knex("semester").del();
      await knex("lecture").del();
      await knex("user").insert(userTuple);
      await knex("user").insert(teacherTuple);
      await knex("user").insert(officerTuple);
      await knex("semester").insert(semesterTuple);
      await knex("lecture").insert(lectureTuple);

      const res = await authenticatedUser
        .post("/api/auth/login")
        .send(userCredentials);

      expect(res.status).to.equal(200);
    });

    it("should return  with status 200", async () => {
      const res = await authenticatedUser.get(`/api/semesters`);
      expect(res).to.be.json;
      expect(res.status).to.equal(200);
    });

    it("should return the body ", async () => {
      const res = await authenticatedUser.get(`/api/semesters/`);

      expect(res.body).to.have.deep.members([
        {
          sid: semesterTuple.sid,
          name: semesterTuple.name,
          start: semesterTuple.start,
          end: semesterTuple.end,
          inserted_lectures: semesterTuple.inserted_lectures,
        },
      ]);
    });

    after(async () => {
      await knex("user").del();
      await knex("semester").del();
      await knex("lecture").del();
    });
  });
});

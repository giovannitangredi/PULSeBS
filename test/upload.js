const app = require("../server/server.js");
const knex = require("../server/db");
var request = require("supertest");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const moment = require("moment");
const fs = require("fs");
const csv = require("fast-csv");

const officerCredentials = {
  email: "s274930@studenti.polito.it",
  password: "password",
};

const userTuple = {
  id: "900000",
  name: "Ambra",
  surname: "Ferri",
  password_hash: "$2b$04$LGtH.Xsd9ty9Hu87fPK4XOwsE24.XvG7QiZi57XNMIrlYkfFurMke",
  city: "Poggio Ferro",
  email: "s900000@students.polito.it",
  birthday: "1991-11-04",
  ssn: "MK97060783",
  role: "student",
};

const teacherTuple = {
  id: "d9000",
  name: "Ines",
  surname: "Beneventi",
  password_hash: "$2b$04$e37G6CPKt2ltsEhAdbYj6eurpz.7TUfWyhkdn3ZKst16k2ElYnWmS",
  email: "Ines.Beneventi@politu.it",
  role: "teacher",
  ssn: "XT6141393",
};

const officerTuple = {
  id: "3",
  name: "Enrico",
  surname: "Carraro",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "s274930@studenti.polito.it",
  role: "supportOfficer",
  city: "Torino",
  birthday: "1991-11-04",
  ssn: "152",
};

const courseTuple = {
  id: "XY1211",
  name: "Metodi di finanziamento delle imprese",
  main_prof: teacherTuple.id,
  year: 1,
  semester: 1,
};

const enrollementTuple = {
  course_id: "XY1211",
  student_id: "900000",
};

const semesterTuple = {
  sid: 1,
  name: "s1",
  start: "2020-09-28",
  end: "2021-01-16",
  inserted_lectures: 0,
};

describe("Story 12 test - As a support officer I want to upload the list of students, courses, teachers, lectures, and classes to setup the system", async function () {
  const authenticatedUser = request.agent(app);

  before(async () => {
    await knex("user").del();
    await knex("course").del();
    await knex("course_available_student").del();
    await knex("lecture").del();  
    
    await knex("user").insert(officerTuple); 
    const res = await authenticatedUser
    .post("/api/auth/login")
    .send(officerCredentials);
    expect(res.status).to.equal(200);
  });

  //Upload student
  describe("Upload student ", async () => {
    //now let's login the user before we run any tests
    before(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();

    });

    it("should return  with status 200 and body", async () => {
      const res = await authenticatedUser
        .post(`/api/upload/students`)
        .attach(
          "file",
          fs.readFileSync("./test/csvfiles/Students.csv"),
          "Students.csv"
        );

      expect(res.status).to.equal(200);

      const uploadedstudent = await knex
        .select("id", "name", "surname", "email", "city", "birthday", "ssn")
        .from("user")
        .where("role", "student");
      expect(uploadedstudent).to.have.deep.members([
        {
          id: userTuple.id,
          name: userTuple.name,
          surname: userTuple.surname,
          city: userTuple.city,
          email: userTuple.email,
          birthday: userTuple.birthday,
          ssn: userTuple.ssn,
        },
      ]);
    });
    after(async () => {
      await knex("user").del().where("id", ">","1");
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("course").del();
      await knex("_Variables").del();
    });
  });

  //Upload Professor
  describe("Upload Professor ", async () => {
    before(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
    });

    it("should return  with status 200", async () => {
      const res = await authenticatedUser
        .post(`/api/upload/teachers`)
        .attach(
          "file",
          fs.readFileSync("./test/csvfiles/Profressors.csv"),
          "Profressors.csv"
        );

      expect(res.status).to.equal(200);

      const uploadedteacher = await knex
        .select("id", "name", "surname", "email", "ssn")
        .from("user")
        .where("role", "teacher");
      expect(uploadedteacher).to.have.deep.members([
        {
          id: teacherTuple.id,
          name: teacherTuple.name,
          surname: teacherTuple.surname,
          email: teacherTuple.email,
          ssn: teacherTuple.ssn,
        },
      ]);
    });
    after(async () => {
      await knex("user").del().where("id", ">","1");
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("course").del();
      await knex("_Variables").del();
    });
  });

  // Upload courses
 describe("Upload Courses ", async () => {
    before(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
    });

    it("should return  with status 200", async () => {
      const res = await authenticatedUser
        .post(`/api/upload/courses`)
        .attach(
          "file",
          fs.readFileSync("./test/csvfiles/Courses.csv"),
          "Courses.csv"
        );

      expect(res.status).to.equal(200);

      const uploadedcourses = await knex
        .select("id", "year", "semester", "name", "main_prof")
        .from("course");
      expect(uploadedcourses).to.have.deep.members([courseTuple]);
    });
    after(async () => {
      await knex("user").del().where("id", ">","1");
      await knex("lecture").del();
      await knex("course").del();
      await knex("course_available_student").del();
      await knex("_Variables").del();
    });
  });

  //Upload enrollements
    describe("Upload Enrollements ", async () => {
    before(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("user").insert(userTuple);
      await knex("course").insert(courseTuple);
    });

    it("should return  with status 200", async () => {
      const res = await authenticatedUser
        .post(`/api/upload/enrollments`)
        .attach(
          "file",
          fs.readFileSync("./test/csvfiles/Enrollement.csv"),
          "Enrollement.csv"
        );

      expect(res.status).to.equal(200);

      const uploadedenrollements = await knex
        .select("course_id", "student_id")
        .from("course_available_student");
      expect(uploadedenrollements).to.have.deep.members([enrollementTuple]);
    });
    after(async () => {
      await knex("user").del().where("id", ">","1");
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("course").del();
      await knex("_Variables").del();
    });
  });

  // Upload Schedule
  describe("Upload Schedule", async () => {
    before(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("semester").del();
      await knex("user").insert(userTuple);
      await knex("user").insert(teacherTuple);
      await knex("course").insert(courseTuple);
      await knex("semester").insert(semesterTuple);
      await knex("course_available_student").insert(enrollementTuple);
    });

    it("should return  with status 200", async () => {
      const res = await authenticatedUser
        .post(`/api/upload/schedule/${semesterTuple.sid}`)
        .attach(
          "file",
          fs.readFileSync("./test/csvfiles/Schedule.csv"),
          "Schedule.csv"
        );
      expect(res.status).to.equal(200);

      const uploadedschedule = await knex
        .select(
          "course",
          "lecturer",
          "start",
          "end",
          "room",
          "capacity",
          "status"
        )
        .from("lecture");
      expect(uploadedschedule.length).to.equal(16);
    });
    after(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("semester").del();
      await knex("_Variables").del();
    });
  });
});

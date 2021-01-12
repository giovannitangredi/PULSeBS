const app = require("../server/server.js");
const knex = require("../server/db");
var request = require("supertest");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const moment = require("moment");

const managerCredentials = {
  email: "mario.castello@polito.it",
  password: "password",
};

const Student1Tuple = {
  // in the lecture with the student corona +
  id: "1",
  name: "Ambra",
  surname: "Ferri",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "Ambra.Ferri@students.politu.it",
  role: "student",
  city: "Torino",
  birthday: "1996-11-04",
  ssn: "MK97060783",
};

const Student2Tuple = {
  id: "2",
  name: "Tom",
  surname: "Huang",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "1297320697@qq.com",
  role: "student",
  city: "Turin",
  birthday: "1991-11-04",
  ssn: "MK76345533",
};
const Student3Tuple = {
  // in the lecture with the student corona +
  id: "3",
  name: "Gianfranco",
  surname: "Trentini",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "Gianfranco.Trentini@students.politu.it",
  role: "student",
  city: "Torino",
  birthday: "1996-11-04",
  ssn: "MK77009783",
};
const StudentCoronaPlusTuple = {
  // Corona test +
  id: "4",
  name: "Maria",
  surname: "Pugliesi",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "Maria.Pugliesi@students.politu.it",
  role: "student",
  city: "Turin",
  birthday: "1991-11-04",
  ssn: "MK66334533",
};

const teacherTuple = {
  id: "5",
  name: "John",
  surname: "Doe",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "john.doe@polito.it",
  role: "teacher",
  city: "Milano",
  birthday: "1971-11-04",
  ssn: "MK97060783",
};

const managerTuple = {
  id: "6",
  name: "Mario",
  surname: "Castello",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "mario.castello@polito.it",
  role: "manager",
  city: "Napoli",
  birthday: "1961-11-04",
  ssn: "UQ88181741",
};

const courseTuple = {
  id: 1,
  name: "Software Engineering II",
  main_prof: teacherTuple.id,
  year: 1,
  semester: 1,
};

const courseStudent1Tuple = {
  course_id: courseTuple.id,
  student_id: Student1Tuple.id,
};

const courseStudent2Tuple = {
  course_id: courseTuple.id,
  student_id: Student2Tuple.id,
};
const courseStudent3Tuple = {
  course_id: courseTuple.id,
  student_id: Student3Tuple.id,
};

const courseCoronaPlusStudentTuple = {
  course_id: courseTuple.id,
  student_id: StudentCoronaPlusTuple.id,
};

const lectureTuple = {
  // lecture with infected student
  id: 1,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment()
    .subtract(3, "days")
    .subtract(3, "hours")
    .format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(3, "days").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
};

const lecture2Tuple = {
  id: 2,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment()
    .subtract(2, "days")
    .subtract(2, "hours")
    .format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
};

const lectureCoronaBooking1Tuple = {
  // booking first student in lecture with +
  lecture_id: lectureTuple.id,
  student_id: Student1Tuple.id,
  status: "present",
  booked_at: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm:ss"),
};

const lectureCoronaBooking2Tuple = {
  // booking student with corona
  lecture_id: lectureTuple.id,
  student_id: StudentCoronaPlusTuple.id,
  status: "present",
  booked_at: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm:ss"),
};

const lectureCoronaBooking3Tuple = {
  // booking second student in lecture with +
  lecture_id: lectureTuple.id,
  student_id: Student3Tuple.id,
  status: "present",
  booked_at: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm:ss"),
};

const lectureBookingTuple = {
  // booking student in lecture without corona positive
  lecture_id: lecture2Tuple.id,
  student_id: Student2Tuple.id,
  status: "present",
  booked_at: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm:ss"),
};

describe("Tracing test", async function () {
  const authenticatedUser = request.agent(app);
  this.timeout(100000);
  before(async () => {
    await knex("user").del();
    await knex("course").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course_available_student").del();
    await knex("user").insert(Student1Tuple);
    await knex("user").insert(Student2Tuple);
    await knex("user").insert(Student3Tuple);
    await knex("user").insert(StudentCoronaPlusTuple);
    await knex("user").insert(teacherTuple);
    await knex("user").insert(managerTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple); // infected lecture
    await knex("lecture").insert(lecture2Tuple); // not infected lecture
    await knex("course_available_student").insert(courseStudent1Tuple);
    await knex("course_available_student").insert(courseStudent2Tuple);
    await knex("course_available_student").insert(courseStudent3Tuple);
    await knex("course_available_student").insert(courseCoronaPlusStudentTuple);
  });

  describe("preparing records to generate a contact tracing report starting with a positive student so that we comply with safety regulations", async () => {
    before(async () => {
      const res = await authenticatedUser
        .post("/api/auth/login")
        .send(managerCredentials)
        .expect(200);
      await knex("stats_lecture").del();
      await knex("stats_time").del();
      await knex("stats_usage").del();

      await knex("lecture_booking").insert(lectureBookingTuple); // - different lecture without student with corona plus
      await knex("lecture_booking").insert(lectureCoronaBooking1Tuple); // + another not tested student in the same lecture with corona plus
      await knex("lecture_booking").insert(lectureCoronaBooking2Tuple); // + student with corona plus is in this lecture
      await knex("lecture_booking").insert(lectureCoronaBooking3Tuple); // + another student in the lecture with corona plus

      expect(res.status).to.equal(200);
    });

    it("Should return a student by the given SSN", async () => {
      const res = await authenticatedUser
        .get(`/api/tracing/${Student1Tuple.ssn}/search`)
        .expect(200);
      expect(res.body.length).to.equal(1);
      expect(res.body[0].id).to.equal(Student1Tuple.id);
    });

    it("Should return List of students and teacher that had contact with the positive student with id = studentId", async () => {
      const res = await authenticatedUser
        .get(`/api/tracing/${StudentCoronaPlusTuple.id}/report`)
        .expect(200);
      console.log(res.body[1].id);
      // list of teacher and students in the lecture with student positive corona
      expect(res.body.length).to.equal(3);
      // get the teacher in the lecture with student positive corona
      expect(res.body[0].id).to.equal(teacherTuple.id);
      // get the student in the lecture with student positive corona
      expect(res.body[1].id).to.equal(Student1Tuple.id);
      // get the student in the lecture with student positive corona
      expect(res.body[2].id).to.equal(Student3Tuple.id);
    });
    after(async () => {
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("lecture_booking").del();
      await knex("stats_lecture").del();
      await knex("stats_time").del();
      await knex("stats_usage").del();
      await knex("user").del();
    });
  });
});

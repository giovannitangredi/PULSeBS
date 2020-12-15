const app = require("../server/server.js");
const knex = require("../server/db");
var request = require("supertest");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const moment = require("moment");
const emailController = require("../server/controllers/email-controller");

const testEmailAddress = "test.pulsebs.softeng@gmail.com";
const testEmailPassword = "JRLeumcuc5N8K3S";
const imap = {
  user: testEmailAddress,
  password: testEmailPassword,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  authTimeout: 3000,
};

const studentTuple1 = {
  id: 1,
  name: "Enrico",
  surname: "Carraro",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: testEmailAddress,
  role: "student",
};

const studentTuple2 = {
  id: 3,
  name: "Name",
  surname: "Surname",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "student2@studenti.polito.it",
  role: "student",
};

const teacherTuple = {
  id: 2,
  name: "John",
  surname: "Doe",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "john.doe@polito.it",
  role: "teacher",
};

//the data we need to pass to the login method
const student1Credentials = {
  email: testEmailAddress,
  password: "password",
};

//the data we need to pass to the login method
const student2Credentials = {
  email: studentTuple2.email,
  password: "password",
};

const teacherCredentials = {
  email: teacherTuple.email,
  password: "password",
};

const courseTuple = {
  id: 1,
  name: "Software Engineering II",
  main_prof: teacherTuple.id,
};

const lectureTuple = {
  id: 1,
  name: "Lecture 1",
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment().add(2, "hours").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().add(3, "hours").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
};

const lowCapacityLectureTuple = {
  id: 2,
  name: "Lecture 1",
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment().add(2, "hours").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().add(3, "hours").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 1,
  status: "presence",
  //room: 1,
};

const futureLectureTuple = {
  id: 1,
  name: "Lecture 1",
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment().add(2, "days").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().add(2, "days").add(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
};

const limitedCapacityLectureTuple = {
  id: 2,
  name: "Exclusive Lecture",
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment().add(5, "hours").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().add(8, "hours").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 1,
  status: "presence",
};

const courseStudent1Tuple = {
  course_id: courseTuple.id,
  student_id: studentTuple1.id,
};

const courseStudent2Tuple = {
  course_id: courseTuple.id,
  student_id: studentTuple2.id,
};

const lectureBookingTuple = {
  lecture_id: lectureTuple.id,
  student_id: studentTuple1.id,
  booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
};

const limitedCapacityLectureBookingTuple = {
  lecture_id: limitedCapacityLectureTuple.id,
  student_id: studentTuple2.id,
  booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
};

const lowCapacityLectureBookingTuple = {
  lecture_id: lowCapacityLectureTuple.id,
  student_id: studentTuple2.id,
  booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
};

const expectedPreviousBooking = [
  {
    id: lectureTuple.id,
    name: lectureTuple.name,
    course: courseTuple.name,
    lecturer_name: teacherTuple.name,
    lecturer_surname: teacherTuple.surname,
    start: lectureTuple.start,
    end: lectureTuple.end,
    capacity: lectureTuple.capacity,
    booked_at: lectureBookingTuple.booked_at,
    status: lectureTuple.status,
  },
];

const expectedBookableLectures = [
  {
    id: futureLectureTuple.id,
    name: futureLectureTuple.name,
    course: courseTuple.name,
    lecturer_name: teacherTuple.name,
    lecturer_surname: teacherTuple.surname,
    start: futureLectureTuple.start,
    end: futureLectureTuple.end,
    capacity: futureLectureTuple.capacity,
    booked_students: 0,
    candidate: false,
    status: futureLectureTuple.status,
  },
];

describe("Lecture test", async function () {
  const authenticatedUser = request.agent(app);
  const authenticatedUser2 = request.agent(app);
  this.timeout(15000);
  before(async () => {
    await knex("user").del();
    await knex("course").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("waiting_list").del();
    await knex("course_available_student").del();
    await knex("user").insert(studentTuple1);
    await knex("user").insert(studentTuple2);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    await knex("lecture").insert(limitedCapacityLectureTuple);
    await knex("course_available_student").insert(courseStudent1Tuple);
    await knex("course_available_student").insert(courseStudent2Tuple);
  });

  describe("reservation test", async () => {
    let newEmailPromise;

    before(async () => {
      await authenticatedUser
        .post("/api/auth/login")
        .send(student1Credentials)
        .expect(200);

      await emailController.deleteEmails(imap);
      newEmailPromise = emailController.waitForNewEmail(imap);
    });

    it("book a seat: should return a 200 response", async () => {
      await authenticatedUser
        .post(`/api/lectures/${lectureTuple.id}/book`)
        .expect(200, { message: "Booking created." });
    });

    it("should receive an email", async () => {
      const email = await newEmailPromise;
      expect(email.body).to.match(/You have successfully booked a seat/);
    });
  });

  describe("Waiting list insertion", async () => {
    beforeEach(async () => {
      await knex("lecture_booking").insert(limitedCapacityLectureBookingTuple);
      await knex("waiting_list").insert({
        lecture_id: limitedCapacityLectureTuple.id,
        student_id: studentTuple1.id,
        booked_at: moment().format("YYYY-MM-DD hh:mm:ss"),
      });
      await authenticatedUser
        .post("/api/auth/login")
        .send(student2Credentials)
        .expect(200);
    });

    it("student cancels their booking when the waiting list is not empty: should return 200 and book the lecture for the first student on the waiting list.", async () => {
      await authenticatedUser
        .delete(`/api/lectures/${limitedCapacityLectureTuple.id}/cancelbook`)
        .expect(200, { message: "Booking canceled." });
      expect(
        (
          await knex("waiting_list").where({
            lecture_id: limitedCapacityLectureTuple.id,
            student_id: studentTuple1.id,
          })
        ).length
      ).to.equal(0);
      expect(
        (
          await knex("lecture_booking").where({
            lecture_id: limitedCapacityLectureTuple.id,
            student_id: studentTuple1.id,
          })
        ).length
      ).to.equal(1);
    });

    afterEach(async () => {
      await knex("lecture_booking").del();
      await knex("waiting_list").del();
    });
  });

  describe("Pop first item of waiting list to lecture bookings", async () => {
    beforeEach(async () => {
      await knex("lecture_booking").insert(limitedCapacityLectureBookingTuple);
      await authenticatedUser
        .post("/api/auth/login")
        .send(student1Credentials)
        .expect(200);
    });

    it("should return 200 and message about the waiting list the first a students books a lecture with no more seats, a 400 error the following times.", async () => {
      await authenticatedUser
        .post(`/api/lectures/${limitedCapacityLectureTuple.id}/book`)
        .expect(200, { message: "You've been added to the waiting list." });

      await authenticatedUser
        .post(`/api/lectures/${limitedCapacityLectureTuple.id}/book`)
        .expect(400);
    });
    afterEach(async () => {
      await knex("lecture_booking").del();
      await knex("waiting_list").del();
    });
  });

  describe("teacher email test", async () => {
    let newEmailPromise;

    before(async () => {
      // use the gmail test address also for the teacher so that we can check the email is received
      await knex("user")
        .where("id", teacherTuple.id)
        .update("email", testEmailAddress);
      await knex("lecture_booking").del();
      await knex("lecture_booking").insert(lectureBookingTuple);

      await emailController.deleteEmails(imap);
      newEmailPromise = emailController.waitForNewEmail(imap);
    });

    it("should receive an email with the number of the students booked", async () => {
      const now = moment().add(2, "seconds");
      await emailController.startScheduler(
        `${now.second()} ${now.minute()} * * * *`
      );

      const email = await newEmailPromise;
      expect(email.body).to.match(/1 students booked a seat/);
    });
  });
});

// Get all avaliable booking
describe("GET /api/lectures/bookable", async function () {
  //now let's login the user before we run any tests
  this.timeout(5000);
  const authenticatedUser = request.agent(app);
  beforeEach(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
    await knex("course_available_student").del();
    await knex("user").insert(studentTuple1);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(futureLectureTuple);

    await knex("course_available_student").insert(courseStudent1Tuple);
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(student1Credentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get("/api/lectures/bookable");
    expect(res.status).to.equal(200);
  });
  it("should return one lecture that the student can book", async () => {
    const res = await authenticatedUser.get("/api/lectures/bookable");
    expect(res.body.length).to.equal(1);
    expect(res.body).to.have.deep.members(expectedBookableLectures);
  });
  afterEach(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
    await knex("course_available_student").del();
  });
});

// Get the existent Booking
describe("GET /api/lectures/previousbooking", async () => {
  //now let's login the user before we run any tests
  const authenticatedUser = request.agent(app);
  before(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
    await knex("user").insert(studentTuple1);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    await knex("lecture_booking").insert(lectureBookingTuple);

    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(student1Credentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get("/api/lectures/previousbooking");
    expect(res.status).to.equal(200);
  });
  it("should return one previous booked lecture", async () => {
    const res = await authenticatedUser.get("/api/lectures/previousbooking");
    expect(res.body.length).to.equal(1);
    expect(res.body).to.have.deep.members(expectedPreviousBooking);
  });
  after(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});

// Get the list of students booked for a lecture
describe("List of students booked for a lecture", async () => {
  //now let's login the user before we run any tests
  const authenticatedUser = request.agent(app);
  before(async () => {
    await knex("user").del();
    await knex("lecture_booking").del();
    await knex("user").insert(studentTuple1);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    await knex("lecture_booking").insert(lectureBookingTuple);
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(student1Credentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get(
      `/api/lectures/${lectureBookingTuple.lecture_id}/students`
    );
    expect(res.status).to.equal(200);
  });
  it("should return one student booked", async () => {
    const res = await authenticatedUser.get(
      `/api/lectures/${lectureBookingTuple.lecture_id}/students`
    );
    expect(res.body.length).to.equal(1);
    expect(res.body).to.have.deep.members([
      {
        id: studentTuple1.id,
        name: studentTuple1.name,
        surname: studentTuple1.surname,
        email: testEmailAddress,
      },
    ]);
  });
  after(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});

// Get the list of lectures scheduled for a course
describe("list of lectures scheduled for a course", async () => {
  //now let's login the user before we run any tests
  const authenticatedUser = request.agent(app);
  before(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("user").insert(studentTuple1);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(student1Credentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get(
      `/api/courses/${lectureTuple.course}/lectures`
    );
    expect(res.status).to.equal(200);
  });
  it("should return one student booked", async () => {
    const res = await authenticatedUser.get(
      `/api/courses/${lectureTuple.course}/lectures`
    );
    expect(res.body.length).to.equal(1);
    expect(res.body).to.have.deep.members([
      {
        id: lectureTuple.id,
        name: lectureTuple.name,
        course: lectureTuple.course,
        lecturer_id: teacherTuple.id,
        lecturer_name: teacherTuple.name,
        lecturer_surname: teacherTuple.surname,
        start: lectureTuple.start,
        end: lectureTuple.end,
        capacity: lectureTuple.capacity,
        status: lectureTuple.status,
      },
    ]);
  });
  after(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});

//Teacher cancel a lecture 1h before
describe("Teacher cancel a lecture 1 hour before  ", async function () {
  const authenticatedUser = request.agent(app);
  this.timeout(15000);
  let newEmailPromise;
  before(async () => {
    await knex("user").del();
    await knex("course").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course_available_student").del();
    await knex("user").insert(studentTuple1);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(futureLectureTuple);
    await knex("course_available_student").insert(courseStudent1Tuple);
    await knex("lecture_booking").insert(lectureBookingTuple);

    await authenticatedUser
      .post("/api/auth/login")
      .send(teacherCredentials)
      .expect(200);

    await emailController.deleteEmails(imap);
    newEmailPromise = emailController.waitForNewEmail(imap);
  });

  it("should return  with status 202", async () => {
    const res = await authenticatedUser.delete(
      `/api/lectures/${futureLectureTuple.id}`
    );
    expect(res.status).to.equal(202);
  });
  it("should return  with one of the message and not status 400 ", async () => {
    const res = await authenticatedUser.delete(
      `/api/lectures/${futureLectureTuple.id}`
    );
    expect(res.body.message).to.not.be.null;
  });
  it("student booked should receive an email", async () => {
    const email = await newEmailPromise;
    expect(email.subject).to.match(/Lecture cancel information/);
    expect(email.body).to.match(/is canceled by the teacher/);
  });
  after(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});

//Cancel a lecture booked by a student
describe("Cancel a booked lecture ", async function () {
  //now let's login the user before we run any tests
  this.timeout(5000);
  const authenticatedUser = request.agent(app);
  before(async () => {
    await knex("user").del();
    await knex("lecture_booking").del();
    await knex("course").del();
    await knex("lecture").del();
    await knex("user").insert(studentTuple1);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("course_available_student").insert(courseStudent1Tuple);
    await knex("lecture").insert(lectureTuple);
    await knex("lecture_booking").insert(lectureBookingTuple);
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(student1Credentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.delete(
      `/api/lectures/${lectureBookingTuple.lecture_id}/cancelbook`
    );
    expect(res).to.be.json;
    expect(res.status).to.equal(200);
  });
  it("should return message ", async () => {
    const res = await authenticatedUser.delete(
      `/api/lectures/${lectureBookingTuple.lecture_id}/cancelbook`
    );
    expect(res).to.have.property("body");
    expect(res.body.message).to.equal(`Booking canceled.`);
  });
  after(async () => {
    await knex("user").del();
    await knex("course").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course_available_student").del();
  });
});

// Turn a presence lecture into distance one
describe("Presence Lecture into distance one ", async function () {
  this.timeout(5000);
  //now let's login the user before we run any tests
  const authenticatedUser = request.agent(app);
  const authenticatedStudent = request.agent(app);
  before(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("course").del();
    await knex("lecture_booking").del();
    await knex("user").insert(studentTuple1);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    await knex("lecture_booking").insert(lectureBookingTuple);
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(teacherCredentials);
    const resStudent = await authenticatedStudent
      .post("/api/auth/login")
      .send(student1Credentials);
    expect(res.status).to.equal(200);
  });
  it("should return status 204", async () => {
    const res = await authenticatedUser
      .put(`/api/lectures/${lectureTuple.id}/convert`)
      .send();
    expect(res.status).to.equal(204);

    const lectureChanged = await knex
      .select("id", "status")
      .from("lecture")
      .where("id", lectureTuple.id);
    expect(lectureChanged).to.have.deep.members([
      { id: lectureTuple.id, status: "distance" },
    ]);
    expect(res.body.message).to.not.be.null;
  });

  it("should return status 401 ", async () => {
    const resStudent = await authenticatedStudent
      .put(`/api/lectures/${lectureTuple.id}/convert`)
      .send();
    expect(resStudent.status).to.equal(401);
  });

  after(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});

describe("Test story 15: As a student I want to get notified when I am taken from the waiting list so that I can attend the lecture", async function () {
  const authenticatedUser = request.agent(app);
  this.timeout(15000);
  before(async () => {
    await knex("user").del();
    await knex("course").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course_available_student").del();
    await knex("waiting_list").del();
    await knex("user").insert(studentTuple1);
    await knex("user").insert(studentTuple2);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lowCapacityLectureTuple);
    await knex("course_available_student").insert(courseStudent1Tuple);
    await knex("course_available_student").insert(courseStudent2Tuple);
    await knex("lecture_booking").insert(lowCapacityLectureBookingTuple); // user 3 booked
  });

  describe("Student 1 should receive an email when he is taken from the waiting list", async () => {
    let newEmailPromise;

    before(async () => {
      await emailController.deleteEmails(imap);
      newEmailPromise = emailController.waitForNewEmail(imap);
    });

    it("Student 1 requests to be added in waiting list: should return a 200 response", async () => {
      await authenticatedUser
        .post("/api/auth/login")
        .send(student1Credentials)
        .expect(200);

      const res = await authenticatedUser
        .post(`/api/lectures/${lowCapacityLectureTuple.id}/book`)
        .expect(200, { message: "You've been added to the waiting list." });
    });

    it("Student 2 cancels the booking: should return a 200 response", async () => {
      await authenticatedUser
        .post("/api/auth/login")
        .send(student2Credentials)
        .expect(200);

      await authenticatedUser
        .delete(`/api/lectures/${lowCapacityLectureTuple.id}/cancelbook`)
        .expect(200);
    });

    it("Student 1 should receive an email", async () => {
      const email = await newEmailPromise;
      expect(email.subject).to.match(
        /You are moved from candidate list to Reserved List/
      );
      expect(email.body).to.match(/has changed from candidate to reserve/);
    });
  });
});

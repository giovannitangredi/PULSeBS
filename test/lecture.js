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
  id: "1",
  name: "Enrico",
  surname: "Carraro",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: testEmailAddress,
  role: "student",
  city: "Poggio Ferro",
  birthday: "1996-11-04",
  ssn: "MK97060783",
};

const studentTuple2 = {
  id: "3",
  name: "Name",
  surname: "Surname",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "student2@studenti.polito.it",
  role: "student",
  ssn: "MK98060783",
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
  id: "1",
  name: "Software Engineering II",
  main_prof: teacherTuple.id,
  year: 1,
  semester: 1,
};

const lectureTuple = {
  id: 1,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment().add(2, "hours").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().add(3, "hours").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
};

const oldLectureTuple = {
  id: 4,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment().subtract(2, "hours").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
};


const futureLectureTuple = {
  id: 3,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment().add(2, "days").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().add(2, "days").add(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
};

const limitedCapacityLectureTuple = {
  id: 2,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment().add(5, "hours").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().add(8, "hours").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 1,
  status: "presence",
  room: 5
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

const lectureBookingTuple2 = {
  lecture_id: lectureTuple.id,
  student_id: studentTuple2.id,
  booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
};
const oldLectureBookingTuple = {
  lecture_id: oldLectureTuple.id,
  student_id: studentTuple1.id,
  booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
};

const oldLectureBookingTuple2 = {
  lecture_id: oldLectureTuple.id,
  student_id: studentTuple2.id,
  booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
};

const futureLectureBookingTuple = {
  lecture_id: futureLectureTuple.id,
  student_id: studentTuple1.id,
  booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
};

const futureLectureBookingTuple2 = {
  lecture_id: futureLectureTuple.id,
  student_id: studentTuple2.id,
  booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
};

const limitedCapacityLectureBookingTuple = {
  lecture_id: limitedCapacityLectureTuple.id,
  student_id: studentTuple2.id,
  booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
};

const expectedPreviousBooking = [
  {
    id: lectureTuple.id,
    course: courseTuple.name,
    lecturer_name: teacherTuple.name,
    lecturer_surname: teacherTuple.surname,
    start: lectureTuple.start,
    end: lectureTuple.end,
    room: lectureTuple.room,
    year: courseTuple.year,
    semester: courseTuple.semester,
    capacity: 25,
    booked_at: lectureBookingTuple.booked_at,
    status: lectureTuple.status,
  },
];

const expectedBookableLectures = [
  {
    id: futureLectureTuple.id,
    course: courseTuple.name,
    lecturer_name: teacherTuple.name,
    lecturer_surname: teacherTuple.surname,
    start: futureLectureTuple.start,
    end: futureLectureTuple.end,
    status: futureLectureTuple.status,
    room: futureLectureTuple.room,
    year: courseTuple.year,
    semester: courseTuple.semester,
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
    let newEmailPromise;

    before(async () => {
      await emailController.deleteEmails(imap);
      newEmailPromise = emailController.waitForNewEmail(imap);
    });

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
        .expect(200, { message: "Booking cancelled." });
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

    it("Student should receive an email to be notified that has been moved from waiting to reservation list", async () => {
      const email = await newEmailPromise;
      expect(email.subject).to.match(
        /You are moved from candidate list to Reserved List/
      );
      expect(email.body).to.match(/has changed from candidate to reserve/);
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
  it("should return the student booked", async () => {
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
        status: null,
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
        course: lectureTuple.course,
        lecturer_id: teacherTuple.id,
        lecturer_name: teacherTuple.name,
        lecturer_surname: teacherTuple.surname,
        start: lectureTuple.start,
        end: lectureTuple.end,
        capacity: lectureTuple.capacity,
        status: lectureTuple.status,
        room: lectureTuple.room,
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
    await knex("lecture_booking").insert(futureLectureBookingTuple);//

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
    expect(email.body).to.match(/was cancelled by the teacher/);
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
  beforeEach(async () => {
    await knex("course_available_student").del();
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
    expect(res.body.message).to.equal(`Booking cancelled.`);
  });
  afterEach(async () => {
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


// Record the attendances of a lecture
describe("Story 18 - As a teacher I want to record the students present at my lecture among those booked so that I can keep track of actual attendance", async function () {
  const authenticatedUser = request.agent(app);
  this.timeout(5000);
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
    await knex("lecture").insert(lectureTuple); //Today lecture (1 hour after now)
    await knex("lecture").insert(oldLectureTuple); //Today lecture (1 hour before now)
    await knex("lecture").insert(futureLectureTuple);
    await knex("course_available_student").insert(courseStudent1Tuple);
    await knex("course_available_student").insert(courseStudent2Tuple);
    await knex("lecture_booking").insert(lectureBookingTuple);
    await knex("lecture_booking").insert(lectureBookingTuple2);
    await knex("lecture_booking").insert(futureLectureBookingTuple);
    await knex("lecture_booking").insert(futureLectureBookingTuple2);
    await knex("lecture_booking").insert(oldLectureBookingTuple);
    await knex("lecture_booking").insert(oldLectureBookingTuple2);
  });
  describe("Record attendences when not logged as a teacher", async () => {
    before(async () => {  //login as a wrong user
      await authenticatedUser
        .post("/api/auth/login")
        .send(student1Credentials)
        .expect(200);
    });
    it("Should return 401 (Unauthorized error)", async () => {
      const res = await authenticatedUser
        .put(`/api/lectures/${lectureTuple.id}/attendances`)
        .send([studentTuple1.id]);
      expect(res.status).to.equal(401);
    });
    it("lecture_booking table should still have status null for the student 1", async () => {
      const res = await knex.select("status").from("lecture_booking")
        .where("student_id", lectureBookingTuple.student_id)
        .andWhere("lecture_id", lectureBookingTuple.lecture_id);
      expect(res).to.have.deep.members([{ status: null }]);
    });
  });

  describe("Test insert attendences", async () => {
    before(async () => {  //login as a teacher
      await authenticatedUser
        .post("/api/auth/login")
        .send(teacherCredentials)
        .expect(200);
    });
    it("Should return 204", async () => {
      const res = await authenticatedUser
        .put(`/api/lectures/${oldLectureTuple.id}/attendances`)
        .send([studentTuple1.id]);
      expect(res.status).to.equal(204);
    });
    it("Should return Student 1 present Student 2 absent", async () => {
      const res = await knex.select("status").from("lecture_booking")
        .andWhere("lecture_id", oldLectureBookingTuple.lecture_id);
      expect(res).to.have.deep.members([{ status: "present" }, { status: "absent" }]);
    });

    it("Should return 400 (today lecture but after now)", async () => {
      const res = await authenticatedUser
        .put(`/api/lectures/${lectureTuple.id}/attendances`)
        .send([studentTuple1.id]);
      expect(res.status).to.equal(400);
    });

    it("Should return 204", async () => {//Try again with the same values
      const res = await authenticatedUser
        .put(`/api/lectures/${lectureTuple.id}/attendances`)
        .send([studentTuple1.id]);
      expect(res.status).to.equal(204);
    });
    it("Should return Student 1 present Student 2 absent", async () => {
      const res = await knex.select("status").from("lecture_booking")
        .andWhere("lecture_id", lectureBookingTuple.lecture_id);
      expect(res).to.have.deep.members([{ status: "present" }, { status: "absent" }]);
    });

    it("Should return 204, Student 1 present Student 2 absent", async () => {//try changing status of previous student absent
      const res = await authenticatedUser
        .put(`/api/lectures/${oldLectureTuple.id}/attendances`)
        .send([studentTuple2.id]);
      expect(res.status).to.equal(204);
    });
    it("Should return all students for the lecture 1 present", async () => {
      const res = await knex.select("status").from("lecture_booking")
        .andWhere("lecture_id", oldLectureBookingTuple.lecture_id);
      expect(res).to.have.deep.members([{ status: "present" }, { status: "present" }]);
    });
    // e se li rimodifico in assenti entrambi?
  });

  describe("Test errors", async () => {
    before(async () => {  //login as a teacher         
      await authenticatedUser
        .post("/api/auth/login")
        .send(teacherCredentials)
        .expect(200);
    });
    it("Should return 422 (Invalid body)", async () => {
      const res = await authenticatedUser
        .put(`/api/lectures/${oldLectureTuple.id}/attendances`)
      expect(res.status).to.equal(422);
    });
    it("Should return 404 (Lecture doesn't exist)", async () => {
      const res = await authenticatedUser
        .put(`/api/lectures/16/attendances`)
        .send([studentTuple1.id]);
      expect(res.status).to.equal(404);
    });
    it("Should return 400 (Wrong body)", async () => {
      const res = await authenticatedUser
        .put(`/api/lectures/${oldLectureTuple.id}/attendances`)
        .send([studentTuple1.name])
      expect(res.status).to.equal(400);
    });
  });
  describe("Test Remote lecture", async () => {
    before(async () => {
      await knex("lecture").update("status", "remote").where("id", oldLectureTuple.id);
    })
    it("Should return 400", async () => {
      const res = await authenticatedUser
        .put(`/api/lectures/${oldLectureTuple.id}/attendances`)
        .send([studentTuple1.id]);
      expect(res.status).to.equal(400);
    });
  })

  describe("Test Wrong day", async () => {
    it("Should return 400 (Wrong day)", async () => {
      const res = await authenticatedUser
        .put(`/api/lectures/${futureLectureTuple.id}/attendances`)
        .send([studentTuple1.id]);
      expect(res.status).to.equal(400);
    });
    it("lecture_booking table should still have status null for the futureLecture", async () => {
      const res = await knex.select("status").from("lecture_booking")
        .where("student_id", futureLectureBookingTuple.student_id)
        .andWhere("lecture_id", futureLectureBookingTuple.lecture_id);
      expect(res).to.have.deep.members([{ status: null }]);
    });
  })

  after(async () => {
    await knex("user").del();
    await knex("course").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("waiting_list").del();
    await knex("course_available_student").del();
  })
});
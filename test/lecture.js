const app = require("../server/server.js");
const knex = require("../server/db");
var request = require("supertest");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const moment = require("moment");
const emailController = require("../server/controllers/email-controller");
const MailSlurp = require("mailslurp-client").default;

const apiKey =
  "ff4ecbf86022042fe17030bc0ff37f0f4a5ff3470d9727218d1945b1862a580c";
const mailSlurpAddress = "8d0dbfbc-f2b7-4e53-a6dc-7dd32ee45e83@mailslurp.com";
const mailslurp = new MailSlurp({ apiKey });

//the data we need to pass to the login method
const userCredentials = {
  email: mailSlurpAddress,
  password: "password",
};

const teacherCredentials = {
  email: "john.doe@polito.it",
  password: "password",
};

const userTuple = {
  id: 1,
  name: "Enrico",
  surname: "Carraro",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: mailSlurpAddress,
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
  start: moment().add(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().add(2, "hours").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence"
};

const futureLectureTuple = {
  id: 1,
  name: "Lecture 1",
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment().add(2, "days").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().add(2, "days").add(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence"
};

const courseStudentTuple = {
  course_id: courseTuple.id,
  student_id: userTuple.id,
};

const lectureBookingTuple = {
  lecture_id: lectureTuple.id,
  student_id: userTuple.id,
  booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
};

const expectedPreviousBooking = [{
  id: lectureTuple.id,
  name: lectureTuple.name,
  course: courseTuple.name,
  lecturer_name: teacherTuple.name,
  lecturer_surname: teacherTuple.surname,
  start: lectureTuple.start,
  end: lectureTuple.end,
  capacity: lectureTuple.capacity,
  booked_at: lectureBookingTuple.booked_at,
  status: lectureTuple.status
}]

const expectedBookableLectures = [{
  id: futureLectureTuple.id,
  name: futureLectureTuple.name,
  course: courseTuple.name,
  lecturer_name: teacherTuple.name,
  lecturer_surname: teacherTuple.surname,
  start: futureLectureTuple.start,
  end: futureLectureTuple.end,
  capacity: futureLectureTuple.capacity,
  booked_students: 0,
  status: futureLectureTuple.status
}]

describe("Lecture test", async function () {
  const authenticatedUser = request.agent(app);
  this.timeout(10000);
  before(async () => {
    await knex("user").del();
    await knex("course").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course_available_student").del();
    await knex("user").insert(userTuple);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    await knex("course_available_student").insert(courseStudentTuple);
  });

  describe("reservation test", async () => {
    let inbox;

    before(async () => {
      const res = await authenticatedUser
        .post("/api/auth/login")
        .send(userCredentials)
        .expect(200);
      inbox = (await mailslurp.getInboxes())[0];
      mailslurp.emptyInbox(inbox.id);
    });

    it("book a seat: should return a 200 response", async () => {
      const res = await authenticatedUser
        .post(`/api/lectures/${lectureTuple.id}/book`)
        .expect(200, { message: "Booking created." });
    });

    it("should receive an email", async () => {
      const email = await mailslurp.waitForLatestEmail(inbox.id);
      expect(email.body).to.match(/You have successfully booked a seat/);
    });
  });

  describe("teacher email test", async () => {
    let inbox;

    before(async () => {
      // use the slurpemail address also for the teacher so that we can check the email is received
      await knex("user")
        .where("id", teacherTuple.id)
        .update("email", mailSlurpAddress);
      await knex("lecture_booking").del();
      await knex("lecture_booking").insert(lectureBookingTuple);

      inbox = (await mailslurp.getInboxes())[0];
      mailslurp.emptyInbox(inbox.id);
    });

    it("should receive an email with the number of the students booked", async () => {
      const now = moment().add(2, "seconds");
      await emailController.startScheduler(
        `${now.second()} ${now.minute()} * * * *`
      );

      const email = await mailslurp.waitForLatestEmail(inbox.id);
      expect(email.body).to.match(/1 students booked a seat/);
    });
  });
});

// Get all avaliable booking
describe("GET /api/lectures/bookable", async () => {
  //now let's login the user before we run any tests
  const authenticatedUser = request.agent(app);
  beforeEach(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
    await knex("course_available_student").del();
    await knex("user").insert(userTuple);
    await knex("user").insert(teacherTuple);
    await knex("lecture").insert(futureLectureTuple);
    await knex("course").insert(courseTuple);
    await knex("course_available_student").insert(courseStudentTuple);
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(userCredentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get("/api/lectures/bookable");
    expect(res.status).to.equal(200);
  });
  it("should return one lecture that the student can book", async () => {
    const res = await authenticatedUser.get("/api/lectures/bookable");
    expect(res.body.length).to.equal(1);
    expect(res.body).to.have.deep.members(expectedBookableLectures)
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
    await knex("user").insert(userTuple);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    await knex("lecture_booking").insert(lectureBookingTuple);
    
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(userCredentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get(
      "/api/lectures/previousbooking"
    );
    expect(res.status).to.equal(200);
  });
  it("should return one previous booked lecture", async () => {
    const res = await authenticatedUser.get("/api/lectures/previousbooking");
    expect(res.body.length).to.equal(1);
    expect(res.body).to.have.deep.members(expectedPreviousBooking)
   
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
    await knex("user").insert(userTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);    
    await knex("lecture_booking").insert(lectureBookingTuple);    
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(userCredentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get(`/api/lectures/${lectureBookingTuple.lecture_id}/students`);
    expect(res.status).to.equal(200);
  });
  it("should return one student booked", async () => {
    const res = await authenticatedUser.get(`/api/lectures/${lectureBookingTuple.lecture_id}/students`);
    expect(res.body.length).to.equal(1);
    expect(res.body).to.have.deep.members([{ id: userTuple.id, name: userTuple.name , surname: userTuple.surname , email: mailSlurpAddress }])
   
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
    await knex("user").insert(userTuple);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(userCredentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get(
      `/api/courses/${lectureTuple.course}/lectures`
    );
    expect(res.status).to.equal(200);
  });
  it("should return one student booked", async () => {
    const res = await authenticatedUser.get(`/api/courses/${lectureTuple.course}/lectures`);
    expect(res.body.length).to.equal(1);
    expect(res.body).to.have.deep.members([{   id: lectureTuple.id,
      name: lectureTuple.name,
      course: lectureTuple.course,
      lecturer_id: teacherTuple.id,
      lecturer_name: teacherTuple.name,
      lecturer_surname: teacherTuple.surname,
      start: lectureTuple.start,
      end: lectureTuple.end,
      capacity: lectureTuple.capacity,
      status: lectureTuple.status
    }]) 
  });
  after(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});
//Cancel a lecture booked by a student
describe("Cancel a booked lecture ", async () => {
  //now let's login the user before we run any tests
  const authenticatedUser = request.agent(app);
  before(async () => {
    await knex("user").del();
    await knex("lecture_booking").del();
    await knex("user").insert(userTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple); 
    await knex("lecture_booking").insert(lectureBookingTuple);    
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(userCredentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.delete(`/api/lectures/${lectureBookingTuple.lecture_id}/cancelbook`);
    expect(res).to.be.json;
    expect(res.status).to.equal(200);

  });
  it("should return message ", async () => {
    const res = await authenticatedUser.delete(`/api/lectures/${lectureBookingTuple.lecture_id}/cancelbook`);
    expect(res).to.have.property('body');
    expect(res.body.message ).to.equal( `Booking canceled.`);
   
  });
  after(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});

// Turn a presence lecture into distance one 
describe("Presence Lecture into distance one ", async () => {
  //now let's login the user before we run any tests
  const authenticatedUser = request.agent(app);
  const authenticatedStudent = request.agent(app);
  before(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("user").insert(userTuple);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);  
    await knex("lecture_booking").insert(lectureBookingTuple);  
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send( teacherCredentials);
      const resStudent = await authenticatedStudent
      .post("/api/auth/login")
      .send( userCredentials);
    expect(res.status).to.equal(200);
  });
  it("should return status 204", async () => {
    const res = await authenticatedUser.put(`/api/lectures/${lectureTuple.id}/convert`)
    .send();
     expect(res.status).to.equal(204);

    const lectureChanged = await knex.select("id","status").from("lecture").where("id",lectureTuple.id);
    expect(lectureChanged).to.have.deep.members([{ id: lectureTuple.id, status: "distance" }])
     expect(res.body.message).to.not.be.null;

  });

  it("should return status 401 ", async () => {
    const resStudent = await authenticatedStudent.put(`/api/lectures/${lectureTuple.id}/convert`)
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

const app = require("../server/server.js");
const knex = require("../server/db");
var request = require("supertest");
const { expect } = require("chai");
const moment = require("moment");
const emailController = require("../server/controllers/email-controller");
const MailSlurp = require("mailslurp-client").default;

const apiKey = "550e9641efa0f072e78ce2a7485fcd3ceb91011f4165db1de5dede3ccf0ef042";
const mailSlurpAddress = "e3cd0975-6be7-4c1d-8d65-0041418e1928@mailslurp.com";
const mailslurp = new MailSlurp({ apiKey });

//the data we need to pass to the login method
const userCredentials = {
    email: mailSlurpAddress,
    password: "password",
};

const userTuple = {
    id: 1,
    name: "Enrico",
    surname: "Carraro",
    password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
    email: mailSlurpAddress,
    role: "student"
};

const teacherTuple = {
    id: 2,
    name: "John",
    surname: "Doe",
    password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
    email: "john.doe@polito.it",
    role: "teacher"
};

const courseTuple = {
    id: 1,
    name: "Software Engineering II",
    main_prof: teacherTuple.id
};

const lectureTuple = {
    id: 1,
    name: "Lecture 1",
    course: courseTuple.id,
    lecturer: teacherTuple.id,
    start: moment().add(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
    end: moment().add(2, "hours").format("YYYY-MM-DD HH:mm:ss"),
    capacity: 25,
};

const courseStudentTuple = {
    course_id: courseTuple.id,
    student_id: userTuple.id
};

const lectureBookingTuple = {
    lecture_id: lectureTuple.id,
    student_id: userTuple.id,
    booked_at: moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss")
};

const authenticatedUser = request.agent(app);

describe("Lecture test", async function() {
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
                .expect(200, {message: "Booking created."});
        });

        it("should receive an email", async() => {
            const email = await mailslurp.waitForLatestEmail(inbox.id);
            expect(email.body).to.match(/You have successfully booked a seat/);
        });
    });
});
  
    


  
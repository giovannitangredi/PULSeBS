const app = require("../server/server.js");
const knex = require("../server/db");
var request = require("supertest");
const { expect } = require("chai");
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
    start: "2020-11-19 11:30:00",
    end: "2020-11-19 14:30:00",
    capacity: 25,
};

const courseStudentTuple = {
    course_id: courseTuple.id,
    student_id: userTuple.id
};


const authenticatedUser = request.agent(app);

describe("Lecture test", async () => {
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
        const res = await authenticatedUser
          .post("/api/auth/login")
          .send(userCredentials)
          .expect(200);
    });

    describe("reservation test", async () => {
        it("book a seat: should return a 200 response", async () => {
            const res = await authenticatedUser
                .post(`/api/lecture/${lectureTuple.id}/book`)
                .expect(200, {message: "Booking created."});
        });

        it("should receive an email", async() => {
            const inbox = (await mailslurp.getInboxes())[0];
            mailslurp.emptyInbox(inbox.id); 
            const email = await mailslurp.waitForLatestEmail(inbox.id);
            expect(email.body).to.equal("test");
        });
    });
});
  
    


  
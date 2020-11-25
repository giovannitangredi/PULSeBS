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

const courseStudentTuple = {
    course_id: courseTuple.id,
    student_id: userTuple.id,
  };

const lectureTuple = {
  id: 1,
  name: "Lecture 1",
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment().subtract(1, "days").subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
};

const lecture2Tuple = {
    id: 2,
    name: "Lecture 2",
    course: courseTuple.id,
    lecturer: teacherTuple.id,
    start: moment().subtract(1, "days").subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss"),
    end: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss"),
    capacity: 25,
  };

  const lectureBookingTuple = {
    lecture_id: lectureTuple.id,
    student_id: userTuple.id,
    booked_at: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm:ss"),
  };

  const lectureBookingTuple2 = {
    lecture_id: lectureTuple.id,
    student_id: "2",
    booked_at: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm:ss"),
  };
  const lecture2BookingTuple = {
    lecture_id: lecture2Tuple.id,
    student_id: userTuple.id,
    booked_at: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm:ss"),
  };

describe("Usage test", async function () {
    const authenticatedUser = request.agent(app);
    this.timeout(10000);
    before(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("lecture_booking").del();
      await knex("course_available_student").del();
      await knex("stats_lecture").del();
      await knex("stats_time").del();
      await knex("stats_usage").del();
      await knex("user").insert(userTuple);
      await knex("course").insert(courseTuple);
      await knex("lecture").insert(lectureTuple);
      await knex("lecture").insert(lecture2Tuple);
      await knex("course_available_student").insert(courseStudentTuple);
    });
  
    describe("Get the number of booking for all the lecture of the course", async () => {

      before(async () => {
        const res = await authenticatedUser
          .post("/api/auth/login")
          .send(userCredentials)
          .expect(200);       
        await knex("lecture_booking").insert(lectureBookingTuple);    //+1 Lecture 1 (user 1)
        await knex("lecture_booking").insert(lecture2BookingTuple);   //+1 Lecture 2 (user 1)
        await knex("lecture_booking").insert(lectureBookingTuple2);   //+1 Lecture 1 (user 2)  
      });
  
      it("Should return the total number of booking (2 for lecture 1, 1 for lecture 2) after three insert in lecture_booking", async () => {
        const res = await authenticatedUser
            .get(`/api/courses/${courseTuple.id}/bookings`).expect(200);
            expect(res.body.length).to.equal(2);
        expect(res.body[0].booking).to.equal(2);
        expect(res.body[1].booking).to.equal(1);
      });

      it("Should return the total number of booking (1 for lecture 1) after delete in lecture_booking", async () => {
           //delete one record in lecture_booking         
            await knex("lecture_booking")                                    //-1 Lecture 1 (user 2)
                .where("lecture_id",lectureTuple.id)
                .andWhere("student_id","2")
                .del()
            await knex("lecture_booking")                                   //-1 Lecture 2 (user 1)
                .where("lecture_id",lecture2Tuple.id)
                .andWhere("student_id",userTuple.id)
                .del()
          
         const res = await authenticatedUser
             .get(`/api/courses/${courseTuple.id}/bookings`).expect(200);
             expect(res.body.length).to.equal(1);   
             expect(res.body[0].booking).to.equal(1); 
    });  
    after(async () => {
        await knex("lecture_booking").del();
        await knex("stats_lecture").del();
        await knex("stats_time").del();
        await knex("stats_usage").del();
      });
    });
    
    describe("Get the number of bookings for all lectures of the course scheduled for the week", async () => {
        const year = moment(lectureTuple.start).year();
        const week =  moment(lectureTuple.start).week();
        before(async () => {
            const res = await authenticatedUser
              .post("/api/auth/login")
              .send(userCredentials)
              .expect(200);    
        await knex("lecture_booking").insert(lectureBookingTuple);    //+1 Lecture 1 (user 1)
        await knex("lecture_booking").insert(lecture2BookingTuple);   //+1 Lecture 2 (user 1)
        await knex("lecture_booking").insert(lectureBookingTuple2);   //+1 Lecture 1 (user 2)   
          });

          it("Should return the total number of booking scheduled for the week (2 in Lecture 1, 1 in Lecture 2 -> 1.5) after three insert in lecture_booking", async () => {
            const res = await authenticatedUser
                .get(`/api/courses/${courseTuple.id}/bookings?week=${year}-${week}`).expect(200);
            expect(res.body.length).to.equal(1);
            expect(res.body[0].booking).to.equal(1.5); //in sql table week 47, here week 48
          });

          it("Should return the total number of booking scheduled for the week (1) after delete in lecture_booking", async () => {
               //delete one record in lecture_booking         
                 await knex("lecture_booking")                                    //-1 Lecture 1 (user 2)
                .where("lecture_id",lectureTuple.id)
                .andWhere("student_id","2")
                .del()
            await knex("lecture_booking")                                   //-1 Lecture 2 (user 1)
                .where("lecture_id",lecture2Tuple.id)
                .andWhere("student_id",userTuple.id)
                .del()
              
             const res = await authenticatedUser
                 .get(`/api/courses/${courseTuple.id}/bookings?week=${year}-${week}`).expect(200);
             expect(res.body.length).to.equal(1);
             expect(res.body[0].booking).to.equal(1);   
    
        }); 
        after(async () => {
            await knex("lecture_booking").del();
            await knex("stats_lecture").del();
            await knex("stats_time").del();
            await knex("stats_usage").del();
          });  
    });
    

    describe("Get the number of bookings for all lectures of the course scheduled for the month", async () => {
    const year = moment(lectureTuple.start).year();
    const month = moment(lectureTuple.start).month()+1; //January is 0
    before(async () => {
        const res = await authenticatedUser
          .post("/api/auth/login")
          .send(userCredentials)
          .expect(200);         
          await knex("lecture_booking").insert(lectureBookingTuple);    //+1 Lecture 1 (user 1)
          await knex("lecture_booking").insert(lecture2BookingTuple);   //+1 Lecture 2 (user 1)
          await knex("lecture_booking").insert(lectureBookingTuple2);   //+1 Lecture 1 (user 2) 
        });

      it("Should return the total number of booking scheduled for the month (2 in Lecture 1, 1 in Lecture 2 -> 1.5) after three insert in lecture_booking", async () => {
        const res = await authenticatedUser
            .get(`/api/courses/${courseTuple.id}/bookings?month=${year}-${month}`).expect(200);
        expect(res.body.length).to.equal(1);
        expect(res.body[0].booking).to.equal(1.5); 
      });

      it("Should return the total number of booking scheduled for the month (1) after delete in lecture_booking", async () => {
           //delete one record in lecture_booking         
           await knex("lecture_booking")                                    //-1 Lecture 1 (user 2)
           .where("lecture_id",lectureTuple.id)
           .andWhere("student_id","2")
           .del()
       await knex("lecture_booking")                                   //-1 Lecture 2 (user 1)
           .where("lecture_id",lecture2Tuple.id)
           .andWhere("student_id",userTuple.id)
           .del()
         const res = await authenticatedUser
             .get(`/api/courses/${courseTuple.id}/bookings?month=${year}-${month}`).expect(200);
             expect(res.body.length).to.equal(1);
         expect(res.body[0].booking).to.equal(1);  

    });
    after(async () => {
        await knex("lecture_booking").del();
      });
    }); 
  after(async () => {
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
    await knex("course_available_student").del();
    await knex("stats_lecture").del();
    await knex("stats_time").del();
    await knex("stats_usage").del();
  });

});
const app = require("../server/server.js");
const knex = require("../server/db");
var request = require("supertest");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const moment = require("moment");

//the data we need to pass to the login method

const managerCredentials = {
  email: "mario.castello@polito.it",
  password: "password",
};

const userTuple = {
  id: "1",
  name: "Enrico",
  surname: "Carraro",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "e_carra@qwerty.it",
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
  ssn: "MK97060783",
};

const managerTuple = {
  id: "3",
  name: "Mario",
  surname: "Castello",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "mario.castello@polito.it",
  role: "manager",
  city: "Napoli",
  birthday: "1961-11-04",
  ssn: "UQ88181741",
};
const teacherCredentials = {
  email: teacherTuple.email,
  password: "password",
};

const courseTuple = {
  id: 1,
  name: "Software Engineering II",
  main_prof: teacherTuple.id,
  year: 1,
  semester: 1,
};

const courseStudentTuple = {
  course_id: courseTuple.id,
  student_id: userTuple.id,
};

const lectureTuple = {
  id: 1,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment()
    .subtract(1, "days")
    .subtract(1, "hours")
    .format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
};

const lecture2Tuple = {
  id: 2,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment()
    .subtract(1, "days")
    .subtract(1, "hours")
    .format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
};

const oneWeekAgoLectureTuple = {
  id: 3,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment()
    .subtract(8, "days")
    .subtract(1, "hours")
    .format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(8, "days").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
};

const twoWeekAgoLectureTuple = {
  id: 4,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment()
    .subtract(15, "days")
    .subtract(1, "hours")
    .format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(15, "days").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
};

const oneMonthAgoLectureTuple = {
  id: 5,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment()
    .subtract(1, "months")
    .subtract(1, "hours")
    .format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(1, "months").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
};

const twoMonthAgoLectureTuple = {
  id: 6,
  course: courseTuple.id,
  lecturer: teacherTuple.id,
  start: moment()
    .subtract(2, "months")
    .subtract(1, "hours")
    .format("YYYY-MM-DD HH:mm:ss"),
  end: moment().subtract(2, "months").format("YYYY-MM-DD HH:mm:ss"),
  capacity: 25,
  status: "presence",
  room: 1,
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
  this.timeout(100000);
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
    await knex("lecture").insert(lecture2Tuple);
    await knex("lecture").insert(oneWeekAgoLectureTuple);
    await knex("lecture").insert(twoWeekAgoLectureTuple);
    await knex("lecture").insert(oneMonthAgoLectureTuple);
    await knex("lecture").insert(twoMonthAgoLectureTuple);
    await knex("course_available_student").insert(courseStudentTuple);
  });

  describe("Get statistics when not logged as manager or teacher", () => {
    before(async () => {  //login as a wrong user
      await authenticatedUser
        .post("/api/auth/login")
        .send({
          email: userTuple.email,
          password: "password",
        })
        .expect(200);
    });

    it("Should return 401 (Unauthorized error)", async () => {
      await authenticatedUser
        .get(`/api/courses/${courseTuple.id}/bookings`)
        .expect(401);
    });
  });

  describe("Get the stats for the lectures of the course schduled between two weeks", async () => {
    before(async () => {
      await knex("stats_lecture").del();
      await knex("stats_time").del();
      await knex("stats_usage").del();

      await knex("lecture_booking").insert({
        lecture_id: twoWeekAgoLectureTuple.id,
        student_id: userTuple.id,
        booked_at: moment().subtract(3, "weeks").format("YYYY-MM-DD HH:mm:ss"),
      }); //+1 first week

      await knex("lecture_booking").insert({
        lecture_id: oneWeekAgoLectureTuple.id,
        student_id: userTuple.id,
        booked_at: moment().subtract(2, "weeks").format("YYYY-MM-DD HH:mm:ss"),
      }); //+1 second week

      await knex("lecture_booking").insert(lectureBookingTuple); //+1 third week
      await knex("lecture_booking").insert(lecture2BookingTuple); //+1 third week
      await knex("lecture_booking").insert(lectureBookingTuple2); //+1 third week

      await authenticatedUser
        .post("/api/auth/login")
        .send(teacherCredentials)
        .expect(200);
    });

    it("Should return the stats between two weeks after 5 insert in lecture_booking", async () => {
      const week1 = moment(twoWeekAgoLectureTuple.start, "YYYY-MM-DD HH:mm:ss").format("YYYY-W");
      const week2 = moment(oneWeekAgoLectureTuple.start, "YYYY-MM-DD HH:mm:ss").format("YYYY-W");
      const week3 = moment(lectureTuple.start, "YYYY-MM-DD HH:mm:ss").format("YYYY-W");

      const res = await authenticatedUser
        .get(`/api/courses/${courseTuple.id}/bookings?fromWeek=${week1}&toWeek=${week3}`)
        .expect(200);
      expect(res.body.length).to.equal(3);
      expect(res.body).to.have.deep.members(
        [
          {
            course_id: courseTuple.id,
            course_name: courseTuple.name,
            week: week1,
            booking: 1,
            cancellations: 0,
            attendances: 0,
          },
          {
            course_id: courseTuple.id,
            course_name: courseTuple.name,
            week: week2,
            booking: 1,
            cancellations: 0,
            attendances: 0,
          },
          {
            course_id: courseTuple.id,
            course_name: courseTuple.name,
            week: week3,
            booking: 3 / 2,
            cancellations: 0,
            attendances: 0,
          },
        ]
      );
    });

    after(async () => {
      await knex("lecture_booking").del();
      await knex("stats_lecture").del();
      await knex("stats_time").del();
      await knex("stats_usage").del();
    });
  });

  describe("Get the stats for the lectures of the course schduled between two months", async () => {
    before(async () => {
      await knex("stats_lecture").del();
      await knex("stats_time").del();
      await knex("stats_usage").del();

      await knex("lecture_booking").insert({
        lecture_id: twoMonthAgoLectureTuple.id,
        student_id: userTuple.id,
        booked_at: moment().subtract(3, "months").format("YYYY-MM-DD HH:mm:ss"),
      }); //+1 first months

      await knex("lecture_booking").insert({
        lecture_id: oneMonthAgoLectureTuple.id,
        student_id: userTuple.id,
        booked_at: moment().subtract(2, "months").format("YYYY-MM-DD HH:mm:ss"),
      }); //+1 second months

      await authenticatedUser
        .post("/api/auth/login")
        .send(teacherCredentials)
        .expect(200);
    });

    it("Should return the stats between two months", async () => {
      const month1 = moment(twoMonthAgoLectureTuple.start, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM");
      const month2 = moment(oneMonthAgoLectureTuple.start, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM");

      const res = await authenticatedUser
        .get(`/api/courses/${courseTuple.id}/bookings?fromMonth=${month1}&toMonth=${month2}`)
        .expect(200);
      expect(res.body.length).to.equal(2);
      expect(res.body).to.have.deep.members(
        [
          {
            course_id: courseTuple.id,
            course_name: courseTuple.name,
            month: month1,
            booking: 1,
            cancellations: 0,
            attendances: 0,
          },
          {
            course_id: courseTuple.id,
            course_name: courseTuple.name,
            month: month2,
            booking: 1,
            cancellations: 0,
            attendances: 0,
          },
        ]
      );
    });

    after(async () => {
      await knex("lecture_booking").del();
      await knex("stats_lecture").del();
      await knex("stats_time").del();
      await knex("stats_usage").del();
    });
  });

  describe("Get the number of booking for all the lecture of the course", async () => {
    before(async () => {
      const res = await authenticatedUser
        .post("/api/auth/login")
        .send(teacherCredentials)
        .expect(200);
      await knex("stats_lecture").del();
      await knex("stats_time").del();
      await knex("stats_usage").del();
      await knex("lecture_booking").insert(lectureBookingTuple); //+1 Lecture 1 (user 1)
      await knex("lecture_booking").insert(lecture2BookingTuple); //+1 Lecture 2 (user 1)
      await knex("lecture_booking").insert(lectureBookingTuple2); //+1 Lecture 1 (user 2)
    });

    it("Should return the total number of booking (2 for lecture 1, 1 for lecture 2) after three insert in lecture_booking", async () => {
      const res = await authenticatedUser
        .get(`/api/courses/${courseTuple.id}/bookings`)
        .expect(200);
      expect(res.body.length).to.equal(2);
      expect(res.body[0].booking).to.equal(2);
      expect(res.body[1].booking).to.equal(1);
    });

    it("Should return the total number of booking (1 for lecture 1) after delete in lecture_booking", async () => {
      //delete one record in lecture_booking
      await knex("lecture_booking") //-1 Lecture 1 (user 2)
        .where("lecture_id", lectureTuple.id)
        .andWhere("student_id", "2")
        .del();
      await knex("lecture_booking") //-1 Lecture 2 (user 1)
        .where("lecture_id", lecture2Tuple.id)
        .andWhere("student_id", userTuple.id)
        .del();

      const res = await authenticatedUser
        .get(`/api/courses/${courseTuple.id}/bookings`)
        .expect(200);
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
    const week = moment(lectureTuple.start).isoWeek();
    before(async () => {
      const res = await authenticatedUser
        .post("/api/auth/login")
        .send(teacherCredentials)
        .expect(200);
      await knex("stats_lecture").del();
      await knex("stats_time").del();
      await knex("stats_usage").del();
      await knex("lecture_booking").insert(lectureBookingTuple); //+1 Lecture 1 (user 1)
      await knex("lecture_booking").insert(lecture2BookingTuple); //+1 Lecture 2 (user 1)
      await knex("lecture_booking").insert(lectureBookingTuple2); //+1 Lecture 1 (user 2)
    });

    it("Should return the total number of booking scheduled for the week (2 in Lecture 1, 1 in Lecture 2 -> 1.5) after three insert in lecture_booking", async () => {
      const res = await authenticatedUser
        .get(`/api/courses/${courseTuple.id}/bookings?week=${year}-${week}`)
        .expect(200);
      expect(res.body.length).to.equal(1);
      expect(res.body[0].booking).to.equal(1.5);
    });

    it("Should return the total number of booking scheduled for the week (1) after delete in lecture_booking", async () => {
      //delete one record in lecture_booking
      await knex("lecture_booking") //-1 Lecture 1 (user 2)
        .where("lecture_id", lectureTuple.id)
        .andWhere("student_id", "2")
        .del();
      await knex("lecture_booking") //-1 Lecture 2 (user 1)
        .where("lecture_id", lecture2Tuple.id)
        .andWhere("student_id", userTuple.id)
        .del();

      const res = await authenticatedUser
        .get(`/api/courses/${courseTuple.id}/bookings?week=${year}-${week}`)
        .expect(200);
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
    const date = moment(lectureTuple.start).format("YYYY-MM");
    before(async () => {
      const res = await authenticatedUser
        .post("/api/auth/login")
        .send(teacherCredentials)
        .expect(200);
      await knex("stats_lecture").del();
      await knex("stats_time").del();
      await knex("stats_usage").del();
      await knex("lecture_booking").insert(lectureBookingTuple); //+1 Lecture 1 (user 1)
      await knex("lecture_booking").insert(lecture2BookingTuple); //+1 Lecture 2 (user 1)
      await knex("lecture_booking").insert(lectureBookingTuple2); //+1 Lecture 1 (user 2)
    });

    it("Should return the total number of booking scheduled for the month (2 in Lecture 1, 1 in Lecture 2 -> 1.5) after three insert in lecture_booking", async () => {
      const res = await authenticatedUser
        .get(`/api/courses/${courseTuple.id}/bookings?month=${date}`)
        .expect(200);
      expect(res.body.length).to.equal(1);
      expect(res.body[0].booking).to.equal(1.5);
    });

    it("Should return the total number of booking scheduled for the month (1) after delete in lecture_booking", async () => {
      //delete one record in lecture_booking
      await knex("lecture_booking") //-1 Lecture 1 (user 2)
        .where("lecture_id", lectureTuple.id)
        .andWhere("student_id", "2")
        .del();
      await knex("lecture_booking") //-1 Lecture 2 (user 1)
        .where("lecture_id", lecture2Tuple.id)
        .andWhere("student_id", userTuple.id)
        .del();
      const res = await authenticatedUser
        .get(`/api/courses/${courseTuple.id}/bookings?month=${date}`)
        .expect(200);
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

describe("Stats error when not logged as manager", async () => {
  const authenticatedUser = request.agent(app);

  before(async () => {
    await knex("user").del();
    await knex("stats_lecture").del();
    await knex("stats_time").del();
    await knex("stats_usage").del(); 
    await knex("user").insert(teacherTuple);
    await authenticatedUser
      .post("/api/auth/login")
      .send(teacherCredentials)
      .expect(200);
  });
  it("should return  with status 401, Unauthorized access, only managers can access this data.", async () => {
    const res = await authenticatedUser.get(`/api/stats/system`);
    expect(res).to.be.json;
    expect(res.status).to.equal(401);
  });

  it("should return  with status 401, Unauthorized access, only managers can access this data.", async () => {
    const res = await authenticatedUser.get(`/api/stats/lectures`);
    expect(res).to.be.json;
    expect(res.status).to.equal(401);
  });
  it("should return  with status 401, Unauthorized access, only managers can access this data.", async () => {
    const res = await authenticatedUser.get(
      `/api/courses/${courseTuple.id}/stats`
    );
    expect(res).to.be.json;
    expect(res.status).to.equal(401);
  });
  it("should return  with status 401, Unauthorized access, only managers can access this data.", async () => {
    const res = await authenticatedUser.get(
      `/api/courses/${courseTuple.id}/lecturesStats`
    );
    expect(res).to.be.json;
    expect(res.status).to.equal(401);
  });

  after(async () => {
    await knex("user").del();
    await knex("stats_lecture").del();
    await knex("stats_time").del();
    await knex("stats_usage").del();
  });
});

describe("Return the system stats ", async function () {
  this.timeout(5000);
  //now let's login the user before we run any tests
  const authenticatedUser = request.agent(app);

  before(async () => {
    await knex("user").del();
    await knex("stats_lecture").del();
    await knex("stats_time").del();
    await knex("stats_usage").del();
    await knex("user").insert(managerTuple);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    await knex("lecture_booking").insert(lectureBookingTuple);

    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(managerCredentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get(`/api/stats/system`);
    expect(res).to.be.json;
    expect(res.status).to.equal(200);
  });
  it("should return the response details ", async () => {
    const res = await authenticatedUser.get(`/api/stats/system`);
    expect(res).to.have.property("body");
    expect(res.body.length).to.equal(1);
    expect(res.body[0].cancellations).to.equal(0);
    expect(res.body[0].bookings).to.equal(1);
    expect(res.body[0].attendances).to.equal(0);
  });
  it("should return the updated value of attendences (1) after changing the status null -> present", async () => {
    await knex("lecture_booking").update("status", "present").where("lecture_id", lectureBookingTuple.lecture_id).andWhere("student_id", lectureBookingTuple.student_id);
    const res = await authenticatedUser.get(`/api/stats/system`);
    expect(res).to.have.property("body");
    expect(res.body.length).to.equal(1);
    expect(res.body[0].cancellations).to.equal(0);
    expect(res.body[0].bookings).to.equal(1);
    expect(res.body[0].attendances).to.equal(1);
  });
  it("should return the updated value of attendences (0) after changing the status present -> absent", async () => {
    await knex("lecture_booking").update("status", "absent").where("lecture_id", lectureBookingTuple.lecture_id).andWhere("student_id", lectureBookingTuple.student_id);
    const res = await authenticatedUser.get(`/api/stats/system`);
    expect(res).to.have.property("body");
    expect(res.body.length).to.equal(1);
    expect(res.body[0].cancellations).to.equal(0);
    expect(res.body[0].bookings).to.equal(1);
    expect(res.body[0].attendances).to.equal(0);
  });
  after(async () => {
    await knex("stats_usage").del();
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});

//Get all the lecture stats
describe("Return all the lecture stats ", async function () {
  //now let's login the user before we run any tests
  this.timeout(5000);
  const authenticatedUser = request.agent(app);
  before(async () => {
    await knex("user").del();
    await knex("user").insert(managerTuple);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    await knex("lecture_booking").insert(lectureBookingTuple);
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(managerCredentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get(`/api/stats/lectures`);
    expect(res).to.be.json;
    expect(res.status).to.equal(200);
  });
  it("should return the response details  ", async () => {
    const res = await authenticatedUser.get(`/api/stats/lectures`);
    expect(res).to.have.property("body");
    expect(res.body.length).to.equal(1);
    expect(res.body).to.have.deep.members([
      {
        course: courseTuple.name,
        courseId: courseTuple.id,
        cancellations: 0,
        attendances: 0,
        bookings: 1,
        date: moment(lectureTuple.start).format("YYYY-MM-DD"),
      },
    ]);
  });
  after(async () => {
    await knex("stats_usage").del();
    await knex("stats_lecture").del();
    await knex("stats_time").del();
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});

//Get course total Stats for a single course with courseid
describe("Return all the Course stats ", async () => {
  //now let's login the user before we run any tests
  const authenticatedUser = request.agent(app);
  before(async () => {
    await knex("user").del();
    await knex("user").insert(managerTuple);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    //await knex("stats_usage").insert(StatsUsageTuple);
    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(managerCredentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get(
      `/api/courses/${courseTuple.id}/stats`
    );
    expect(res).to.be.json;
    expect(res.status).to.equal(200);
  });
  it("should return the body length  ", async () => {
    const res = await authenticatedUser.get(
      `/api/courses/${courseTuple.id}/stats`
    );
    expect(res).to.have.property("body");
    expect(res.body.length).to.equal(1);
  });
  after(async () => {
    await knex("stats_usage").del();
    await knex("stats_lecture").del();
    await knex("stats_time").del();
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});

//Get  the course lecture stats
describe("Return course  lecture stats ", async () => {
  //now let's login the user before we run any tests
  const authenticatedUser = request.agent(app);
  before(async () => {
    await knex("user").del();
    await knex("course").del();
    await knex("user").insert(managerTuple);
    await knex("user").insert(teacherTuple);
    await knex("course").insert(courseTuple);
    await knex("lecture").insert(lectureTuple);
    await knex("lecture_booking").insert(lectureBookingTuple);

    const res = await authenticatedUser
      .post("/api/auth/login")
      .send(managerCredentials);

    expect(res.status).to.equal(200);
  });
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get(
      `/api/courses/${courseTuple.id}/lecturesStats`
    );
    expect(res).to.be.json;
    expect(res.status).to.equal(200);
  });
  it("should return the details of course lecture stats  ", async () => {
    const res = await authenticatedUser.get(
      `/api/courses/${courseTuple.id}/lecturesStats`
    );
    expect(res).to.have.property("body");
    expect(res.body.length).to.equal(1);
    expect(res.body).to.have.deep.members([
      {
        course: courseTuple.name,
        cancellations: 0,
        attendances: 0,
        bookings: 1,
        date: moment(lectureTuple.start).format("YYYY-MM-DD"),
      },
    ]);
  });
  after(async () => {
    await knex("stats_usage").del();
    await knex("stats_lecture").del();
    await knex("stats_time").del();
    await knex("user").del();
    await knex("lecture").del();
    await knex("lecture_booking").del();
    await knex("course").del();
  });
});

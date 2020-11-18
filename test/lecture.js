const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const app = require("../server/server.js");
const knex = require("../server/db");
var request = require("supertest");

//the data we need to pass to the login method
const userCredentials = {
  email: "s274930@studenti.polito.it",
  password: "password",
};

const userTuple = {
  id: 1,
  name: "Enrico",
  surname: "Carraro",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "s274930@studenti.polito.it",
  role: "student",
};

const userResponseData = { ...userTuple };
delete userResponseData.password_hash;

// New Booking 
describe("POST /api/lectures/:lectureId/book", async () => {
  //now let's login the user before we run any tests
const authenticatedUser = request.agent(app);
beforeEach(async () => {
  await knex("user").del();
  await knex("user").insert(userTuple);
  const res = await authenticatedUser
    .post("/api/auth/login")
    .send(userCredentials);

  expect(res.status).to.equal(200);
});
  it("should return 'Booking created.' with status 200", async () => {
    const res = await authenticatedUser.post("/api/lectures/1/book")
    //.send({ lecture_id: 1, student_id: 1, booked_at :"2020-11-10 09:00:00" });
     expect(res.status).to.equal(200); 
});
it("should return 'Booking created.' with status 200", async () => {
  const res = await authenticatedUser.post("/api/lectures/1/book")
  //.send({ lecture_id: 2, student_id: 1, booked_at :"2020-12-10 09:00:00" });
   expect(res.status).to.equal(200);
});
afterEach(async () => {
  await knex("user").del();
})
});
// Get all avaliable booking 
describe("GET /api/lectures/bookable", async () => {
    //now let's login the user before we run any tests
const authenticatedUser = request.agent(app);
beforeEach(async () => {
  await knex("user").del();
  await knex("user").insert(userTuple);
  const res = await authenticatedUser
    .post("/api/auth/login")
    .send(userCredentials);

  expect(res.status).to.equal(200);
});
  it("should return  with status 200", async () => {
    const res = await authenticatedUser.get("/api/lectures/bookable")
     expect(res.status).to.equal(200); 
});
it("should return  with status 200", async () => {
  const res = await authenticatedUser.get("/api/lectures/bookable")
   expect(res.status).to.equal(200);
});
afterEach(async () => {
  await knex("user").del();
})
});
// Get the existent Booking 
describe("GET /api/lectures/previousbooking", async () => {
    //now let's login the user before we run any tests
const authenticatedUser = request.agent(app);
beforeEach(async () => {
  await knex("user").del();
  await knex("user").insert(userTuple);
  const res = await authenticatedUser
    .post("/api/auth/login")
    .send(userCredentials);

  expect(res.status).to.equal(200);
});
  it("should return  with status 200", async () => {
    const res = await (await authenticatedUser.get("/api/lectures/previousbooking"))
     expect(res.status).to.equal(200); 
});
it("should return  with status 200", async () => {
  const res = await authenticatedUser.get("/api/lectures/previousbooking")
   expect(res.status).to.equal(200);
});
afterEach(async () => {
  await knex("user").del();
})
});


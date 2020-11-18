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


describe("GET /api/courses/", () => {
  //now let's login the user before we run any tests
const authenticatedUser = request.agent(app);
beforeEach(async () => {
  await knex("user").del();
  await knex("user").insert(userTuple);
  await knex("course").del();
  await knex("course").insert({ id: 1, name: "Software Engineering I" ,main_prof:1});
  await knex("course").insert({ id: 2, name: "Software Engineering II" ,main_prof:2 });
  const res = await authenticatedUser
    .post("/api/auth/login")
    .send(userCredentials);

  expect(res.status).to.equal(200);
});
    it("it should return status 200", async () => {
        const res = await authenticatedUser.get("/api/courses/")
      expect(res.status).to.equal(200);
    });
    afterEach(async () => {
      await knex("course").del();
      await knex("user").del();
    });
  });
  
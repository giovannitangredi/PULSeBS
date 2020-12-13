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
  id: "1",
  name: "Enrico",
  surname: "Carraro",
  password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
  email: "s274930@studenti.polito.it",
  role: "student",
  city:"Poggio Ferro",
  birthday:"1996-11-04",
  ssn:"MK97060783"

};

const userResponseData = { ...userTuple };
delete userResponseData.password_hash;

describe("GET /api/user", async () => {
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

  it("should return a 200 response with the user data if the user is logged in.", async () => {
    const res = await authenticatedUser.get("/api/user");
    expect(res.status).to.equal(200);
    //expect(res.body).to.eql(userResponseData);
  });

  it("should return a 401 response when the user is not authenticated.", async () => {
    const res = await request(app).get("/api/user");
    expect(res.status).to.equal(401);
    expect(res.body).to.eql({ message: "Authorization error" });
  });

  it("should return a 401 response after the user logs out.", async () => {
    const resLogout = await authenticatedUser.post("/api/auth/logout");
    const resUserData = await authenticatedUser.get("/api/user");
    expect(resLogout.status).to.equal(200);
    expect(resUserData.status).to.equal(401);
    expect(resUserData.body).to.eql({ message: "Authorization error" });
  });
  afterEach(async () => {
    await knex("user").del();
  });
});

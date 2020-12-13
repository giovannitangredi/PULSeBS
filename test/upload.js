const app = require("../server/server.js");
const knex = require("../server/db");
var request = require("supertest");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);
const moment = require("moment");
const fs = require("fs");
const csv = require("fast-csv");


const officerCredentials = {
    email: "s274930@studenti.polito.it",
    password: "password",
  };

  const userTuple = {
    id: "900000",
    name: "Ambra",
    surname: "Ferri",
    password_hash:"$2b$04$LGtH.Xsd9ty9Hu87fPK4XOwsE24.XvG7QiZi57XNMIrlYkfFurMke",
    city:"Poggio Ferro",
    email: "s900000@students.polito.it",
    birthday:"1996-11-04",
    ssn:"MK97060783"
  };


const teacherTuple = {
    id: "d9000",
    name: "Ines",
    surname: "Beneventi",
    password_hash: "$2b$04$e37G6CPKt2ltsEhAdbYj6eurpz.7TUfWyhkdn3ZKst16k2ElYnWmS",
    email: "Ines.Beneventi@politu.it",
    role: "teacher",
    ssn:"XT6141393"
  };

  const officerTuple = {
    id: "3",
    name: "Enrico",
    surname: "Carraro",
    password_hash: "$2b$10$A9KmnEEAF6fOvKqpUYbxk.1Ye6WLHUMFgN7XCSO/VF5z4sspJW1o.",
    email: "s274930@studenti.polito.it",
    role: "supportOfficer",
    city:"Torino",
    birthday:"1991-11-04",
    ssn:"152"
  };

  const courseTuple = {
    id: "XY1211",
    name: "Metodi di finanziamento delle imprese",
    main_prof: teacherTuple.id,
    year:1,
    semester:1
  };
  
  const enrollementTuple={
    course_id: "XY1211",
    student_id:"900000",
  }

  const lectureTuple = {
    id: 1,
    course: courseTuple.id,
    lecturer: teacherTuple.id,
    start:"8:30",
    end: "11:30",
    capacity: 120,
    status: "presence",
    room:1
  };


  describe("Story 12 test", async function () {
    const authenticatedUser = request.agent(app);
    this.timeout(100000);
    before(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("course_available_student").del();
      await knex("lecture").del();
    });

//Upload student 
    describe("Upload student ", async () => {
        //now let's login the user before we run any tests
        const authenticatedUser = request.agent(app);
        before(async () => {
          await knex("user").del();
          await knex("course").del();
          await knex("lecture").del();
          await knex("course_available_student").del();
          await knex("user").insert(officerTuple);
          const res = await authenticatedUser
            .post("/api/auth/login")
            .send(officerCredentials);
      
          expect(res.status).to.equal(200);
        });

        it("should return  with status 200 and body", async () => {
          const res = await authenticatedUser.post(`/api/upload/students`)
          .field('Id',"900000")
          .field('Name',"Ambra")
          .field('Surname',"Ferri")
          .field('City',"Poggio Ferro")
          .field('OfficialEmail',"s900000@students.polito.it")
          .field('Birthday',"1996-11-04")
          .field('SSN',"MR17121943")
          .attach('file',
          fs.readFileSync('./test/csvfiles/Students.csv'),'Students.csv')
          
          expect(res.status).to.equal(200);

          const uploadedstudent = await knex
          .select("id", "name","surname","email","city","birthday","ssn")
          .from("user");
          expect(uploadedstudent).to.have.deep.members([
          {  id: userTuple.id,
             name:userTuple.name,
             surname:userTuple.surname,
             city:userTuple.city,
             email:userTuple.email,
             birthday:userTuple.birthday,
             ssn:userTuple.ssn              
          },
         ]);
    });
        after(async () => {
          await knex("user").del();
          await knex("lecture").del();
          await knex("course_available_student").del();
          await knex("course").del();
        });
      });

//Upload Profressor
      describe("Upload Profressor ", async () => {
        //now let's login the user before we run any tests
        const authenticatedUser = request.agent(app);
        before(async () => {
          await knex("user").del();
          await knex("course").del();
          await knex("lecture").del();
          await knex("course_available_student").del();
          await knex("user").insert(officerTuple);
      
          const res = await authenticatedUser
            .post("/api/auth/login")
            .send(officerCredentials);
      
          expect(res.status).to.equal(200);
        });

        it("should return  with status 200", async () => {
          const res = await authenticatedUser.post(`/api/upload/teachers`)
          .field('Number',"d9000")
          .field('GivenName',"Ines")
          .field('Surname',"Beneventi")
          .field('OfficialEmail',"Ines.Beneventi@politu.it")
          .field('SSN',"XT6141393")
          .attach('file',
          fs.readFileSync('./test/csvfiles/Profressors.csv'),'Profressors.csv')
         
          expect(res.status).to.equal(200);


          const uploadedteacher = await knex
          .select("id", "name","surname","email","ssn")
          .from("user");
          expect(uploadedteacher).to.have.deep.members([
          {  id: teacherTuple.id,
             name:teacherTuple.name,
             surname:teacherTuple.surname,
             email:teacherTuple.email,
             ssn:teacherTuple.ssn              
          },
         ]);
        });
        after(async () => {
          await knex("user").del();
          await knex("lecture").del();
          await knex("course_available_student").del();
          await knex("course").del();
        });
      });

// Upload courses 

describe("Upload Courses ", async () => {
    //now let's login the user before we run any tests
    const authenticatedUser = request.agent(app);
    before(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("user").insert(officerTuple);
  
      const res = await authenticatedUser
        .post("/api/auth/login")
        .send(officerCredentials);
  
      expect(res.status).to.equal(200);
    });

    it("should return  with status 200", async () => {
      const res = await authenticatedUser.post(`/api/upload/courses`)
          .field('Code',"XY1211")
          .field('year',1)
          .field('semester',1)
          .field('Course',"Metodi di finanziamento delle imprese")
          .field('Teacher',"d9000")
          .attach('file',
          fs.readFileSync('./test/csvfiles/Courses.csv'),'Courses.csv')


      expect(res.status).to.equal(200);

      const uploadedcourses = await knex
      .select("id", "year","semester","name","main_prof")
      .from("course");
      expect(uploadedcourses).to.have.deep.members([
      {  id: courseTuple.id,
         year:courseTuple.year,
         semester:courseTuple.semester,
         name:courseTuple.name,
         main_prof:courseTuple.main_prof                    
      },
     ]);     
    });
    after(async () => {
      await knex("user").del();
      await knex("lecture").del();
      await knex("course").del();
      await knex("course_available_student").del();      
    });
  });


// enrollements  

describe("Upload Enrollements ", async () => {
    //now let's login the user before we run any tests
    const authenticatedUser = request.agent(app);
    before(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("user").insert(officerTuple);
      await knex("user").insert(userTuple);
      await knex("course").insert(courseTuple);
  
      const res = await authenticatedUser
        .post("/api/auth/login")
        .send(officerCredentials);
  
      expect(res.status).to.equal(200);
    });

    it("should return  with status 200", async () => {
      const res = await authenticatedUser.post(`/api/upload/enrollments`)
      .field('Code',"XY1211")
      .field('Student',"900000")
      .attach('file',
       fs.readFileSync('./test/csvfiles/Enrollement.csv'),'Enrollement.csv')

      expect(res.status).to.equal(200);

      const uploadedenrollements = await knex
      .select("course_id", "student_id")
      .from("course_available_student");
      expect(uploadedenrollements).to.have.deep.members([
      { 
         course_id:enrollementTuple.course_id ,
         student_id: enrollementTuple.student_id                
      },
     ]);     
    });
    after(async () => {
      await knex("user").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("course").del();
    });
  });

// Upload Schedule

 describe("Upload Schedule", async () => {
    //now let's login the user before we run any tests
    const authenticatedUser = request.agent(app);
    before(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
      await knex("user").insert(userTuple);
      await knex("user").insert(teacherTuple);
      await knex("user").insert(officerTuple);
      await knex("course").insert(courseTuple);
      await knex("course_available_student").insert(enrollementTuple);
  
      const res = await authenticatedUser
        .post("/api/auth/login")
        .send(officerCredentials);
  
      expect(res.status).to.equal(200);
    });

    it("should return  with status 200", async () => {
      const res = await authenticatedUser.post(`/api/upload/schedule/:semesterid`)
      .field('Code',"XY1211")
      .field('Room',1)
      .field('Day',"Mon")
      .field('Seats',"120")
      .field('Time',"8:30-11:30")
      .attach('file',
       fs.readFileSync('./test/csvfiles/Schedule.csv'),'Schedule.csv')
      
      //expect(res.status).to.equal(200);

      const uploadedschedule = await knex
      .select("course", "lecturer","start","end","room","capacity","status")
      .from("lecture");
      expect(uploadedschedule).to.have.deep.members([
      {  
         course:courseTuple.id,
         lecturer:lectureTuple.id,
         start:lectureTuple.start,
         end:lectureTuple.end,
         room:lectureTuple.room, 
         capacity:lectureTuple.capacity,
         status:lectureTuple.status                            
      },
     ]);     
    });
    after(async () => {
      await knex("user").del();
      await knex("course").del();
      await knex("lecture").del();
      await knex("course_available_student").del();
      
    });
  }); 

});


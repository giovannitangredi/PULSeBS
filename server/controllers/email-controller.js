const moment = require("moment");
const knex = require("./../db");
let cron = require("node-cron");
var imaps = require("imap-simple");
let nodemailer = require("nodemailer");
const simpleParser = require('mailparser').simpleParser;

exports.sendMail = async (email, subject, body) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "pulsebs.softeng@gmail.com",
      pass: "xssyjwawrmvrkgag",
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "pulsebs.softeng@gmail.com", // sender address
    to: email, // reciever mail of receivers
    subject: subject, // Subject line
    html: body, // html body
  });

  console.log("Message sent: %s", info.messageId);
};

exports.fetchEmails = async (imap) => {
  const connection = await imaps.connect({ imap });
  await connection.openBox("INBOX");

  var searchCriteria = ["ALL"];
  var fetchOptions = {
    bodies: [""],
    markSeen: true,
  };

  const messages = await connection.search(searchCriteria, fetchOptions);
  
  await connection.closeBox("INBOX");
  connection.end();

  return await Promise.all(
    messages.map(async function (message) {
      const raw = message.parts.filter((part) => part.which === "")[0].body;
      const mail = await simpleParser(raw);
      return { subject: mail.subject, body: mail.html };
    })
  );
};

exports.waitForNewEmail = async (imap) => {

  return new Promise(async (resolve, reject) => {
    connection = await imaps.connect({ 
      imap, 
      onmail: async function() {
        var searchCriteria = ["UNSEEN"];
        var fetchOptions = {
          bodies: [""],
          markSeen: true,
        };
        const messages = await connection.search(searchCriteria, fetchOptions);

        resolve(
          messages.map(async function (message) {
            const raw = message.parts.filter((part) => part.which === "")[0].body;
            const mail = await simpleParser(raw);
            return { subject: mail.subject, body: mail.html };
          })[0]
        );
        
        await connection.closeBox("INBOX");
        connection.end();
      } 
    });
    
    await connection.openBox("INBOX");
  }); 
};

exports.deleteEmails = async (imap) => {
  const connection = await imaps.connect({imap});
  await connection.openBox("INBOX");
  var searchCriteria = ["ALL"];

  var fetchOptions = {
    bodies: ["HEADER", "TEXT"],
    markSeen: true,
  };

  const messages = await connection.search(searchCriteria, fetchOptions);
  
  messages.forEach(async (message) => {
    await connection.moveMessage(message.attributes.uid, "[Gmail]/Trash");
  });

  await connection.closeBox("INBOX");
  connection.end();
};

// returns a promise when it first calls
// 12 at nights scheduler runs this code with this pattern "0 0 0 * * *"
// every second with this pattern "* * * * * *"
/* * * * * * *
  | | | | | |
  | | | | | day of week(1-7)
  | | | | month (1-12)
  | | | day of month(1-31)
  | | hour
  | minute
  second ( optional )
  */
exports.startScheduler = async (schedulePattern) => {
  
  return new Promise((resolve, reject) => {
    // (second minute hour dayofmonth(1-31) month(1-12) dayofweek(0-7))
    cron.schedule(schedulePattern, () => {
      const today = moment().format("YYYY-MM-DD HH:mm:ss");
      const tomorrow = moment().add(1, "days").format("YYYY-MM-DD HH:mm:ss");

      this.getListOfLectures(today, tomorrow)
        .then((lectures) => {
          //console.log(res);
          const emailSubject = "Bookings for the lecture";
          for (let lecture of lectures) {
            const emailBody = `Dear ${lecture.lecturerName} ${lecture.lecturerSurname},<br/> \
                  We inform You that ${lecture.bookingsNumber} students booked a seat for ${lecture.name} of the course ${lecture.courseName} scheduled for ${lecture.start}<br/><br/>\
                  Thanks,<br/>The PULSeBS Team`;
            this.sendMail(lecture.lecturerEmail, emailSubject, emailBody);
          }
          resolve();
        })
        .catch((err) => reject(err));
    });
  });
};

exports.getListOfLectures = async (from, to) => {
  //let querystring = `select distinct * from lecture join user where lecture.lecturer==user.id and lecture.start>='${date.format("YYYY-MM-DD HH:mm:ss")}' and  lecture.start<'${date.add(1, "days").format("YYYY-MM-DD HH:mm:ss")}' `;
  const queryResults = await knex
    .select(
      { name: "lecture.name" },
      { courseName: "course.name" },
      { start: "lecture.start" },
      { lecturerName: "user.name" },
      { lecturerSurname: "user.surname" },
      { lecturerEmail: "user.email" }
    )
    .count({ bookingsNumber: "lecture.id" })
    .from("lecture")
    .join("course", "lecture.course", "=", "course.id")
    .join("user", "lecture.lecturer", "=", "user.id")
    .join("lecture_booking", "lecture.id", "=", "lecture_booking.lecture_id")
    .where("lecture.start", ">=", from)
    .andWhere("lecture.start", "<", to)
    .groupBy(
      "lecture.id",
      "lecture.name",
      "course.name",
      "lecture.start",
      "user.name",
      "user.surname",
      "user.email"
    );

  return queryResults;
};

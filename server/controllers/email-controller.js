const moment = require("moment");
const knex = require("./../db");
let cron = require("node-cron");
var imaps = require("imap-simple");
let nodemailer = require("nodemailer");

exports.sendMail = async (email, subject, body) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "1297320697@qq.com",
      pass: "jzfymzgdbzvzhaha",
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "1297320697@qq.com", // sender address
    to: email, // reciever mail of receivers
    subject: subject, // Subject line
    html: body, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  return info
};

/* output
[
   {
     which: 'HEADER',
     size: 595,
     body: {
       'return-path': [Array],
       received: [Array],
       'content-type': [Array],
       from: [Array],
       to: [Array],
       subject: [Array],
       'message-id': [Array],
       'content-transfer-encoding': [Array],
       date: [Array],
       'mime-version': [Array]
     }
   }
]
*/
exports.fetchemails = async (Imapconfig) => {
  let emailbody;
  imaps.connect(Imapconfig).then(function (connection) {
    return connection.openBox("INBOX").then(function () {
      var searchCriteria = ["UNSEEN"];

      var fetchOptions = {
        bodies: ["HEADER", "TEXT"],
        markSeen: false,
      };

      return connection
        .search(searchCriteria, fetchOptions)
        .then(function (results) {
          emailbody = results.map(function (res) {
            return res.parts.filter(function (part) {
              return part.which === "HEADER";
            })[0].body;
          });
        });
    });
  });
  return emailbody;
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
  /*
  const Imapconfig = {
    imap: {
      user: "pulsebs.softeng@gmail.com",
      password: "xssyjwawrmvrkgag",
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 3000,
    },
  };
  //checks for unread message
  this.fetchemails(Imapconfig);
  */
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

const moment = require("moment");
const knex = require("./../db");
let cron = require("node-cron");
var imaps = require("imap-simple");
let nodemailer = require("nodemailer");

let listOfEmails = ["pulsebs.softeng@gmail.com"];

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
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

exports.fetchemails = async (Imapconfig) => {
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
          var subjects = results.map(function (res) {
            return res.parts.filter(function (part) {
              return part.which === "HEADER";
            })[0].body.subject[0];
          });

          console.log(subjects);
        });
    });
  });
};

// 12 at nights scheduler runs this code
exports.startScheduler = () => {
  var Imapconfig = {
    imap: {
      user: "pulsebs.softeng@gmail.com",
      password: "xssyjwawrmvrkgag",
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      authTimeout: 3000,
    },
  };

  //this.fetchemails(Imapconfig);
  // (second minute hour dayofmonth(1-31) month(1-12) dayofweek(0-7))
  cron.schedule("0 0 0 * * *", () => {
    this.sendTeacherEmailTask();
  });
};

exports.sendTeacherEmailTask = () => {
  const today = moment();
 
  this.getListOfLectures(today).then((lectures) => {
    //console.log(res);
    const emailSubject = "Bookings for the lecture";
    for (lecture of lectures) {
      const emailBody = `Dear ${lecture.lecturerName} ${lecture.lecturerSurname},<br/> \
            We inform You that ${lecture.bookingsNumber} students booked a seat for ${lecture.name} of the course ${lecture.courseName} scheduled for ${lecture.start}<br/><br/>\
            Thanks,<br/>The PULSeBS Team`;
            console.log(emailBody);
      this.sendMail(lecture.lecturerEmail, emailSubject, emailBody);
    }
  });
}

exports.getListOfLectures = async (date) => {
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
    .count({ bookingsNumber: "lecture.id"})
    .from("lecture")
    .join("course", "lecture.course", "=", "course.id")
    .join("user", "lecture.lecturer", "=", "user.id")
    .join("lecture_booking", "lecture.id", "=", "lecture_booking.lecture_id")
    .where("lecture.start", ">=", date.format("YYYY-MM-DD HH:mm:ss"))
    .andWhere("lecture.start", "<", date.add(1, "days").format("YYYY-MM-DD HH:mm:ss"))
    .groupBy("lecture.id", "lecture.name", "course.name", "lecture.start", "user.name", "user.surname", "user.email");

  return queryResults;
};

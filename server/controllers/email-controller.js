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

  return new Promise((resolve, reject) => {
    let today = null;
    let tomorrow = null;
    // (second minute hour dayofmonth(1-31) month(1-12) dayofweek(0-7))
    cron.schedule(schedulePattern, () => {
      today = moment().format("YYYY-MM-DD HH:mm:ss");
      tomorrow = moment().add(1, "days").format("YYYY-MM-DD HH:mm:ss");
      this.getlistofemails(today, tomorrow).then((res) => {
        if (listOfEmails) for (email of listOfEmails) this.sendMail(email);
        if (today) resolve(today);
        else reject("error");
      });
    });
  });
};

exports.getlistofemails = async (startDate, endDate) => {
  let querystring = `select distinct * from lecture join user where lecture.lecturer==user.id  and lecture.start>='${startDate}' and  lecture.start<'${endDate}' `;

  knex
    .raw(querystring)
    .then((queryResults) => {
      res = queryResults;
    })
    .catch((err) => {
      res.json({
        message: `There was an error getting lecturers email who will have lecture today`,
      });
    });
};

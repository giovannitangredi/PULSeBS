const moment = require("moment");
const knex = require("./../db");
let cron = require("node-cron");
let nodemailer = require("nodemailer");
const today = moment().format("YYYY-MM-DD HH:mm:ss");
const dateShown = moment(today).add(2, "weeks");

exports.sendMail = async () => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.sina.com",
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "huanghaihangm@sina.com",
      pass: "5ccaacb63e81ab3e",
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "huanghaihangm@sina.com", // sender address
    to: "behnam263@yahoo.com", // list of receivers
    subject: "Hello ✔", // Subject line
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

exports.startScheduler = () => {
  cron.schedule("0 0 0 * * *", () => {
    this.sendMail();
  });
};

getlistofemails = () => {
  knex
    .select({ email: "email" })
    .from("lecture")
    .join("user", "lecture.lecturer", "=", "user.id")
    .Where("start", ">", today) //show only future lectures
    .andWhere("start", "<", dateShown) //show only lecture in two weeks
    .then((queryResults) => {
      res.json(queryResults);
    })
    .catch((err) => {
      res.json({
        message: `There was an error retrieving the student's lectures: ${err}`,
      });
    });
};

// Import database
const knex = require("./../db");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require("moment");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

const expireTime = 30 * 60;

// Get user data.
exports.get = async (req, res) => {
  const userId = req.user && req.user.id;
  knex
    .select("id", "name", "surname", "email", "role")
    .from("user")
    .where("id", userId)
    .then((queryResults) => {
      res.json(queryResults[0]);
    })
    .catch((err) => {
      res.json({
        message: `There was an error retrieving the details about the user: ${err}`,
      });
    });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  knex
    .select("id", "name", "surname", "password_hash", "email", "role","city","birthday","ssn")
    .from("user")
    .where("email", email)
    .then((queryResults) => {
      if (
        queryResults.length == 1 &&
        bcrypt.compareSync(password, queryResults[0].password_hash)
      ) {
        const userDetails = queryResults[0];
        const token = jsonwebtoken.sign({ id: userDetails.id }, jwtSecret, {
          expiresIn: expireTime,
        });
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: true,
          maxAge: 1000 * expireTime,
        });

        res.json({
          id: userDetails.id,
          name: userDetails.name,
          surname: userDetails.surname,
          email: userDetails.email,
          role: userDetails.role,
          city:userDetails.city,
          birthday:userDetails.birthday,
          ssn:userDetails.ssn
        });
      } else {
        throw new Error("Invalid credentials.");
      }
    })
    .catch((err) => {
      res.json({ message: `There was an error checking credentials: ${err}` });
    });
};

exports.logout = async (req, res) => {
  res.clearCookie("token").end();
};

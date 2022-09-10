const express = require("express");
const router = express.Router();
const db = require("./database");
const { signupValidation, loginValidation ,createListValid} = require("./validation");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

const cookieSession = require("cookie-session");

router.post("/register", signupValidation, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
      req.body.email
    )});`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({
          msg: "This user is already in use!",
        });
      } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err,
            });
          } else {
            // has hashed pw => add to database
            db.query(
              `INSERT INTO users (name, email, password) VALUES ('${
                req.body.name
              }', ${db.escape(req.body.email)}, ${db.escape(hash)})`,
              (err, result) => {
                if (err) {
                  throw err;
                  return res.status(400).send({
                    msg: err,
                  });
                }
                return res.status(201).send({
                  msg: "The user has been registerd with us!",
                });
              }
            );
          }
        });
      }
    }
  );
});
router.post("/create_list",  createListValid,(req, res, next) => {

  db.query(
    `INSERT INTO roomer ( schoolname,fullname, phone, email, address, member, amount_month, occupation,billelec,numbillelec
      ,name_using_w,num_using_w,using_pow,using_pow_amount,guss_amount,guss_size,guss_using,class,num,using_powBenzin,using_pow_amountBenzin) VALUES ( 
        '${req.body.schoolname}',    
        '${req.body.fullname}',
            '${req.body.phone}',
            '${req.body.email}',
            '${req.body.address}',
            '${req.body.member}',
            '${req.body.amount_month}',
            '${req.body.occupation}',
            '${req.body.billelec}',
            '${req.body.numbillelec}',
            '${req.body.name_using_w}',
            '${req.body.num_using_w}',
            '${req.body.using_pow}',
            '${req.body.using_pow_amount}',
            '${req.body.guss_amount}',
            '${req.body.guss_size}',
            '${req.body.guss_using}',
            '${req.body.class}',
            '${req.body.num}',
            '${req.body.using_powBenzin}',
            '${req.body.using_pow_amountBenzin}'
            )`,
    (err, result) => {

      if (result) {

        return res.status(200).send({
            msg: "seccess : true \n status API server 500 is ready!!",
        });
      } else {
        // username is available
        return res.status(500).send({
            msg: err,
          });
      }
      
    }

  );
});
router.post("/create_room", (req, res, next) => {

    db.query(
      `INSERT INTO room ( userid, name, link) VALUES ( '${req.body.userid}', '${req.body.name}', '${req.body.link}')`,
    
      (err, result) => {
        if (result) {
          return res.status(200).send({
              msg: "status ok",
          });
        } else {
          // username is available
          return res.status(500).send({
              msg: err,
            });
        }
      }
    );
  });

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 3600 * 1000, // 1hr
  })
);

router.post("/login", loginValidation, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result) => {
      // user does not exists
      if (err) {
        throw err;
        return res.status(400).send({
          msg: err,
        });
      }
      if (!result.length) {
        return res.status(401).send({
          msg: "Email or password is incorrect!",
        });
      }
      // check password
      bcrypt.compare(
        req.body.password,
        result[0]["password"],
        (bErr, bResult) => {
          // wrong password
          if (bErr) {
            throw bErr;
            return res.status(401).send({
              msg: "Email or password is incorrect!",
            });
          }
          if (bResult) {
            const token = jwt.sign(
              { id: result[0].id },
              "the-super-strong-secrect",
              { expiresIn: "1h" }
            );
            // db.query(
            //     `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
            // );
            // req.session.isLoggedIn = true;
            // req.session.userID = rows[0].id;
            return res.status(200).send({
              msg: "Logged in!",
              token,
              user: result[0],
            });
          }
          return res.status(401).send({
            msg: "Username or password is incorrect!",
          });
        }
      );
    }
  );
});
router.post("/get-user", signupValidation, (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1]
  ) {
    return res.status(422).json({
      message: "Please provide the token",
    });
  }
  const theToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(theToken, "the-super-strong-secrect");
  db.query(
    "SELECT * FROM users where id=?",
    decoded.id,
    function (error, results, fields) {
      if (error) throw error;
      return res.send({
        error: false,
        data: results[0],
        message: "Fetch Successfully.",
      });
    }
  );
});
router.get("/logout", (req, res) => {
  //session destroy
  req.session = null;
  // res.redirect('/');
});
router.get("/getlisr_roomer", (req, res, next) => {
  // if (
  //   !req.headers.authorization ||
  //   !req.headers.authorization.startsWith("Bearer") ||
  //   !req.headers.authorization.split(" ")[1]
  // ) {
  //   return res.status(422).json({
  //     message: "Please provide the token",
  //   });
  // }
  // const theToken = req.headers.authorization.split(" ")[1];
  // const decoded = jwt.verify(theToken, "the-super-strong-secrect");
  db.query(
    "SELECT * FROM roomer ",
 
    function (error, results, fields) {
      if (error) throw error;
      return res.send({
        error: false,
        data: results,
        message: "Fetch Successfully.",
      });
    }
  );
});
module.exports = router;

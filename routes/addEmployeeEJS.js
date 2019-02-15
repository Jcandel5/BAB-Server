const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const async = require("async");

router.get("/", isLoggedIn, (req, res, next) => {
  res.render("employee/addEmployee");
});

router.get("/error", (req, res) => {
  res.render("error");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const newUser = new User({
    username: req.body.username,
    adminCode: req.body.adminCode,
    email: req.body.email
  });
  if (req.body.adminCode === process.env.ADMIN_CODE) {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      return console.log(err);
    }

    passport.authenticate("local")(req, res, () => {
      if (req.body.adminCode === process.env.ADMIN_CODE) {
        res.redirect("/api/employee/admin");
      } else {
        res.redirect("/add/employee/error");
      }
      req.flash("success", "Welcome to Admin Portal!");
    });
  });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/admin/login",
  adminUser,
  passport.authenticate("local", {
    successRedirect: "/api/employee/admin",
    failureRedirect: "/add/employee/login"
  }),
  (req, res) => {
    req.flash("success", "Welcome to Admin Portal!");
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/add/employee/login");
});

router.get("/forgot", (req, res) => {
  res.render("forgotPassword");
});

router.post("/admin/forgot", function(req, res, next) {
  async.waterfall(
    [
      //token that is sent to email;
      //expires after an hour
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/add/employee/forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "austinloveless5171@gmail.com",
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: "austinloveless5171@gmail.com",
          subject: "Admin Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/add/employee/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log("mail sent");
          req.flash(
            "success",
            "An e-mail has been sent to " +
              user.email +
              " with further instructions."
          );
          done(err, "done");
        });
      }
    ],
    function(err) {
      if (err) return next(err);
      res.redirect("/add/employee/forgot");
    }
  );
});

router.get("/reset", (req, res) => {
  res.render("reset");
});

router.get("/reset/:token", function(req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    function(err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("reset", { token: req.params.token });
    }
  );
});

router.post("/admin/reset/:token", function(req, res) {
  async.waterfall(
    [
      function(done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
          },
          function(err, user) {
            if (!user) {
              req.flash(
                "error",
                "Password reset token is invalid or has expired."
              );
              return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function(err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
              });
            } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect("back");
            }
          }
        );
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "austinloveless5171@gmail.com",
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: "austinloveless5171@gmail.com",
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash("success", "Success! Your password has been changed.");
          done(err);
        });
      }
    ],
    function(err) {
      res.redirect("/api/employee/admin");
    }
  );
});

module.exports = router;

function adminUser(req, res, next) {
  if (req.body.adminCode === process.env.ADMIN_CODE) {
    next();
  } else {
    res.redirect("/add/employee/error");
  }
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/add/employee/error");
}

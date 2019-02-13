const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

router.get("/", isLoggedIn, (req, res, next) => {
  res.render("addEmployee");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/error", (req, res) => {
  res.render("error");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/register", (req, res) => {
  const newUser = new User({
    username: req.body.username,
    adminCode: req.body.adminCode
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
        res.redirect("/add/employee");
      } else {
        res.redirect("/add/employee/error");
      }
    });
  });
});

router.post(
  "/admin/login",
  adminUser,
  passport.authenticate("local", {
    successRedirect: "/add/employee"
  }),
  (req, res) => {
    res.send("success");
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/add/employee/login");
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

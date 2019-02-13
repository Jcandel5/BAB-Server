const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const port = process.env.PORT || 4000;
const employeeRoutes = require("./routes/employees");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user");
const addEmployeeRoutes = require("./routes/addEmployeeEJS");
const methodOverride = require("method-override");

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

app.use(
  require("express-session")({
    //used to encode and decode session
    secret: "employee stuff",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/", employeeRoutes);
app.use("/add/employee", addEmployeeRoutes);
// app.use("/*", (req, res) => {
//   res.render("NotFound");
// });

app.listen(port, () => {
  console.log("listening on port", port);
});

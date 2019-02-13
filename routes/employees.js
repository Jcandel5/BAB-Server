const express = require("express");
const router = express.Router();
const db = require("../models");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new aws.S3({
  apiVersion: "2006-03-01",
  region: "us-east-1",
  credentials: {
    secretAccessKey: process.env.SECRET_KEY,
    accessKeyId: process.env.ACCESS_KEY_ID
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      cb(null, Date.now().toString());
    }
  })
});

const singleUpload = upload.single("image");

router.get("/api/employee", (req, res) => {
  db.Employee.find({})
    .then(del => {
      res.json(del);
    })
    .catch(err => {
      res.send(err);
    });
});

router.post("/api/employee", (req, res) => {
  singleUpload(req, res, function(err, some) {
    if (err) {
      return res.status(422).send({
        errors: [{ title: "Image Upload Error", detail: err.message }]
      });
    }
    req.body.employee.image = req.file.location;

    db.Employee.create(req.body.employee, (err, newEmployee) => {
      if (err) {
        console.log("error creating employee", err);
      } else {
        res.render("success", { employee: newEmployee });
      }
    });
  });
});

router.get("/api/employee/:employeeId", (req, res) => {
  db.Employee.findById({ _id: req.params.employeeId })
    .then(employee => {
      res.json(employee);
    })
    .catch(err => {
      res.json(err);
    });
});

router.put("/api/employee/:employeeId", (req, res) => {
  db.Employee.findOneAndUpdate({ _id: req.params.employeeId }, req.body, {
    new: true
  })
    .then(function(video) {
      res.json(video);
    })
    .catch(function(err) {
      res.send(err);
    });
});

router.delete("/api/employee/:employeeId", (req, res) => {
  db.Employee.remove({ _id: req.params.employeeId })
    .then(function() {
      res.json({ message: "Employee deleted" });
    })
    .catch(function(err) {
      res.send(err);
    });
});

module.exports = router;

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

router.get("/", isLoggedIn, (req, res) => {
  db.Coupon.find({}, (err, coupon) => {
    if (err) {
      console.log(err);
    } else {
      res.render("coupon/listCoupons", { coupons: coupon });
    }
  });
});

router.get("/add", (req, res) => {
  res.render("coupon/addCoupon");
});

router.post("/add", isLoggedIn, (req, res) => {
  singleUpload(req, res, function(err, some) {
    if (err) {
      return res.status(422).send({
        errors: [{ title: "Image Upload Error", detail: err.message }]
      });
    }
    req.body.image = { image: req.file.location };

    db.Coupon.create(req.body.image, (err, newCoupon) => {
      if (err) {
        console.log("error creating employee", err);
      } else {
        req.flash("success", "Sucessfully Added a New Coupon");
        res.redirect("/admin/coupons");
      }
    });
  });
});

router.delete("/delete/:id", (req, res) => {
  db.Coupon.findByIdAndRemove({ _id: req.params.id }, (err, deleted) => {
    if (err) {
      console.log(err);
    } else {
      req.flash("success", "Deleted Coupon!");
      res.redirect("/admin/coupons");
    }
  });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/add/employee/error");
}

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/patientDB", {
  useNewUrlParser: true
});

const patientSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  doctor: String,
  date: String,
  phone: String,
  time: String,
  medic: String
});

patientSchema.plugin(passportLocalMongoose);

const Patient = new mongoose.model("Patient", patientSchema);

passport.use(Patient.createStrategy());

passport.serializeUser(Patient.serializeUser());
passport.deserializeUser(Patient.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/faq", function(req, res) {
  res.render("faq");
});

app.get("/appointments", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("appointments",{user: req.user});
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/book", function(req, res){
  if (req.isAuthenticated()) {
    res.render("book");
  } else {
    res.redirect("/login");
  }
});

app.post("/book", function(req, res){
  const submittedName = req.body.name;
  const submittedPhone = req.body.phone;
  const submittedDoctor = req.body.doctors;
  const submittedDate = req.body.date;
  const submittedTime = req.body.time;
  const submittedHistory = req.body.medic;

  Patient.findById(req.user.id, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        foundUser.name = submittedName;
        foundUser.doctor = submittedDoctor;
        foundUser.date = submittedDate;
        foundUser.time = submittedTime;
        foundUser.phone = submittedPhone;
        foundUser.medic = submittedHistory;
        foundUser.save(function(){
          res.redirect("appointments");
        });
      }
    }
  });
});


app.post("/register", function(req, res) {
  Patient.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/appointments");
      });
    }
  });
});

app.post("/login", function(req, res) {
      const user = new Patient({
        username: req.body.username,
        password: req.body.password
      });
      req.login(user, function(err){
        if(err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req, res, function() {
            res.redirect("/appointments");
          });
        }
      });
});
app.listen(2121, function() {
  console.log("Server started on port 3000.");
});

var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var exphbs = require('express-handlebars');

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.engine('handlebars', exphbs({defaultLayout: "main"}));
app.set('view engine', 'handlebars');

var routes = require("./controllers/controller.js");
app.use("/", routes);

mongoose.connect("mongodb://heroku_k6rk8rtl:2mfqgi5u4mbl6jg8bovgr0emcv@ds127781.mlab.com:27781/heroku_k6rk8rtl");

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
mongoose.Promise = Promise;

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: "main"}));
app.set('view engine', 'handlebars');

var routes = require("./controllers/controller.js");
app.use("/", routes);

mongoose.connect("mongodb://heroku_k6rk8rtl:2mfqgi5u4mbl6jg8bovgr0emcv@ds127781.mlab.com:27781/heroku_k6rk8rtl");

app.listen(PORT, function() {
  console.log("App running on PORT " + PORT);
});

var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
mongoose.Promise = Promise;

var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

router.get("/", function(req, res) {
  res.render("index");
});

router.get("/save", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      var ArticleObject = {
        articles: doc
      };
      res.render("save", ArticleObject);
    }
  });
});


router.post("/scrape", function(req, res) {
  request("http://www.nytimes.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("article h2").each(function(i, element) {
      var result = {};
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
    });
    res.render("index");
  });
});


router.post("/save", function(req, res) {
  var newArticleObject = {};
  newArticleObject.title = req.body.title;
  newArticleObject.link = req.body.link;
  var entry = new Article(newArticleObject);
  entry.save(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(doc);
    }
  });
  res.redirect("/save");
});


router.get("/delete/:id", function(req, res) {
  Article.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log("OK");
    }
    res.send(doc);
    res.redirect("/save");
  });
});


router.get("/articles/:id", function(req, res) {
  Article.findOne({"_id": req.params.id})
  .populate('notes')
  .exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      res.json(doc);
    }
  });
});


router.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(err, doc) {
    if (error) {
      console.log(err);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {notes: doc._id}}, {new: true})
      .populate('notes')
      .exec(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          res.send(doc);
        }
      });
    }
  });
});

module.exports = router;

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
      var ArticleO = {
        articles: doc
      };
      res.render("save", ArticleO);
    }
  });
});


router.post("/scrape", function(req, res) {
  request("http://www.nytimes.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    var scraped = {};
    $("article h2").each(function(i, element) {
      var result = {};
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      scraped[i] = result;
    });
    var ArticleO = {
        articles: scraped
    };
    res.render("index", ArticleO);
  });
});


// posts to the saved route
router.post("/save", function(req, res) {
  var newArticle = {};

  newArticle.title = req.body.title;
  newArticle.link = req.body.link;
  var entry = new Article(newArticle);
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
  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log(err);
    } else {
      console.log("OK");
    }
    res.redirect("/save");
  });
});


router.get("/notes/:id", function(req, res) {
  Note.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log("OK");
    }
    res.send(doc);
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
      console.log(doc);
      res.json(doc);
    }
  });
});


router.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {notes: doc._id}}, {new: true, upsert: true})
      .populate('notes')
      .exec(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log(doc.notes);
          res.send(doc);
        }
      });
    }
  });
});

// Export routes for server.js
module.exports = router;

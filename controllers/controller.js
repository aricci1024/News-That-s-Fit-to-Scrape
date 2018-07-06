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
var router = express.Router();
var request = require("request");


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);



app.get("/", function (req, res) {
    res.send("index");
});


app.get("/save", function(req, res) {
    Article.find({})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
    res.render("save");
});


app.get("/scrape", function(req, res) {
    axios.get("http://www.echojs.com/").then(function(response) {
      var $ = cheerio.load(response.data);
  
      $("article h2").each(function(i, element) {
            var result = {};
    
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");
    
                db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    return res.json(err);
                });
      });
        res.redirect("index");
    });
});
  

app.post("/save", function(req, res) {
    var addArticle = {};
    addArticle.title = req.body.title;
    addArticle.link = req.body.link;
    var entry = new Article(addArticle);
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


app.get("/delete/:id", function(req, res) {
    Article.findOneAndRemove({"_id": req.params.id})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
    res.redirect("/save");
});


app.get("/notes/:id", function(req, res) {
    Note.findOneAndRemove({"_id": req.params.id})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
    res.send(dbArticle);
  });


app.get("/articles/:id", function(req, res) {
    Article.findOne({"_id": req.params.id})
    .populate('notes')
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});
  
  
app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
    .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
});


  module.exports = router;
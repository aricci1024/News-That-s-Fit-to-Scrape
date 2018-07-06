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
    Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
        if (err) {
            console.log(err);
        } else {
            console.log("Ok");
        }
    });
    res.redirect("/save");
  });

  
  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .populate("notes")
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route to see notes we have added
  app.get("/notes", function (req, res) {
    // Find all notes in the note collection with our Note model
    Note.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
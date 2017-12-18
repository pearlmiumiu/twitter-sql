'use strict';
var express = require('express');
var router = express.Router();
// var tweetBank = require('../tweetBank');
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT * FROM tweets', function (err, result) {
      console.log(result);
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }

  function respondWithAllUsers(req, res, next){
    client.query('SELECT * FROM users JOIN tweets on users.id=tweets.user_id', function(err, result){
      if (err) return next(err);
      var content=result.rows;
      res.render('index', {title: 'Twitter.js', tweets: content, showForm: true });
    })
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllUsers);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    client.query('SELECT * FROM users JOIN tweets on users.id=tweets.user_id where name=$1',[req.params.username], function(err, result) {
      if (err) return next(err);
      // var id=result.rows[0].id;
      // console.log(result.rows);
      // var name=result.rows[0].name;
      // client.query('SELECT * FROM tweets WHERE id=$1',[id], function(err, result){
      //   if (err) return next(err);
        var tweets=result.rows;
        //console.log(result.rows);
        res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });

      })
  });


//};

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){

    client.query('SELECT * FROM users JOIN tweets on users.id=tweets.user_id WHERE users.id=$1', [req.params.id], function(err, result) {
      if (err) return next(err);
      console.log(result);

    })









    // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsWithThatId // an array of only one element ;-)
    //});
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var newTweet = tweetBank.add(req.body.name, req.body.content);
    io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}

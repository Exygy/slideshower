
/**
 * Module dependencies.
 */


Instagram = require('instagram-node-lib');

// --- mongodb
require( './db' );
var mongoose = require('mongoose');
//load necessary models
var Photo = mongoose.model('Photo');
// ---

var express = require('express.io');
var blade = require('blade');
var routes = require('./routes');
var http = require('http');
var https = require('https');
var path = require('path');
var async = require('async');
// var redis = require('redis');
// var db = redis.createClient();

var app = express();
app.http().io();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(blade.middleware(__dirname + '/views') ); //for client-side templates
app.set('views', __dirname + '/views');
app.set('view engine', 'blade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  var IG = require('./instagram_config.json');
  // Instagram.set('client_id', IG.client_id);
  // Instagram.set('client_secret', IG.client_secret);
  Instagram.set('access_token', IG.access_token);
} else if(process.env.IG_ACCESS_TOKEN) {
  Instagram.set('access_token', process.env.IG_ACCESS_TOKEN);
}

// for dumb ol' heroku
app.io.configure(function() {
  app.io.set("transports", ["xhr-polling"]); 
  app.io.set("polling duration", 10); 
});

//------------------------
// ------- ROUTES -------
app.get('/', routes.index);

// shouldnt need this any more
app.get('/live_subscribe', function(req, res) {
  console.log(req.query);
  res.send(req.query['hub.challenge'])  
});



// get live updates from Instagram!!! 
app.post('/live_update', function(req, res) {
  console.log(' -- hitting live update -- ')
  if (!req.headers['x-hub-signature']) {
    console.log(' nooo! ')
    res.send('nooooo!');
    return;
  }
  if (req.body && req.body.length) {
    console.log(' -- req.body found, length = ' + req.body.length)

    // load the latest however many (+1 just because why not)
    loadInstagrams({
      count: (req.body.length+1),
      callback: function(photo) {
        app.io.broadcast('new_photo', photo);
      }
    });


  } else {
    console.log('ERR!!!');
  }

  // Photo.findOne({}).sort('created_time').exec(function(err, photo) {
  //   app.io.broadcast('new_photo', photo);
  // });
  res.send('thx doodz.')
});

// load instagram images into DB 
app.get('/load_into_db', function(req, res){
  // Instagram.tags.info({ name: 'kenzanddave' });

  loadInstagrams();
  res.send('!!!')
});

// app.io.route('beeper', function(req) {
// });



//------------------------
//-- Helper funcs 
function loadInstagrams(passed) {
  var opts = { 
    name: 'kenzanddave',
    count: 35,
    complete: function(data, pagination){
      console.log(data.length);
      // console.log(data);
      console.log(pagination);

      // setting a passed.count will cancel the auto-pagination
      if (pagination.next_max_id && !(passed && passed.count)) {
        console.log("NEXT MAX ID == " + pagination.next_max_id);
        loadInstagrams({max_tag_id: pagination.next_max_id});
      }

      async.each(data, function(img, callback) {
          var cb = (passed && passed.callback) ? passed.callback : null;
          saveInstagramPhoto(img, cb);
          callback(null);
        }, 
        function (err) {if (err) console.log ('there was an error! ')}
      );

    },
    error: function(errorMessage, errorObject, caller) {
      console.log("WTF >> "+errorMessage);
    }
  };

  // use custom options if passed 
  if (passed && passed.count) {
    opts.count = passed.count
  }
  if (passed && passed.max_tag_id) {
    opts.max_tag_id = passed.max_tag_id;
  }

  // now hit the Instagram API with our opts...
  Instagram.tags.recent(opts);
}

function saveInstagramPhoto(img, callback) {
  Photo.findOne({instagram_id: img.id}).exec(function(err, photo) { 
    if (!err) { 
      // handle result
      if (photo) {
        console.log('found already! ' + photo.instagram_id);
      } else {
        var photo = new Photo ({
          instagram_id: img.id,
          url: img.images.standard_resolution.url,
          created_time: img.created_time,
          caption: img.caption ? img.caption.text : null,
          user: {
            username: img.user.username,
            profile_picture: img.user.profile_picture
          }
        });

        // Saving it to the database.  
        photo.save(function (err) {
          if (err) console.log ('Error on save!');
          else console.log('saved. ' + photo.instagram_id);
        });

      }
      //TODO: only does this for new ones!
      if (photo && callback) {
        callback(photo);
      }


    } 
  });

}

// -----------------------
// ------- LISTEN! -------
app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});









// -- test 
app.get('/test', function(req, res) {
  var request = require('request');
  var ig_json = [
    {
        "subscription_id": "1",
        "object": "user",
        "object_id": "490213874736622185_11302361",
        "changed_aspect": "media",
        "time": 1297286541
    }
  ];

  request.post({
    url: 'http://localhost:3000/live_update',
    headers: {
      'Content-Type': 'application/json',
      'X-Hub-Signature': 'deepdoop'
    },
    body: JSON.stringify(ig_json)
  }, function(error, response, body){
    //
    console.log(body);
  });

  res.send('done testing.');
});

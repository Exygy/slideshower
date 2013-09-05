
/**
 * Module dependencies.
 */

var express = require('express.io');
var routes = require('./routes');
var live_update = require('./routes/live_update');
var http = require('http');
var path = require('path');
// var redis = require('redis');
// var db = redis.createClient();

var app = express();
app.http().io();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// for dumb ol' heroku
app.io.configure(function() {
  app.io.set("transports", ["xhr-polling"]); 
  app.io.set("polling duration", 10); 
});

// ------- ROUTES -------
app.get('/', routes.index);
app.get('/live_update', live_update.subscribe);

app.get('/yeah', function(req, res) {
  app.io.broadcast('beep', {f: 'yes'});
  res.send('yeah.')
});

// app.io.route('beeper', function(req) {
// });



// -------
// LISTEN!
app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//--- mongodb ------
var mongo = require('mongodb');
var mongoose = require ("mongoose");
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:27017/slideshower';
// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(mongoUri, function (err, res) {
  if (err) { 
  console.log ('ERROR connecting to: ' + mongoUri + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + mongoUri);
  }
});


// ----- models
var photoSchema = new mongoose.Schema({
  api_id: String,
  api_type: String,
  url: String,
  caption: String,
  created_time: Number,
  user: {
    username: String,
    profile_picture: String
  }
});

// photoSchema.set('autoIndex', false); // F it y not
photoSchema.index({api_id: 1, api_type: 1})

var Photo = mongoose.model('Photo', photoSchema);

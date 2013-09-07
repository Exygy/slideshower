//load necessary models
var mongoose = require('mongoose');
var Photo = mongoose.model('Photo');

// exports.index = function(req, res) {
//   res.render('index', { title: 'Slideshower' });
// };

exports.index = function(req, res) {
  Photo.find({}).limit(10).sort('-created_time').exec(function(err, photos) {
    res.render('slideshow', {
      photos: photos
    });    
  });
}
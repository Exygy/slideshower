//socket.io 
var io = io.connect()
io.on('new_photo', function(photo){
  console.log('WE GOTS A NEW PHOTO!');
  console.log(photo);
  photo.viewCount = 0; 
  Slider.add(photo);
});


var Slider = {
  slides: [],
  originalLength: 0,
  current_id: null,
  queue: [],
  transitionTime: 1700,
  delayTime: 11000,
  animating: false,
  timer: null,

  next: function() {
    this.increment();
    this.render();
  },
  render: function() {
    self = this;
    if (this.animating) return false; 
    this.animating = true; 
    blade.Runtime.loadTemplate("slide.blade", function(err, tmpl) {
      var currentSlide = self.current();
      currentSlide.viewCount++;
      tmpl(currentSlide, function(err, slide_html) {
        var rand = 30 + Math.floor(Math.random()*60);
        var sign = (Math.random() < 0.5) ? '-' : '+';
        // move .current to .old
        $('#slider .old').html($('#slider .current').html()).css({boxShadow: '0 0 0', opacity: 1, rotate: 0, scale: 1, rotate3d: '0,0,0,0'}).transition({
            opacity: 0,
            rotate: sign+'='+rand+'deg',
            scale: 2.25,
            easing: 'ease',
            // rotate3d: '1,1,0,80deg',
            duration: self.transitionTime
          }
        );
        // load new .current
        $('#slider .current').css('opacity', 0).html(slide_html)
        $('#slider .current .moment').text( moment.unix(parseInt($('.moment').data('timestamp'))).fromNow() );
        $('#slider .current').transition({
            opacity: 1,
            duration: self.transitionTime * 1.2,
            easing: 'easeInQuad'
          },
          function() {
            self.animating = false; 
          }
        );
      });
    });

    // return this.current_id; 

  },

  current: function() {
    //current_id is an _id
    return _.findWhere(this.slides, {_id: this.current_id});
  },
  increment: function() {
    if (id = this.queue.shift()) {
      this.clearAlert();
      this.current_id = id;
    } else if (this.slides.length > 1) {
      // randomize but also sort by least viewed 
      // TODO: do we want to "highlight" the new additions? 
      this.slides = _.sortBy(_.shuffle(this.slides), 'viewCount');

      // just another little check in case we're about to see the same slide again 
      var i = 0; 
      while (i < 10 && this.slides[0]._id == this.current_id) {
        this.slides = _.shuffle(this.slides);
        // also just in case we get stuck for some reason 
        i++; 
      }
      this.current_id = this.slides[0]._id;
      // console.log(this.current_id);
    }

  },
  enqueue: function(i) {
    // remove i from queue
    this.queue = _.without(this.queue, i);
    // now push to front
    this.queue.push(i);
  },
  add: function(photo) {
    if (_.findWhere(this.slides, {instagram_id: photo.instagram_id})) {
      return false; 
    }
    // preload 
    $('<img/>')[0].src = photo.url;
    $('<img/>')[0].src = photo.user.profile_picture;

    this.slides.push(photo);
    // queue him up
    this.enqueue(photo._id);
    this.alert()
  },
  preload: function() {
    // first preload all images 
    // http://stackoverflow.com/questions/476679/preloading-images-with-jquery
    $(this.slides).each(function(){
      $('<img/>')[0].src = this.url;
      $('<img/>')[0].src = this.user.profile_picture;
    });
  },
  start: function() {
    this.next();
    var self = this; 
    this.timer = window.setInterval(function() {self.next();}, this.delayTime)
  },
  stop: function() {
    window.clearInterval(this.timer);
  },


  alert: function(clear) {
    $('#new').show(0).stop().css({right: -500, opacity: 0}).transit({
      right: -100, opacity: 1, duration: 770, easing: 'easeOutBack'
    });
  },
  clearAlert: function() {
    $('#new').transit({
      opacity: 0, 
      duration: this.transitionTime * 1.33, 
      easing: 'easeInSine'
    });
  }

}


$(function() {
  Slider.preload();
  _.each(Slider.slides, function(slide){ slide.viewCount = 0; });
  Slider.start();
  // Slider.originalLength = Slider.slides.length; 
  // Slider.next();
})








/*
p = {"instagram_id":"281307455758330158_11302361","url":"http://distilleryimage6.s3.amazonaws.com/83ef3fc2ff9311e1ba4022000a1e8932_7.jpg","created_time":"1347754483","caption":"#kenzanddave","_id":"522edce06696c167e9000005","__v":0,"user":{"username":"sfhusker","profile_picture":"http://images.ak.instagram.com/profiles/profile_11302361_75sq_1375563596.jpg"}}
Slider.add(p)

$('#slider').data('nivo:vars').self.append(p)

*/
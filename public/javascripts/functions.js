//socket.io 
var io = io.connect()
io.on('new_photo', function(photo){
  console.log('WE GOTS A NEW PHOTO!');
  console.log(photo);
  Slider.add(photo);
});


var Slider = {
  slides: [],
  currentSlide: 1,
  queue: [],
  transitionTime: 1700,
  delayTime: 10000,
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
      tmpl(self.current(), function(err, slide_html) {

        var rand = 30 + Math.floor(Math.random()*70);
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
        $('.moment').text( moment.unix(parseInt($('.moment').data('timestamp'))).fromNow() );
        $('#slider .current').transition({
            opacity: 1,
            duration: self.transitionTime * 1,
            easing: 'easeInQuad'
          },
          function() {
            self.animating = false; 
          }
        );
      });
    });

    return this.currentSlide; 

  },

  current: function() {
    //currentSlide is a countable number (1,2,3) so we -1
    return this.slides[this.currentSlide-1];
  },
  increment: function() {
    if (pos = this.queue.shift()) {
      this.clearAlert();
      this.currentSlide = pos;
    } else {
      //TODO: could also go to random?? 
      this.currentSlide++; 
    }
    if (this.currentSlide > this.slides.length) {
      this.currentSlide = 1; 
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
    this.slides.push(photo);
    var pos = this.slides.length; 
    // queue him up
    this.enqueue(pos);
    this.alert()
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
    $('#new').show(0).stop().css({right: -500, opacity: 0}).transit({right: -100, opacity: 1, duration: 770, easing: 'easeOutBack'})
  },
  clearAlert: function() {
    $('#new').fadeOut(500);     
  }

}


$(function() {
  Slider.start();
  // Slider.next();
})









//nivoSlider
// var nivoOpts = {
//       effect: 'sliceDownLeft,sliceUpDown,sliceUpDownLeft,fade,boxRandom',
//       // randomStart: true,
//       // controlNav: false,
//       animSpeed: 1200,
//       pauseTime: 5000,

//       beforeChange: function() {
//         // console.log($('#slider').data('nivo:vars').currentSlide);
//         $('.info:visible').fadeOut(1800);
//       },
//       afterChange: function() {
//         showSlideInfo();
//         if ($('#slider').data('nivo:vars').nextRandom) {
//           // $('#slider').data('nivo:vars').nextRandom = false;
//           var rando = Math.floor(Math.random() * $('#slider').data('nivo:vars').totalSlides);
//           // console.log("SETTING TO RANDO: "+rando);
//           $('#slider').data('nivo:vars').currentSlide = rando;
//         }
//       },
//       afterLoad: function() {
//         showSlideInfo();
//       }

//     };

// $(function() {
//   if ($('#slider').length) {
//     $('#slider').nivoSlider(nivoOpts);
//   }
// });

// function showSlideInfo() {
//   var photo_id = $('#slider').data('nivo:vars').currentImage.data('photo-id');
//   $('.info[data-photo-id="'+photo_id+'"]').fadeIn(150);  
// }





/*
p = {"instagram_id":"281307455758330158_11302361","url":"http://distilleryimage6.s3.amazonaws.com/83ef3fc2ff9311e1ba4022000a1e8932_7.jpg","created_time":"1347754483","caption":"#kenzanddave","_id":"522edce06696c167e9000005","__v":0,"user":{"username":"sfhusker","profile_picture":"http://images.ak.instagram.com/profiles/profile_11302361_75sq_1375563596.jpg"}}
Slider.add(p)

$('#slider').data('nivo:vars').self.append(p)

*/
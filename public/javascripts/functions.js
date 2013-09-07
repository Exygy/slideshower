//socket.io 
var io = io.connect()
io.on('new_photo', function(photo){
  console.log('WE GOTS A NEW PHOTO!');
  console.log(photo);
  $('#slider').data('nivo:vars').self.append(photo)
});


//nivoSlider
var nivoOpts = {
      effect: 'sliceDownLeft,sliceUpDown,sliceUpDownLeft,fade,boxRandom',
      // randomStart: true,
      // controlNav: false,
      animSpeed: 1200,
      pauseTime: 5000,

      beforeChange: function() {
        // console.log($('#slider').data('nivo:vars').currentSlide);
        $('.info:visible').fadeOut(1800);
      },
      afterChange: function() {
        showSlideInfo();
        if ($('#slider').data('nivo:vars').nextRandom) {
          // $('#slider').data('nivo:vars').nextRandom = false;
          var rando = Math.floor(Math.random() * $('#slider').data('nivo:vars').totalSlides);
          // console.log("SETTING TO RANDO: "+rando);
          $('#slider').data('nivo:vars').currentSlide = rando;
        }
      },
      afterLoad: function() {
        showSlideInfo();
      }

    };

$(function() {
  if ($('#slider').length) {
    $('#slider').nivoSlider(nivoOpts);
  }
});

function showSlideInfo() {
  var photo_id = $('#slider').data('nivo:vars').currentImage.data('photo-id');
  $('.info[data-photo-id="'+photo_id+'"]').fadeIn(150);  
}


/*
p = {url: 'http://distilleryimage3.s3.amazonaws.com/315f7610f42411e29ff222000aa8009c_7.jpg', id: '522ae01f7779ec9f5900000e'}
$('#slider').data('nivo:vars').self.append(p)

*/
(function() {

  var VIDEO_WIDTH = 480;
  var VIDEO_HEIGHT = 300;
  var VIDEO_HALF_HEIGHT = VIDEO_HEIGHT / 2;
  var RECALCULATE_INTERVAL = 150;
  var VIDEO_IDS = [
    "9JnjOb4Qu0k", // Brushbot
    "-FpA77S7r7c", // Andrew Bird
    "mQI6r_kc3ZE", // Digital freedom
    "pmfHHLfbjNQ", // Big Ideas: Don't Get Any
    "9hBpF_Zj4OA"  // Rotate
  ];

  // To adjust some of the videos that are too loud
  var VOLUME_LEVELING = [
    1.0,
    1.0,
    1.0,
    1.0,
    0.4
  ];


  var ready = false;
  var readyCount = 0;
  var invalidated = false;
  var videoElements = [];
  var players = [];
  var viewportHalfHeight = window.innerHeight / 2;
  var videosContainer = $('#videos');
  var videoDistanceCtrl = $('#video-distance');
  var videoDistanceDisplay = $('#video-distance-display');
  var audibleDistanceCtrl = $('#audible-distance');
  var audibleDistance = audibleDistanceCtrl.val();
  var audibleDistanceDisplay = $('#audible-distance-display');
  var minVolumeCtrl = $('#min-volume');
  var minVolume = minVolumeCtrl.val();


  //
  // Volume control
  //

  // Returns an integer from 0 to 100 based on the provided distance
  var volumeFunction = function(distance, level) {
    var diff = audibleDistance - distance;

    if (diff < 0)
      return minVolume;


    return Math.round(level * ((diff / audibleDistance) * (100 - minVolume) + minVolume));
  };

  // Determines the volume for each video based on distance from the screen.
  var recalculateVolume = function() {
    if (!ready || !invalidated) return;

    console.log('Recalculating volume');

    // Determine distances from the center of the screen
    for (var i = 0, len = videoElements.length; i < len; i++) {
      var distance = Math.abs((videoElements[i].offsetTop + VIDEO_HALF_HEIGHT) - (window.scrollY + viewportHalfHeight));
      players[i].setVolume(volumeFunction(distance, VOLUME_LEVELING[i]));
    }

    invalidated = false;
  };

  setInterval(recalculateVolume, RECALCULATE_INTERVAL);


  //
  // Animating the videos
  //

  var animateDistance = function() {
    var distance = videoDistanceCtrl.val();

    var animatedVideos = $('.video');
    var animationOptions = {
      duration: 'slow',
      step: function() {
        invalidated = true;
      }
    };

    animatedVideos.animate({
      marginTop: distance
    }, animationOptions);
  };


  //
  // Handling events
  //

  $(window).bind('scroll', function() {
    invalidated = true;
  });

  $(window).bind('resize', function() {
    viewportHalfHeight = window.innerHeight / 2;
    invalidated = true;
  });

  // Invoked on every numeric change in the distance input. Begins a wait
  // timer internally to begin the animation
  var timerId = 0;

  // Invoked when the video distance control changes its value
  var distanceInputChange = function() {
    videoDistanceDisplay.text(videoDistanceCtrl.val());
    clearTimeout(timerId);
    timerId = setTimeout(animateDistance, 1000);
  };

  videoDistanceCtrl.bind('input', distanceInputChange);

  // Invoked when the audible distance control changes its value
  var audibleDistanceInputChanged = function() {
    audibleDistance = audibleDistanceCtrl.val();
    audibleDistanceDisplay.text(audibleDistance);
    invalidated = true;
  };

  audibleDistanceCtrl.bind('input', audibleDistanceInputChanged);

  // Invoked when the minimum volume control changes its value
  var minVolumeChanged = function() {
    minVolume = minVolumeCtrl.val();
    invalidated = true;
  };

  minVolumeCtrl.bind('input', minVolumeChanged);

  // Invoked when the begin button is pressed
  var beginPressed = function() {
    $('#begin').hide();
    $('#begun-message').show().delay(800).fadeOut();
    players.forEach(function(player) {
      player.playVideo();
    });
  };

  $('#begin').click(beginPressed);


  //
  // Video loading
  //

  // Invoked when all videos are ready
  var videosReady = function() {
    console.log('Videos ready');

    $('.hint').hide();
    $('input,select,button').removeAttr('disabled');

    ready = true;
    invalidated = true;
  };

  // Begins the loading of a single video
  var loadVideo = function(videoId) {
    var elementId = 'video-' + videoId;
    var playerId = elementId + '-player';

    // Construct element
    var videoElement = $('<div class="video" id="' + elementId + '"><div id="' + playerId + '"></div></div>')
      .appendTo(videosContainer);

    // Inject SWF
    var params = { allowScriptAccess: "always" };

    // The element id of the Flash embed
    var attrs = {};

    // All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
    swfobject.embedSWF("http://www.youtube.com/v/" + videoId + "?version=3&enablejsapi=1&loop=1&playlist=" + videoId + "&playerapiid=" + elementId,
      playerId, VIDEO_WIDTH, VIDEO_HEIGHT, "9", null, null, params, attrs, function() {
        var element = document.getElementById(elementId);
        videoElements.push(element)
        players.push(element.querySelector('object'));
      });
  };

  // Invoked each time a YouTube player is ready
  window.onYouTubePlayerReady = function(elementId) {
    console.log('Video ready: ' + elementId);

    // Fire the all ready
    if (++readyCount == VIDEO_IDS.length)
      videosReady();
  };

  // Load everybody up
  VIDEO_IDS.forEach(loadVideo);
})();
(function() {
  //
  // Constants
  //

  var VIDEO_WIDTH = "480";
  var VIDEO_HEIGHT = "300";
  var RECALCULATE_INTERVAL = 100;

  // Define the videos to be displayed
  // XXX consider pulling randomly from the API
  var VIDEO_IDS = [
    "9JnjOb4Qu0k",
    "-FpA77S7r7c",
    "mQI6r_kc3ZE",
    "9hBpF_Zj4OA"
  ];


  //
  // Globals
  //

  var ready = false;
  var invalidated = false;
  var videoElements = [];
  var players = [];
  var videosContainer = $('#videos');
  var videoDistanceCtrl = $('#video-distance');
  var audibleDistanceCtrl = $('#audible-distance');
  var audibleDistance = audibleDistanceCtrl.val();


  //
  // Volume control
  //

  // Determines the volume for each video based on distance from the screen.
  var recalculateVolume = function() {
    if (!ready || !invalidated) return;

    console.log('recalculateVolume')

    invalidated = false;
  };

  setInterval(RECALCULATE_INTERVAL, recalculateVolume);


  //
  // Animating the videos
  //

  var animateDistance = function() {
    var distance = videoDistanceCtrl.val();

    var animatedVideos = $('.video:first-child').nextAll()

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
  // Controls
  //

  // Invoked on every numeric change in the distance input. Begins a wait
  // timer internally to begin the animation
  var timerId = 0;

  // Invoked when the video distance control changes its value
  var distanceInputChange = function() {
    clearTimeout(timerId);
    timerId = setTimeout(animateDistance, 1000);
  };

  $('#video-distance').bind('input', distanceInputChange);

  // Invoked when the audible distance control changes its value
  var audibleDistanceInputChanged = function() {
    audibleDistance = audibleDistanceCtrl.val();
    invalidated = true;
  };

  audibleDistanceCtrl.bind('input', audibleDistanceInputChanged);

  // Invoked when the begin button is pressed
  var beginPressed = function() {
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
    $('#begin').removeAttr('disabled');
    $('input').removeAttr('disabled');

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
      playerId, VIDEO_WIDTH, VIDEO_HEIGHT, "9", null, null, params, attrs);
  };

  // Invoked each time a YouTube player is ready
  window.onYouTubePlayerReady = function(elementId) {
    console.log('Video ready: ' + elementId);

    // Record the video for later access
    var element = document.getElementById(elementId);
    videoElements.push(element)
    players.push(element.querySelector('object'));

    // Fire the all ready
    if (players.length == VIDEO_IDS.length)
      videosReady();
  };

  // Load everybody up
  VIDEO_IDS.forEach(loadVideo);
})();
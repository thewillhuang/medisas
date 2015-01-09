var Twitter = require('node-tweet-stream');
var t = new Twitter({
    consumer_key: '8AqQCy7umStCyNN356v7fw',
    consumer_secret: 'vOvKV1QwuS1AeKPMIvJqErBxW7i1N12OL4UY2tNMs0c',
    token: '29463499-9Og6hxW4HqFxcQyIrAdmLpbAnrwIk290ghOE0ez5f',
    token_secret: 'elXVYJRFmFFit3PiVTmI9eU0IvHqqD7H4yeEmClJ8c'
  });
var moment = require('moment');
var rollingWindowInMin = 5;
var tempObj = {};
var refreshRateInMs = 1000;

t.on('tweet', function (tweet) {
  if (tweet.retweeted_status !== undefined) {
    var tweetText = tweet.retweeted_status.text;
    var retweetCount = tweet.retweeted_status.retweet_count;
    tempObj[retweetCount] = tweetText;
  }
});

t.on('error', function (err) {
  console.log('Oh no');
});

t.track('all');


var logTopTen = function() {
  var keyArray = Object.keys(tempObj);
  for (var i = keyArray.length - 1; i >= keyArray.length - 11; i--) {
    console.log('text', tempObj[keyArray[i]]);
    console.log('retweets', keyArray[i]);
  }
  console.log('===========================================', moment().format("dddd, MMMM Do YYYY, h:mm:ss a"));
};

var logEverySec = setInterval(logTopTen, refreshRateInMs);
var reset = setTimeout(tempObj = {}, rollingWindowInMin*1000*60);

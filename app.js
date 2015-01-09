var moment = require('moment');
var _ = require('lodash');
var Twitter = require('node-tweet-stream');
var t = new Twitter({
  consumer_key: '8AqQCy7umStCyNN356v7fw',
  consumer_secret: 'vOvKV1QwuS1AeKPMIvJqErBxW7i1N12OL4UY2tNMs0c',
  token: '29463499-9Og6hxW4HqFxcQyIrAdmLpbAnrwIk290ghOE0ez5f',
  token_secret: 'elXVYJRFmFFit3PiVTmI9eU0IvHqqD7H4yeEmClJ8c'
});

var tempObj = {};
var keyArray = [];
var windowArray = [];

//user defined variables
var rollingWindowInMin = 1;
var refreshRateInMs = 1000;
var rollingWindowInMs = rollingWindowInMin * 1000 * 60;

t.on('tweet', function (tweet) {
  if (tweet.retweeted_status !== undefined) {
    var tweetText = tweet.retweeted_status.text;
    var retweetCount = tweet.retweeted_status.retweet_count;
    tempObj[Date.now()] = {
      text: tweetText,
      count: retweetCount
    };
  }
});

t.on('error', function (err) {
  console.log('something is wrong with the stream');
});

t.track('all');

var logTopTenText = function() {
  //resets top10 so it rebuilds on each run of the function
  var top = 0;
  var topten = [];

  //identify the proper time ranges to build the top 10
  //with the help of a filter function to disgard time ranges that does not apply
  keyArray = Object.keys(tempObj);
  windowArray = _.filter(keyArray, function(num) {
    if (num >= Date.now() - rollingWindowInMs) {
      return num;
    }
  });

  //build top10
  for (var i = 0; i < windowArray.length - 1; i++) {
    if (tempObj[windowArray[i]].count > top) {
      topten.push({
        text: tempObj[windowArray[i]].text,
        count: tempObj[windowArray[i]].count
      });
      top = topten[topten.length - 1].count;
    }
  }
  //removes elemnts from top10 when the list is greater then 10
  // if (topten.length > 10) {
  //   topten.shift();
  // }

  console.log('key Array Length', keyArray.length);
  console.log('window Array Length', windowArray.length);
  console.log('top number', top);
  console.log(topten.length);
  console.log(topten);
  console.log('===========================================', moment().format("dddd, MMMM Do YYYY, h:mm:ss a"));
};

var logEverySec = setInterval(logTopTenText, refreshRateInMs);

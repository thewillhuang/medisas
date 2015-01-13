var _ = require('lodash');
var moment = require('moment');
var config = require('./config.js').config;
var Twitter = require('node-tweet-stream');
var t = new Twitter(config);
var tempObj = {};
var keyArray;
var windowArray;


//user defined variables
var rollingWindowInMin = 1;
var rollingWindowInMs = rollingWindowInMin * 1000 * 60;

t.on('tweet', function (tweet) {
  if (tweet.retweeted_status !== undefined) {
    var tweetText = tweet.retweeted_status.text;
    var retweetCount = tweet.retweeted_status.retweet_count;
    //builds the temp object to store all tweets and their count from the start
    tempObj[Date.now()] = {
      text: tweetText,
      count: retweetCount
    };
    logTopTenText();
  }
});

t.on('error', function (err) {
  console.log('something is wrong with the stream');
});

t.track('all');


var logTopTenText = function() {
  //resets top10 so it rebuilds on each run of the function
  var topTen = [{text:'',count:0}];
  var map = {};

  //identify the proper time ranges to build the top 10
  //with the help of a filter function to disgard time ranges that does not apply
  keyArray = Object.keys(tempObj);
  windowArray = _.filter(keyArray, function(num) {
    if (num >= Date.now() - rollingWindowInMs) {
      return num;
    } else {
      delete tempObj[num];
    }
  });

  //rebuilds top10 array
  for (var i = 0; i < windowArray.length - 1; i++) {
    var tempObjCount = tempObj[windowArray[i]].count;
    var tempObjText = tempObj[windowArray[i]].text;
    map[tempObjCount] = tempObjText;
  }
  var mapKey = Object.keys(map);
  var mapText = [];
  for (var j = 0; j < mapKey.length; j++) {
    mapText.push(map[mapKey[j]]);
  }
  for (var k = 0; k < mapKey.length; k++) {
    if (topTen[topTen.length - 1].text === mapText[k]) {
      topTen[topTen.length -1] = {text:mapText[k],count:mapKey[k]};
    } else {
      topTen.push({text:mapText[k],count:mapKey[k]});
    }
  }
  topTen.reverse();
  topTen.length = 10;
  console.log('keyArray', keyArray.length);
  console.log('windowArray',windowArray.length);
  console.log('window time frame', rollingWindowInMin);
  console.log(topTen);
  console.log('===========================================', moment().format("dddd, MMMM Do YYYY, h:mm:ss a"));
};

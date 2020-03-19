
// const myAuthToken = require('./apikeys')// importing the authtoken from apikeys.js

var express = require('express');
var app = express();
// const accountSid = 'ACec7734a550fbbe92ed1c44e99f23a57f';
// const authToken = myAuthToken; // assigning the authtoken from apikeys.js

app.get('/', function (req, res) {
  res.send('Text2Node');
});

app.listen(3000, function () {
  console.log(`Listening on port 3000`);
});




// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure

const ApiKeys = require('./apikeys')   // importing the authtoken from apikeys.js

const accountSid = ApiKeys.myAcctSid;
const authToken = ApiKeys.myAuthToken;
const client = require('twilio')(accountSid, authToken);

console.log("send_sms.js START")

client.messages
  .create({
     body: 'Text2Node',
     from: '+16152355775',
     to: '+16158707537'
   })
  .then(message => console.log(message.sid));
  
  console.log("send_sms.js END")

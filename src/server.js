const ApiKeys = require('./apikeys')

const http = require('http');
const express = require('express');

const MessagingResponse = require('twilio').twiml.MessagingResponse;

const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const mymongopass = ApiKeys.mymongopass
const mongoose = require('mongoose')
const Userconnection = require('./userconnection')
const greeting = require('./greeting')

const state = {
  isRegistering: false,
  isAuth: false,
  lastCommand: ""
}
const newUser = {
  "username": "",
  "password": "",
  "email": "",
  "first_name": "",
  "last_name": "",
  "cid": ""
}


//mongoose connect
mongoose.connect(`mongodb+srv://cherkesky:${mymongopass}@text2node-eywb4.mongodb.net/test?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

//initializing express
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// test routes
app.get('/', function (req, res) {
  res.send('Text2Node');
});
app.get('/test', function (req, res) {
  res.send('TEST');
});

// the SMS main route
app.post('/sms', (req, res) => {
  // if the t
  if (state.isRegistering == true) {
    if (state.lastCommand == "register") {
      console.log(`First Name ${req.body.Body}`)
      newUser.first_name = req.body.Body
      const twiml = new MessagingResponse();
      twiml.message("What is your last name?")
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString())
      state.lastCommand = "first"
    }
    else if (state.lastCommand == "first") {
      console.log(`Last Name ${req.body.Body}`)
      newUser.last_name = req.body.Body
      const twiml = new MessagingResponse();
      twiml.message("What is your email?")
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString())
      state.lastCommand = "last"
    }
    else if (state.lastCommand == "last") {
      console.log(`Email ${req.body.Body}`)
      newUser.email = req.body.Body
      const twiml = new MessagingResponse();
      twiml.message("What is your phone number?")
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString())
      state.lastCommand = "phone"
    }
    else if (state.lastCommand == "phone") {
      console.log(`Phone ${req.body.Body}`)
      newUser.cid = req.body.Body
      const twiml = new MessagingResponse();
      twiml.message("What is your password?")
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString())
      state.lastCommand = "email"
    }
    else if (state.lastCommand == "email") {
      console.log(`Password ${req.body.Body}`)
      newUser.password = req.body.Body
      state.isRegistering = false
      state.isAuth = true

      state.lastCommand = "password"

      newUser.username = parseInt(req.body.From.split("+")[1])

      console.log(newUser)

      fetch(`http://localhost:8000/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
      }).then(data => data.json())
        .then(jsonfiedData => {
          // save token in mongodb
          const userconnection = new Userconnection({
            _id: new mongoose.Types.ObjectId,
            cid: parseInt(req.body.From.split("+")[1]),
            token: jsonfiedData.token
          })
          userconnection.save()
            .then(result => {
              console.log("Mongoose Save: ", result)
            }).catch(err => console.log(err))
            const twiml = new MessagingResponse();
            twiml.message(`Sweet! you're in!
             Your user name is ${newUser.username} 
             and your password ends with ****** ${newUser.password.slice(-4)}`)
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString())
        })
    }
  }
  else if (req.body.Body === "register" || req.body.Body === "Register" || req.body.Body === "Register " || req.body.Body === "register ") {

    state.isRegistering = true
    state.lastCommand = "register"

    const twiml = new MessagingResponse();
    twiml.message("Hi there stranger! Let's get to know you. What is your first name?")
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString())
  }
  else if (req.body.Body === "joke" || req.body === "Joke") { // fetch a joke 
    console.log(req)
    lastCommand = "joke"

    fetch('https://api.chucknorris.io/jokes/random')
      .then(response => response.json())
      .then(joke => {
        const twiml = new MessagingResponse();
        twiml.message(joke.value)
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString())
      })
  }
  else if (req.body.Body === "start" || req.body.Body === "Start") { // start
    console.log(req.body.Body)
    lastCommand = "start"

    const twiml = new MessagingResponse();
    twiml.message(greeting)

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString())
  }
  else {
    console.log("Unknown Command")
    console.log("from:", req.body.From)
    console.log("body", req.body.Body)
    const twiml = new MessagingResponse();
    twiml.message("Unknown Command");
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
}) // app.post bracket





//listen to requests
http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});














// running from terminal
// twilio phone-numbers:update "+16152355775" --sms-url="http://localhost:1337/sms"

// node src/server.js
// mongoose connection
  // const userconnection = new Userconnection({
  //   _id: new mongoose.Types.ObjectId,
  //   cid: parseInt(req.body.From.split("+")[1]),
  //   body: req.body.Body,
  //   token: 'tempToken'
  // })
  // userconnection.save()
  // .then(result=>{
  //   console.log ("Mongoose Save: ", result)
  // }) . catch(err => console.log(err))



   // const registerUser = Userconnection.findOne({
    //   cid: parseInt(req.body.From.split("+")[1])
    // })

    // registerUser.select('_id')
    // registerUser.exec((err, userconnection)=> {
    //   if (err) return handleError(err)
    //   console.log("UID:", userconnection._id )
    // })


     // creating a user in MongoDB to host the token from Django
    //  const userconnection = new Userconnection({
    //   _id: new mongoose.Types.ObjectId,
    //   cid: parseInt(req.body.From.split("+")[1]),
    //   token: 'tempToken'
    // })
    // userconnection.save()
    //   .then(result => {
    //     console.log("Mongoose Save: ", result)
    //   }).catch(err => console.log(err))

    // fetch(`http://localhost:8000/register`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify(newUser)
    // }).then(data => data.json())
    //   .then(jsonfiedData => console.log(jsonfiedData)) //<== token
    //   // save token in mongodb


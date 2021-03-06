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
const menu = require('./menu')

const state = {
  isRegistering: false,
  returnedUser: false,
  isAuthenticating: false,
  isAuth: false,
  state: "",
  location: 0,
  cid: 0,
  token: '',
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
const authUser = {
  "username": "",
  "password": "",
}

const newWish = {
  "wish_body": "",
  "category": 1,
  "location": 0
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
  if (state.isAuth === false) { // Login & Register
    if (state.isRegistering === true) {
      ///////////////////////////////////////////////////////////////
      //                          Register                         //
      ///////////////////////////////////////////////////////////////
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
        twiml.message("What is your username?")
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString())
        state.lastCommand = "email"
      }
      else if (state.lastCommand == "email") {
        console.log(`Username ${req.body.Body}`)
        newUser.cid = parseInt(req.body.From.split("+1")[1])
        newUser.username = req.body.Body
        const twiml = new MessagingResponse();
        twiml.message("What is your password?")
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString())
        state.lastCommand = "password"
      }
      else if (state.lastCommand == "password") {
        console.log(`Password ${req.body.Body}`)
        newUser.password = req.body.Body
        state.isRegistering = false
        state.isAuth = true
        state.lastCommand = "password"

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
              cid: parseInt(req.body.From.split("+1")[1]),
              token: jsonfiedData.token
            })

            userconnection.save()
              .then(result => {
                console.log("Mongoose Save: ", result)
              }).catch(err => console.log(err))
            const twiml = new MessagingResponse();
            twiml.message(`Sweet! you're in!
               Your user name is ${newUser.username} 
               and your password ends with ****** ${newUser.password.slice(-4)}
               
               
               ${menu}
               `)
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString())

            state.isAuth = true
            state.token = jsonfiedData.token
            state.cid = parseInt(req.body.From.split("+1")[1])
            
          })
          // .then(()=>{
          //   const twiml = new MessagingResponse();
          //   twiml.message(menu)
          //   res.writeHead(200, { 'Content-Type': 'text/xml' });
          //   res.end(twiml.toString())
          // })
      }
    }
    else if (state.isAuthenticating == true) {
      ///////////////////////////////////////////////////////////////
      //                          Login                            //
      ///////////////////////////////////////////////////////////////

      if (state.lastCommand === 'login') {
        authUser.username = req.body.Body
        console.log(`Username ${req.body.Body}`)
        const twiml = new MessagingResponse();

        twiml.message("What is your password?")
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString())

        state.lastCommand = "login-user"
      } else if (state.lastCommand === 'login-user') {
        authUser.password = req.body.Body
        console.log(`Passwords ${req.body.Body}`)

        console.log(authUser)

        fetch(`http://localhost:8000/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(authUser)
        })
          .then(data => data.json())
          .then(jsonfiedData => {
            console.log(jsonfiedData)
            state.isAuthenticating = false
            state.isAuth = true
            state.token = jsonfiedData.token
            state.cid = parseInt(req.body.From.split("+1")[1])

            console.log(state)

            const userconnection = new Userconnection({
              _id: new mongoose.Types.ObjectId,
              cid: parseInt(req.body.From.split("+1")[1]),
              token: jsonfiedData.token
            })

            userconnection.save()
              .then(result => {
                console.log("Mongoose Save: ", result)
              }).catch(err => console.log(err))
          })
          .catch(err => console.log("ERROR", err))

        const twiml = new MessagingResponse();
        twiml.message(menu)
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString())
      }
    }
    else if (req.body.Body === "register" || req.body.Body === "Register" || req.body.Body === "Register " || req.body.Body === "register ") { // Register

      state.isRegistering = true
      state.lastCommand = "register"

      const twiml = new MessagingResponse();
      twiml.message("Hi there stranger! Let's get to know you. What is your first name?")
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString())
    }
    else if (req.body.Body === "login" || req.body.Body === "Login" || req.body.Body === "login " || req.body.Body === "Login ") { // Login
      state.isAuthenticating = true
      state.lastCommand = "login"
      const twiml = new MessagingResponse();
      twiml.message("What is your username?")
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString())
      console.log("Login")
      fetch(`http://localhost:8000/locations?get_state=${state.state}`, {
        "method": "GET",
        "headers": {
          "Accept": "application/json",
        }
      }).then(result => result.json())
        .then((result) => {
          console.log("FETCH LOCATION", result)
          state.location = result[0].id
          console.log(state)})
    }
    else if (req.body.Body === "start" || req.body.Body === "Start" || req.body.Body === "start " || req.body.Body === "Start ") { // Start
      state.state = req.body.FromState
      console.log("User Location:", state.state)

      lastCommand = "start"

      Userconnection.findOne({ cid: parseInt(req.body.From.split("+1")[1]) })
        .exec()
        .then(doc => {
          state.token = doc.token
          state.cid = doc.cid
          state.isAuth = true
          state.returnedUser = true
          state.lastCommand = 'auto-auth'
          console.log(state)

          fetch(`http://localhost:8000/locations?get_state=${state.state}`, {
            "method": "GET",
            "headers": {
              "Accept": "application/json",
              "Authorization": `Token ${state.token}`
            }
          }).then(result => result.json())
            .then((result) => {
              console.log("FETCH LOCATION", result)
              state.location = result[0].id
              console.log(state)
            })

          const twiml = new MessagingResponse();
          twiml.message(menu)
          res.writeHead(200, { 'Content-Type': 'text/xml' });
          res.end(twiml.toString())
        })
        .catch(err => {
          const twiml = new MessagingResponse();
          twiml.message(greeting)
          res.writeHead(200, { 'Content-Type': 'text/xml' });
          res.end(twiml.toString())

          console.log(err)
        })

      if (state.returnedUser === 'false') {
        const twiml = new MessagingResponse();
        twiml.message(greeting)

        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString())
      } else if (state.returnedUser === 'true') {
        const twiml = new MessagingResponse();
        twiml.message(menu)

        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString())
      }

    }
  } else if (state.isAuth === true) { // Wish  
    if (req.body.Body === "wish" || req.body.Body === "Wish" || req.body.Body === "wish " || req.body.Body === "Wish ") { // Login
      state.lastCommand = "wish"
      const twiml = new MessagingResponse();
      twiml.message("What is your wish?")
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString())
    } else if (state.lastCommand === "wish") {
      newWish.location = state.location
      newWish.wish_body = req.body.Body

      console.log("WISH BLOCK", newWish)

      fetch(`http://localhost:8000/wishes`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Token ${state.token}`
        },
        body: JSON.stringify(newWish)
      }).then(data => data.json())
        .then(jsonfiedData => {
          console.log(jsonfiedData)
          state.lastCommand = "wish-sent"
          const twiml = new MessagingResponse();
          twiml.message("Wish sent succesfully! text Wish to send another one! or Logout to finish")
          res.writeHead(200, { 'Content-Type': 'text/xml' });
          res.end(twiml.toString())
        })
    } else if (req.body.Body === "logout" || req.body.Body === "Logout" || req.body.Body === "logout " || req.body.Body === "Logout ") {
      Userconnection.deleteOne({ cid: parseInt(req.body.From.split("+1")[1]) })
      .exec()
      console.log("LOGGED OUT!")
      state.isAuth=false
      const twiml = new MessagingResponse();
      twiml.message(greeting);
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    }
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

///////////////////////////////////////////////////////////////
//                      Listening                            //
///////////////////////////////////////////////////////////////
http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});






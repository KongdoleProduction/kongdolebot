var express = require('express');
var request = require('request');
var app = express();
app.use(express.json());

const PORT = process.env.PORT;
const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_ID = process.env.BOT_ID; // maybe useful in the future to prevent reply-to-itself
const ADMIN = process.env.BOT_ADMIN;
const ADMIN_CHANNEL = process.env.BOT_ADMIN_CHANNEL;

var users = [];

var server = app.listen(PORT, function() {
  console.log("Server started on port " + PORT);

  users = getUsers();
})

app.post('/', function(req, res) {
    console.log('received: ', req.body);
    let payload = req.body;

    if (payload.type === "url_verification") {
      res.send(payload.challenge);
    } else if (payload.type === "event_callback") {
      res.sendStatus(200);
      if (payload.event.type === "app_mention") {
        console.log(payload.event.text);

        var text = "Knock knock";
        if (payload.event.text.includes('팩트')) {

          let facts = [
            "감자는 치킨을 좋아한다",
            "지니는 나라를 지킨다",
            "사장님은 잘생겼다",
          ];

          text = facts[Math.floor(Math.random() * facts.length)];
        }

        sendReply(text, payload.event.channel); 
      } else if (payload.event.type === 'message') {
        let text = payload.event.text;
        let channel_type = payload.event.channel_type;
        console.log("message(" + channel_type + "): ", text); 

        let user_id = payload.event.user;
        if (!user_id) { 
          /* this message is sent by a bot */
          return;
        } else {
          /* this message is sent by a user */
          user = users.find(function(element) {
            return element.id === user_id; });
          let username = user.profile.display_name;
          if (payload.event.channel_type === 'im') {
            let msg = '[' + username + '] ' + text;
            sendReply(msg, ADMIN_CHANNEL);
          } else if (payload.event.channel_type === 'channel') {
          }
        }
      }
    }
})

var sendReply = function(message, channel) {
  let payload_reply = {
    'text': message,
    'channel': channel };

  request.post(
      { 
        headers: {
          'content-type' : 'application/json; charset=utf-8',
          'Authorization': 'Bearer ' + BOT_TOKEN },
        url: "https://slack.com/api/chat.postMessage",
        body: payload_reply,
        json: true
      },
      function (error, response, body) {
        if (error) {
          return console.error('reply failed: ', error);
        }
        console.log("reply sent: ", body);
      }
  ); 
}

var getUsers = function() {
  request.post(
      {
        headers: {
          'content-type' : 'application/json; charset=utf-8',
          'Authorization': 'Bearer ' + BOT_TOKEN },
        url: 'https://slack.com/api/users.list',
        body: {},
        json: true
      },
      function (error, response, body) {
        if (error) {
          console.error('get users failed: ', error);
          return null;
        }

        console.log('got users: ');

        let payload = body.members;
        users = payload;
        /* TODO: delete these lines 
        for (var i in payload) {
          var u = payload[i];
          users[u.id] = {
            'name': u.name,
            'real_name' : u.real_name,
            'display_name' : u.profile.display_name
          };
        } */
        
        console.log(users);
        return users;
      }
  );
}

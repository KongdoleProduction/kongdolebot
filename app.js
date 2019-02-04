var express = require('express');
var request = require('request');
var app = express();
app.use(express.json());

const PORT = process.env.PORT
const BOT_TOKEN = process.env.BOT_TOKEN
const ADMIN = process.env.BOT_ADMIN

var server = app.listen(PORT, function() {
  console.log("Server started on port " + PORT);
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
        if (payload.event.channel_type === 'im') {
          text = payload.event.text
          user = payload.event.user;
          console.log("message(im): ", text);
        } else if (payload.event.channel_type === 'channel') {
          text = payload.event.text
          console.log('message(channel): ', text);
        }
      }
    }
})

var sendReply = function(message, channel) {
  let payload_reply = {
    'text': text,
    'channel': payload.event.channel };

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
          return console.error('reply failed: ', error)
        }
        console.log("reply sent: ", body)
      }
  ); 
}

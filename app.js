var express = require('express');
var request = require('request');
var app = express();
app.use(express.json());

const PORT = process.env.PORT
const BOT_TOKEN = process.env.BOT_TOKEN

var server = app.listen(PORT, function() {
  console.log("Server started on port " + PORT);
})

app.post('/', function(req, res) {
    console.log("REQUEST> ");
    console.log(req.body);
    let payload = req.body;

    if (payload.type === "url_verification") {
      res.send(payload.challenge);
    } else if (payload.type === "event_callback") {
      res.sendStatus(200);
      if (payload.event.type === "app_mention") {
        console.log(payload.event.text);

        let payload_reply = {
          'text': 'Knock, knock.',
          'channel': payload.event.channel };

        request.post(
            { 
              headers: {
                'content-type' : 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + BOT_TOKEN
              },
              url: "https://slack.com/api/chat.postMessage",
              body: JSON.stringify(payload_reply),
            },
            function (error, response, body) {
              console.log("POST request sent> ")
              console.log(error);
              console.log(body); 
            }
        ); 
      }
    }
})
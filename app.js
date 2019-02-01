var express = require('express');
var app = express();
app.use(express.json());
const PORT = process.env.PORT
var server = app.listen(PORT, function() {
  console.log("Server started on port " + PORT);
})

app.post('/', function(req, res) {
    console.log(req.body);
    let payload = req.body;
    res.sendStatus(200);

    if (payload.type === "url_verification") {
      res.send(body.challenge);
    } else if (payload.type === "event_callback") {
      if (payload.event.type === "app_mention") {
        console.log(payload.event.text);
      }
    }
})

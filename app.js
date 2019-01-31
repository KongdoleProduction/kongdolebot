var express = require('express');
var app = express();
app.use(express.json());
const PORT = process.env.PORT
var server = app.listen(PORT, function() {
  console.log("Server started on port " + PORT);
})

app.post('/', function(req, res) {
    console.log(req.body);
    var body = req.body;
    res.send(body.challenge);
})

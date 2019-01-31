var express = require('express');
var app = express();
app.use(express.json());
var server = app.listen(3000, function() {
  console.log("Server started on port 3000");
})

app.post('/', function(req, res) {
    console.log(req.body);
    var body = req.body;
    res.send(body.challenge);
})

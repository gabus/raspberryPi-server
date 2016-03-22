var express = require('express');
var mustacheExpress = require('mustache-express');
var fs = require('fs');
var app = express();

app.engine('html', mustacheExpress());          // register file extension mustache
app.set('view engine', 'html');                 // register file extension for partials
app.set('views', __dirname + '/frontend/views');
app.use(express.static(__dirname + '/frontend')); // set static folder


app.get('/', function (req, res) {
	res.render('index', {});
});


app.listen(3000, function () {
	console.log('App listening on port 3000!');
});
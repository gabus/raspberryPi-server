var express = require('express');
var mustacheExpress = require('mustache-express');
var fs = require('fs');
var app = express();

app.engine('html', mustacheExpress());          // register file extension mustache
app.set('view engine', 'html');                 // register file extension for partials
app.set('views', __dirname + '/views');
//app.use(express.static(__dirname + '/public')); // set static folder


app.get('/', function (req, res) {
	res.render('index', {});
});

app.get('/getStats', function(req, res) {
	fs.readFile('./data.json', function(err, data) {
		if(err) {
			console.log(err);
		}


		var data = JSON.parse(data.toString());
		data = data.slice(data.length - 480, data.length - 1); // last 8 hours
		data = data.map(function(obj) { return {'temperature' : (obj.temperature / 1000).toFixed(2), 'date' : obj.date} });
		res.send(data);
	});
});



app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
'use strict';

const user_agent = "IsitupForSlack/1.0 (https://github.com/Kiran554/IsitupForSlack.git; kiran.atmala@gmail.com)";
var http = require('http'); 
var command;
var text;
var token = process.env.BOT_API_KEY;
var urlToCheck = "https://isitup.org/";

http.createServer(
	function (req, res) { 
		if (req.method == 'POST') {
	        console.log("POST");
	        var body = '';
	        req.on('data', function (data) {
	            body += data;
	            console.log("Partial body: " + body);
	        });
	        req.on('end', function () {
	            console.log("Body: " + body);
	        });	
	        res.writeHead(200, {'Content-Type': 'text/html'});
	        res.end('post received\n');
	    }
	 }
).listen(process.env.PORT || 5000);
'use strict';

const user_agent = "IsitupForSlack/1.0 (https://github.com/Kiran554/IsitupForSlack.git; kiran.atmala@gmail.com)";
const host = "isitup.org";
var http = require('http');
var https = require('https');
var querystring = require('querystring');

function init(){
	http.createServer(
		function (req, res) { 
			if (req.method == 'POST') {
		        console.log("POST");
		        processPost(req, res, function(){
		        	console.log(req.post);
		        	executeRequest(req, res, function(){
		        		console.log(res.reply);
		        		res.writeHead(200, {'Content-Type': 'text/html'});
		        		res.end(res.reply);
		        	});
		        });	
		    }
		 }
	).listen(process.env.PORT || 5000);
}

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

function executeRequest (request, response, callback) {
	if(typeof callback !== 'function') return null;
	// Only if the request is coming from slack
	if(request.post.token === 'bHJ2oQLLMDyy9KStsJdgzmzT' && request.post.command === '/isitup') {
		var options = {
		  host: host,
		  port: 443,
		  path: "/" + request.post.text + ".json",
		  headers:{'user-agent': user_agent},
		  method: "GET"
		};

		var req = https.request(options, function(res) {
			console.log('statusCode:', res.statusCode);
  			console.log('headers:', res.headers);
	  		var str = '';

		  	//another chunk of data has been recieved, so append it to `str`
		  	res.on('data', function (chunk) {
		    	str += chunk;
		  	});

		  	//the whole res has been recieved, so we just print it out here
		  	res.on('end', function () {
		    	console.log(str);
		    	response.reply = processResponse(str);
		    	callback();
		  	});
		})
		req.end();
		req.on('error', function(error){
			console.log(error);
			response.writeHead(405, {'Content-Type': 'text/plain'});
        	response.end();
		});
	}  else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
} 

function processResponse(data) {
	console.log('inside!!')
	var reply = ""
	switch(data["status_code"]) {
		case 1:
	  		//Yay, the domain is up! 
		    reply = ":thumbsup: I am happy to report that *<http://" + data["domain"] + ">* is *up*!";
		    break;
		case 2:
		    //Boo, the domain is down. 
		    reply = ":disappointed: I am sorry to report that *<http://" + data["domain"] + ">* is *not up*!";
		    break;
		case 3:
		    //Uh oh, isitup.org doesn't think the domain entered by the user is valid
		    reply = ":interrobang: *" + data["domain"] + "* does not appear to be a valid domain. \n";
		    reply += "Please enter both the domain name AND suffix (example: *amazon.com* or *whitehouse.gov*).";
		    break;
	}
	console('inside!!\t' + reply);
	return reply;
}

// Call init function
(function(){
	init();
})();
'use strict';

const user_agent = "IsitupForSlack/1.0 (https://github.com/Kiran554/IsitupForSlack.git; kiran.atmala@gmail.com)";
const host = "https://isitup.org/";
var http = require('http');
var querystring = require('querystring');

http.createServer(
	function (req, res) { 
		if (req.method == 'POST') {
	        console.log("POST");
	        /*var reply = "";
	        processPost(req, res, function(){
	        	console.log(req.post);
	        	//reply = executeRequest(req.post);
	        	reply = req.post.text;
	        });	
	        console.log('last!!');
	        res.writeHead(200, {'Content-Type': 'text/html'});
	        res.end(reply);*/
	        var body = '';
	        req.on('data', function (data) {
	            body += data;
	            console.log("Partial body: " + body);
	        });
	        req.on('end', function () {
	            console.log("Body: " + body);
	        });
	        console.log('POST POST');
	        res.writeHead(200, {'Content-Type': 'text/html'});
	        res.end('post received');
	    }
	}
).listen(process.env.PORT || 5000);

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
    	console.log('inside Post!!');
        request.on('data', function(data) {
        	console.log('inside data!!!');
            queryData += data;
            if(queryData.length > 1e6) {
            	console.log('inside!!!');
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
        	console.log('inside end!!!');
            request.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

function executeRequest (data) {
	// Only if the request is coming from slack
	if(data.token === 'bHJ2oQLLMDyy9KStsJdgzmzT' && data.command === '/isitup') {
		var options = {
		  host: host,
		  path: "/" + data.text + ".json",
		  headers:{'user-agent': user_agent}
		};

		var callback = function(response) {
		  var str = '';

		  //another chunk of data has been recieved, so append it to `str`
		  response.on('data', function (chunk) {
		    str += chunk;
		  });

		  //the whole response has been recieved, so we just print it out here
		  response.on('end', function () {
		    console.log(str);
		    return processResponse(str);
		  });
		}

		http.request(options, callback).end();
	} else {
		return "";
	}
} 

function processResponse(response) {
	var reply = ""
	switch(response["status_code"]) {
	case 1:
  		//Yay, the domain is up! 
	    reply = ":thumbsup: I am happy to report that *<http://" + response["domain"] + ">* is *up*!";
	    break;
	case 2:
	    //Boo, the domain is down. 
	    reply = ":disappointed: I am sorry to report that *<http://" + response["domain"] + ">* is *not up*!";
	    break;
	case 3:
	    //Uh oh, isitup.org doesn't think the domain entered by the user is valid
	    reply = ":interrobang: *" + response["domain"] + "* does not appear to be a valid domain. \n";
	    reply += "Please enter both the domain name AND suffix (example: *amazon.com* or *whitehouse.gov*).";
	    break;
	}
	return reply;
}
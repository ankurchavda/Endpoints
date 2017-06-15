var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var jwtExpress = require('express-jwt');
var jsonpatch = require('jsonpatch');
var request = require('request');
var fs = require('fs');
var Jimp = require("jimp");
var config = require('./config');
var User = require('./models/user');

mongoose.connect(config.database);
var db = mongoose.connection;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(jwtExpress({secret: config.secret}).unless({path: ['/','/api/login']}));

app.get('/', function(req, res){
	res.send("Welcome. Use /api/login to create a user!")
});

app.post('/api/login', function(req, res){
	var login = req.body;
	if(!req.body.name){
		res.status(400).send("Username required");
		return;
	}
	if(!req.body.password){
		res.status(400).send("Password required");
		return;
	}

	User.addUser(login, function(err,login){
		if(err)
		{
			throw err;
		}
		var token = jwt.sign({name: req.body.name},config.secret);
		console.log("User Successfully logged in.")
		res.json({
			success: true,
			token: token
		});
	});
});

app.post('/api/applyjsonpatch',function(req,res){
	if(!req.body.obj)
	{
		res.status(400).send("Please provide json obj to operate on.");
		return;
	}
	if(!req.body.patch)
	{
		res.status(400).send("Please provide json patch");
		return;
	}
	var obj = req.body.obj;
	var patch = req.body.patch;
	var patchedObj = jsonpatch.apply_patch(obj,patch);
	res.json(patchedObj);
});

app.post('/api/createthumbnail/',function(req,res){
	if(!req.body.imageUrl)
	{
		res.status(400).send("Please provide a image url.");
		return;
	}
	var imageUrl = req.body.imageUrl;	

	var download = function(uri, filename, callback){
		request.head(uri, function(err, res, body){
			console.log('content-type:', res.headers['content-type']);
			console.log('content-length:', res.headers['content-length']);

			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	};
	download('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1200px-Node.js_logo.svg.png', 'node.png', function(){
		console.log('done');
	});

	Jimp.read("node.png", function (err, lenna) {
		if (err) throw err;
    lenna.resize(50, 50)            // resize
         .quality(90)                 // set JPEG quality
         .write("node-thumb.jpg"); // save
     });

	res.sendFile("C:/Projects/Nodejsmircoservice/node-thumb.jpg");
});

app.listen(5000);
console.log("Running on port no. 5000");
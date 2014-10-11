var express = require('express');
var app = express();
var passport = require('passport');

// mongodb
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/market');

require('../models/ad');
require('../models/user');

// configurations
require('./passportConfig');

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(express.favicon(__dirname + '/public/img/favicon.png')); 
app.use(passport.initialize());

// middleware
app.use(express.bodyParser());

// routes
var users = require('./routes/users');
app.post('/users/create', users.create);
app.get('/users/:username', users.findByUsername);
app.post('/users/login', passport.authenticate('local', 
	{ 
		successRedirect: '/market',
		failureRedirect: '/login'/*,
		failureFlash: true  */
	})
);

var ads = require('./routes/ads');
app.get('/ads/:id', ads.findOne);
app.get('/ads', ads.findAll);
app.post('/ads', ads.create);


app.listen(3001);

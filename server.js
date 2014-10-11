var express = require('express');
var app = express();
var passport = require('passport');

// mongodb
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/market');

require('./models/ad');
require('./models/user');

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
var index = require('./routes/index');
app.get('/', index.load);

var market = require('./routes/market');
app.get('/market', market.findAll);

var signup = require('./routes/signup');
app.get('/signup', signup.load);
app.post('/signup', signup.create);

var createAd = require('./routes/createAd');
app.get('/createAd', createAd.load);
app.post('/createAd', createAd.create);

var login = require('./routes/login');
app.get('/login', login.load);
app.post('/login', passport.authenticate('local', 
	{ 
		successRedirect: '/market',
		failureRedirect: '/login'/*,
		failureFlash: true  */
	})
);

app.listen(3000);

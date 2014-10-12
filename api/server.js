var express = require('express');
var app = express();
var passport = require('passport');

// mongodb
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/market');

require('../models/ad');
require('../models/user');
require('../models/conversation');

// configurations
require('./passportConfig');

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(express.favicon(__dirname + '/public/img/favicon.png')); 
app.use(passport.initialize());

// middleware
app.use(express.bodyParser());

var auth = require('./middleware/auth');
var utils = require ('../helpers/utils');

// routes
/*
 *	users
 */
var users = require('./routes/users');
app.post('/users/create', users.create);
app.get('/users/:username', users.findByUsername);
app.post('/users/login', passport.authenticate('local', { session: false }), function(req, res) {
    return utils.sendJsonResponse(res, 200, 'OK', { user: req.user });
});

/*
 *	ads
 */
var ads = require('./routes/ads');
app.get('/ads/:id', auth.ensureAuthenticated, ads.findOne);
app.get('/ads', auth.ensureAuthenticated, ads.findAll);
app.post('/ads', auth.ensureAuthenticated, ads.create);

/*
 *	conversations
 */
var conversations = require('./routes/conversations');
app.get('/conversations', auth.ensureAuthenticated, conversations.findAll);
app.get('/conversations/:receiver', auth.ensureAuthenticated, conversations.findOne);
app.post('/conversations/message', auth.ensureAuthenticated, conversations.createMessage);
app.post('/conversations', auth.ensureAuthenticated, conversations.create);

app.listen(3001);

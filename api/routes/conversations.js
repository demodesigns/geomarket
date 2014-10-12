var mongoose = require('mongoose');
var Conversation = mongoose.model('Conversation');
var User = mongoose.model('User');
var utils = require('../../helpers/utils');

exports.create = function(req, res) {
	var user = req.user;
	var message = req.body.message,
		receiver = req.body.receiver;

	var conversation = new Conversation({
		usernames: [ user.username, receiver ],
		messages: [{
			date: new Date(),
			username: user.username,
			message: message
		}]
	});
	conversation.save(function(err, savedConversation) {
		if (err) {
			console.log(err);
			utils.badRequest(res);
		}

		User.addUnreadConversation(user, savedConversation, function(err) {
			if (err) {
				return utils.badRequest(res);
			}
			
			return utils.sendJsonResponse(res, 200, 'OK', { conversation: savedConversation });
		});
	});
};

exports.createMessage = function(req, res) {
	var user = req.user;
	var message = req.body.message,
		receiver = req.body.receiver;

	Conversation.findOneAndUpdate(
		{ 
			usernames: { 
				$all: [user.username, receiver] 
			} 
		},
		{
			$push: {
				messages: {
					date: new Date(),
					username: user.username,
					message: message
				}
			}
		}, 
		function(err, conversation) {
			if (err) {
				console.log(err);
				return utils.badRequest(res);
			}

			return utils.sendJsonResponse(res, 200, 'OK', {conversation: conversation});
		}
	);
};

exports.findAll = function(req, res) {
	var user = req.user;
	Conversation.find({ usernames: user.username }, function(err, conversations) {
		if (err) {
			console.log(err);
			return utils.badRequest(res);
		}

		return utils.sendJsonResponse(res, 200, 'OK', {conversations: conversations});
	});
};

exports.findOne = function(req, res) {
	var user = req.user;
	var receiver = req.params.receiver
	Conversation.find({ usernames: { $all: [user.username, receiver] } }, function(err, conversation) {
		if (err) {
			console.log(err);
			return utils.badRequest(res);
		}

		return utils.sendJsonResponse(res, 200, 'OK', {conversation: conversation});
	});
}
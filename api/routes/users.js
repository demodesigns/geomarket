var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	utils = require('../../helpers/utils');

exports.findByUsername = function(req, res) {
	var username = req.params.username;

	User.findOne({username: username}, function(err, user) {
		if (err) {
			console.log(err);
			return utils.badRequest(res);
		}

		return utils.sendJsonResponse(res, 200, 'OK', {user: user});
	});
}

exports.create = function(req, res) {
	var username = req.body.username,
		password = req.body.password,
		email = req.body.email,
		homeLatitude = req.body.latitude,
		homeLongitude = req.body.longitude,
		state = req.body.state,
		city = req.body.city,
		zipcode = req.body.zipcode;

	if (username != null && password != null && email != null) {
		var user = new User({ 
			username: username, 
			password: password, 
			email: email,
			homeLatitude: homeLatitude,
			homeLongitude: homeLongitude,
			state: state,
			city: city,
			zipcode: zipcode
		});
		user.saveWithNewAccessToken(function(err) {
			if (err) {
				console.log(err);
				return utils.badRequest(res);
			}

			return utils.sendJsonResponse(res, 200, 'OK', {});
		});
	} else {
		return utils.badRequest(res);
	}
}
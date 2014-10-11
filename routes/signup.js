var mongoose = require('mongoose'),
	User = mongoose.model('User');

exports.load = function(req, res) {
	return res.render('signup.html');	
}

exports.create = function(req, res) {
	var username = req.body.username,
		password = req.body.password,
		email = req.body.email;

	if (username != null && password != null && email != null) {
		var user = new User({ username: username, password: password, email: email });
		user.save(function(err) {
			if (err) {
				console.log(err);
			}

			return res.redirect('market');
		});
	} else {
		return res.redirect('market');
	}
}
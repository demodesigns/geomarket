var mongoose = require('mongoose');
var Ad = mongoose.model('Ad');

exports.findAll = function(req, res) {
	Ad.find({}, function(err, ads) {
		if (err) {
			console.log(err);
		}

		return res.render('market.html', { ads: ads });
	});
}
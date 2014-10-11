var mongoose = require('mongoose');
var Ad = mongoose.model('Ad');
var cloudinary = require('cloudinary');

exports.create = function(req, res) {
	var title = req.body.title,
		price = req.body.price,
		description = req.body.description;

	if (isNaN(price)) {
		return res.redirect('market');
	}
	
	price = parseFloat(price);

	var ad = new Ad({ title: title, price: price, description: description });
	ad.save(function(err) {
		if (err) {
			console.log(err);
		}

		return res.redirect('market');
	});
}

exports.load = function(req, res) {
	return res.render('createAd.html');
}
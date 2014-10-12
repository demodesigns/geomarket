var mongoose = require('mongoose');
var Ad = mongoose.model('Ad');
var utils = require('../../helpers/utils');

exports.create = function(req, res) {
	var user = req.user._id;
	var title = req.body.title,
		price = req.body.price,
		description = req.body.description,
		img = req.body.img;

	if (isNaN(price)) {
		return utils.badRequest(res);
	}
	
	price = parseFloat(price);

	var ad = new Ad({
		user: user,
		title: title, 
		price: price, 
		description: description,
		img: img
	});
	ad.save(function(err) {
		if (err) {
			console.log(err);
		}

		return utils.sendJsonResponse(res, 200, 'OK', {});
	});
};

exports.findOne = function(req, res) {
	var id = req.params.id;

	Ad.findById(id, function(err, ad) {
		if (err) {
			console.log(err);
			return utils.badRequest(res);
		}

		return utils.sendJsonResponse(res, 200, 'OK', {ad: ad}); 
	});
};

exports.findAll = function(req, res) {
	Ad.find({}, function(err, ads) {
		if (err) {
			console.log(err);
			return utils.badRequest(res);
		}

		return utils.sendJsonResponse(res, 200, 'OK', {ads: ads});
	});
};
var mongoose = require('mongoose');
var Ad = mongoose.model('Ad');
var utils = require('../../helpers/utils');

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

		return utils.sendJsonResponse(res, 200, 'OK', {});
	});
};

exports.findOne = function(req, res) {

};

exports.findAll = function(req, res) {
	Ad.find({}, function(err, ads) {
		if (err) {
			console.log(err);
		}

		return utils.sendJsonResponse(res, 200, 'OK', {ads: ads});
	});
};
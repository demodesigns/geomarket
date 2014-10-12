var mongoose = require('mongoose');
var Ad = mongoose.model('Ad');
var utils = require('../../helpers/utils');
var config = require('../../config');
var elasticsearch = require('../../helpers/elasticsearch');
var _ = require('underscore');

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
	ad.save(function(err, ad) {
		if (err) {
			console.log(err);
			return utils.badRequest(res);
		}

		_indexElasticSearch(ad, function(err) {
			if (err) {
				console.log(err);
				return utils.badRequest(res);
			}

			return utils.sendJsonResponse(res, 200, 'OK', {ad: ad});
		});
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

esports.findAllWishlist = function(req, res) {
	var username = req.username;

	User.findOne({username: username}, function(err, user) {
		if (err) {
			console.log(err);
			return utils.badRequest(res);
		}
		else
		{
			Ad.find({ '_id': { $in: user.wishlist]}}, function(err, ads){
			     if (err) {
					console.log(err);
					return utils.badRequest(res);
				}
				return utils.sendJsonResponse(res, 200, 'OK', {ads: ads});
			});
		}
}

exports.search = function(req, res) {
    var query = req.params.query;

    elasticsearch.search(config.elasticsearch.entityIndex, 'gram', query, function(err, ids) {
        if (err) {
            return utils.badRequest(res);
        }

        if (_.isEmpty(ids)) {
            return utils.sendJsonResponse(res, 200, 'OK', {});
        }

        var query = {
        	_id: { $in: ids }
        };

        var filteredAds = new Array(ids.length);

        Ad.find(query, function(err, ads) {
            if (err) {
                console.log(err);
                return utils.badRequest(res);
            }

            return utils.sendJsonResponse(res, 200, 'OK', { ads: ads });
        });
	});
};

exports.indexAllElasticSearch = function(req, res) {
	elasticsearch.createNgramAnalyzer(function(err) {
		if (err) {
			return utils.badRequest(res);
		}

		elasticsearch.indexAll(function(err) {
			if (err) {
				return utils.badRequest(res);
			}

			return utils.sendJsonResponse(res, 200, 'OK', {});
		});
	});
};

var _indexElasticSearch = function(ad, callback) {
	elasticsearch.index(ad, function(err) {
		if (err) {
			return callback(err);
		}

		return callback(null);
	});
};

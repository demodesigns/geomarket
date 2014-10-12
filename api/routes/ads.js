var mongoose = require('mongoose');
var Ad = mongoose.model('Ad');
var User = mongoose.model('User');
var utils = require('../../helpers/utils');
var config = require('../../config');
var elasticsearch = require('../../helpers/elasticsearch');
var _ = require('underscore');
var fs = require('fs');

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

exports.updateImage = function(req, res) {
	Ad.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.params.id)}, {img: '/img/' + req.params.id + '.jpg'}, function(err, ad) {
		if (err) {
			return utils.badRequest(res);
		}

		var file = fs.createWriteStream('./public/img/' + req.params.id + '.jpg');
		var uploadedSize = 0;
		var fileSize = req.headers['content-length'];

		req.on('data', function (chunk) {
			uploadedSize += chunk.length;
			var uploadProgress = (uploadedSize/fileSize) * 100;
			console.log(Math.round(uploadProgress) + "%" + " uploaded\n" );
			var bufferStore = file.write(chunk);
			if(bufferStore == false)
				req.pause();
		});

		file.on('drain', function() {
		    req.resume();
		})
		 
		req.on('end', function() {
		    console.log('Upload done!');

		    return utils.sendJsonResponse(res, 200, 'OK', {ad: ad});
		})
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
	var user = req.user;

	Ad.find({zipcode: user.zipcode}, function(err, ads) {
		if (err) {
			console.log(err);
			return utils.badRequest(res);
		}

		return utils.sendJsonResponse(res, 200, 'OK', {ads: ads});
	});
};

exports.findAllWishlist = function(req, res) {
	var username = req.user.username;

	User.findOne({username: username}, function(err, user) {
		if (err) {
			console.log(err);
			return utils.badRequest(res);
		}

		Ad.find({ '_id': { $in: user.wishlist }}, function(err, ads){
		     if (err) {
				console.log(err);
				return utils.badRequest(res);
			}
			return utils.sendJsonResponse(res, 200, 'OK', {ads: ads});
		});
	});
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

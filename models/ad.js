var mongoose = require('mongoose');

/*
 * Schema
 */
var AdSchema = new mongoose.Schema({
	title: String,
	price: Number,
	descriptions: {
		short: String,
		long: String
	},
	img: { data: Buffer, contentType: String }
});

module.exports = mongoose.model('Ad', AdSchema);
var Ad = mongoose.model('Ad');







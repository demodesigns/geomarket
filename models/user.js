var mongoose = require('mongoose');
var utils = require('../helpers/utils');

var UserSchema = new mongoose.Schema({
	username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    accessToken: { type: String, required: false, unique: true },
    radius: { type: Number },
    latitude: { type: Number },
    longitude: { type: Number },
    state: { type: String },
    zipcode: { type: Number },
    ads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }]
});

UserSchema.methods = {
	validPassword: function(password) {
		if (password == this.password) {
			return true;
		} else {
			return false;
		}
	},
    saveWithNewAccessToken : function(cb) {
        var date = new Date();
        this.accessToken = utils.generateAccessToken(this._id, date);
        return this.save(cb);
    },
};

module.exports = mongoose.model('User', UserSchema);
var User = mongoose.model('User');
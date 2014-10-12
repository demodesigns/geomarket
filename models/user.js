var mongoose = require('mongoose');
var utils = require('../helpers/utils');

var UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    accessToken: { type: String, required: false, unique: true },
    radius: { type: Number },
    loc  : { type: [Number], index: '2dsphere' },
    latitude: { type: Number },
    longitude: { type: Number },
    homeLatitude: { type: Number },
    homeLongitude: { type: Number },
    state: { type: String },
    city: { type: String },
    zipcode: { type: Number },
    ads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],
    unreadConversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }]
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

UserSchema.statics = {
    findByAccessToken: function(accessToken) {
        return this.findOne({accessToken: accessToken});
    },
    addUnreadConversation: function(user, conversation, cb) {
        this.update({ username: user.username }, { $push: {unreadConversations: conversation._id }}, function(err) {
            if (err) {
                console.log(err);
                return cb(err);
            }
            
            return cb(null);
        })
    }
}

module.exports = mongoose.model('User', UserSchema);
var User = mongoose.model('User');
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('User', UserSchema);
var User = mongoose.model('User');

UserSchema.methods = {
	validPassword: function(password) {
		if (password == this.password) {
			return true;
		} else {
			return false;
		}
	}
};
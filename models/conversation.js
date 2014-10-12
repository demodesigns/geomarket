var mongoose = require('mongoose');
var utils = require('../helpers/utils');

var ConversationSchema = new mongoose.Schema({
	usernames: [{ type: String }],
    messages: [{
        date: Date,
        username: String,
        message: String
    }]
});

ConversationSchema.methods = {
};

ConversationSchema.statics = {
};

module.exports = mongoose.model('Conversation', ConversationSchema);
var Conversation = mongoose.model('Conversation');
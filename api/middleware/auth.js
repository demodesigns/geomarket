var utils = require('../../helpers/utils'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.ensureAuthenticated = function(req, res, next) {
    var accessToken = utils.getAccessToken(req);
    if (!accessToken) {
        console.log("no access token");
        return utils.badRequest(res);
    }

    User.findByAccessToken(accessToken).exec(function(err, user) {
        if (err || !user) {
            console.log("error finding user with accessToken:" + accessToken + ', err:' + err);
            utils.badRequest(res);
            return;
        }

        req.user = user;
        return next();
    });
}
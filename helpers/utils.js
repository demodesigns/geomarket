var errorMessages = require('./errorMessages');
var crypto = require('crypto')

/*
 * Route helpers
 */
exports.sendJsonResponse = function(res, status, message, data, additionalMetadata) {
    data = typeof data === 'undefined' || data === null ? {} : data;
    additionalMetadata = typeof additionalMetadata === 'undefined' || additionalMetadata === null
        ? {} : additionalMetadata;
    var jsonResponse = {
        'metadata': {
            'status': status,
            'message': message
        },
        'data': data
    };

    for (var key in additionalMetadata) {
        jsonResponse.metadata[key] = additionalMetadata[key];
    }
    return res.status(status).send(jsonResponse);
};

exports.badRequest = function(res, errorMessage) {
    errorMessage = typeof errorMessage === 'undefined' || errorMessage === null
        ? errorMessages['bad-request'] : errorMessage;

    return exports.sendJsonResponse(res, 400, '', {}, errorMessage)
};

/*
 * Auth helpers
 */
exports.hexdigest = function(inputs) {
    var hmac = crypto.createHmac('sha1', '1d71b4b8a25d5b285b72b2e4ec2dc1');
    var len = inputs.length;
    console.log(len);
    for (var i = 0; i < len; i++) {
        console.log(inputs[i]);
        hmac.update(inputs[i]);
    }
    return hmac.digest('hex');
}

exports.generateAccessToken = function(userId, date) {
    var hexdigest = exports.hexdigest([userId.toString(), date.toString()]);
    return new Buffer(hexdigest).toString('base64');
};
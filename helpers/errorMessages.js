module.exports =
{
    // generic error when there is something wrong on the server
    'bad-request': {
    	errorCode: 1,
    	message: 'Bad request'
    },
    // authorization error
    'unauthorized': {
    	errorCode: 2,
    	message: 'Unauthorized'
    },
    // sent when trying to create a user with duplicate email address
    'duplicate-user': {
    	errorCode: 3,
    	message: 'A user with that email address already exists.'
    },
    // no user found with given email address
    'email-not-found': {
    	errorCode: 4,
    	message: 'Incorrect email/password combination.'
    },
    // incorrect password
    'incorrect-password': {
    	errorCode: 5,
    	message: 'Incorrect email/password combination.'
    },
    // braintree error when making a transaction
    'bad-braintree-transaction': {
    	errorCode: 6,
    	message: 'An error occurred while submitting your payment.'
    },
    // incorrect password when changing password
    'incorrect-password-change': {
        errorCode: 7,
        message: 'Incorrect password.'
    },
    // braintree transaction denied
    'braintree-payment-denied': {
        errorCode: 8,
        message: 'Your payment method has been declined. Please try another.'
    },
    // no matching warehouse
    'no-matching-warehouse': {
        errorCode: 9,
        message: "The state you selected is not in our serviceable region."
    },
    // banned order
    'banned-order': {
        errorCode: 10,
        message: "Sorry, your order could not be processed. Please contact support@boxed.com for more information."
    },
    // bad postal code
    'bad-postal-code': {
        errorCode: 11,
        message: "The postal code you entered is not valid."
    }
};

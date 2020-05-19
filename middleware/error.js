/* eslint-disable no-console */
function handleError(err, req, res, next) {
	console.log('API error:', err);
	next(err);
}

module.exports = handleError;

/* eslint-disable no-console */
require('dotenv').config();

const logs = process.env.LOGGING;

// eslint-disable-next-line no-unused-vars
function handleError(err, req, res, next) {
	const errCode = Number(err.code || err.statusCode || 500);
	const errTime = new Date(Date.now()).toLocaleString();

	if (logs === 'ON' || logs === 'VERBOSE') {
		console.log('\nAPI error at', errTime);
		console.log('Error message:', err.message);
		console.log('Error detail:', err.detail, '\n');

		if (logs === 'VERBOSE') {
			console.log('Error object:', err);
		}
	}

	// Note if there is an erro in this func express seemingly
	// falls back to sending errors in html format.
	res.status(errCode > 599 ? 500 : errCode).json({
		error: err.message,
		code: errCode,
		time: errTime,
	});
}

module.exports = handleError;

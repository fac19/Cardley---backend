require('dotenv').config();

function verifyUser(req, res, next) {
	if (process.env.LOGGING === 'ON') {
		console.log('\nRequest for:', req.method, req.originalUrl);
	}
	if (process.env.LOGGING === 'VERBOSE') {
		console.log(`\n\n\nHTTPv${req.httpVersion}`, req.method, req.url);
		console.log('HEADERS...');
		console.log(req.headers);
		console.log('BODY...');
		console.log(req.body);
	}

	return next();
}

module.exports = verifyUser;

require('dotenv').config();

function verifyUser(req, res, next) {
	if (process.env.LOGGING === 'ON' || process.env.LOGGING === 'VERBOSE') {
		const dt = new Date();
		const ds = `\n${dt.toDateString()} - ${dt.toTimeString()}`;
		console.log(`\x1b[36m${ds}\x1b[0m`);
		// console.log('Request for:', req.method, req.originalUrl);
		console.log(`HTTPv${req.httpVersion}`, req.method, req.url);
		if (process.env.LOGGING === 'VERBOSE') {
			console.log('HEADERS...');
			console.log(req.headers);
			console.log('BODY...');
			console.log(req.body);
		}
	}

	return next();
}

module.exports = verifyUser;

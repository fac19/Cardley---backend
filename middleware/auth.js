const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SECRET;

function verifyUser(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		const error = new Error('Authorization header is required');
		error.status = 400;
		next(error);
	} else {
		const token = authHeader.replace('Bearer ', '');
		try {
			// if verification fails JWT throws an error, hence the try/catch
			const tokenData = jwt.verify(token, secret);
			req.token = tokenData;
		} catch (_) {
			// we don't use the caught error, since we know it came from jwt.verify
			const error = new Error('Unauthorized');
			error.status = 401;
			next(error);
		}
	}
}

module.exports = verifyUser;

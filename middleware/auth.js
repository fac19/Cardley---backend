/* eslint-disable no-else-return */
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SECRET;

function verifyUser(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		const error = new Error('Authorization header is required');
		error.code = 401;
		return next(error);
	} else {
		const token = authHeader.replace('Bearer ', '');
		try {
			// if verification fails JWT throws an error, hence the try/catch
			const tokenData = jwt.verify(token, secret);
			req.token = tokenData;

			// DOES VERIFY CHECK THE TIME vs EXPIRY ???
			// Write test to find out

			return next();
		} catch (_) {
			const error = new Error('Unauthorized: invalid token');
			error.code = 401;
			return next(error);
		}
	}
}

module.exports = verifyUser;

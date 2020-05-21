/* eslint-disable consistent-return */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getUser = require('../../model/getUser.js');
const { errNow } = require('../../utils.js');

function login(req, res, next) {
	// Return early with error if we don't have the necessary parameters
	if (
		!req.body.email ||
		req.body.email.length < 1 ||
		!req.body.password ||
		req.body.password.length < 1
	) {
		return next(
			errNow(400, 'Missing email or password', 'handlers/users/login'),
		);
	}

	getUser({ email: req.body.email })
		.then(async (userRecord) => {
			if (!userRecord)
				throw errNow(
					// No such email
					401,
					'Bad email or password',
					'login.js/getUser !result',
				);
			const result = await bcrypt.compare(
				req.body.password,
				userRecord.password_slug,
			);
			if (!result)
				throw errNow(
					// Bad password
					401,
					'Bad email or password',
					'login.js/getUser !result',
				);
			const token = jwt.sign(
				{ user_id: userRecord.user_id },
				process.env.SECRET,
				{ expiresIn: '24h' },
			);
			// We need to decode the token here so we can send the
			// expiry time alongside the new users id and name so
			// the client doesn't need to decode the jwt
			const tokenData = jwt.verify(token, process.env.SECRET);
			res.status(200).send({
				token,
				expires: tokenData.exp,
				user_id: userRecord.user_id,
				user_name: userRecord.user_name,
			});
		})
		.catch(next);
}

module.exports = login;

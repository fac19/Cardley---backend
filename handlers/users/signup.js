/* eslint-disable consistent-return */
/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["err"] }] */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createUser = require('../../model/createUser.js');
require('dotenv').config();
const { errNow } = require('../../utils.js');

function signup(req, res, next) {
	// Return early with error if we don't have the necessary parameters
	// OR if they are too short, or email doesn't look like an email
	if (
		!req.body.email ||
		req.body.email.length < 1 ||
		!/(.+)@(.+){2,}\.(.+){2,}/.test(req.body.email) ||
		!req.body.password ||
		req.body.password.length < 1 ||
		!req.body.name ||
		req.body.name.length < 1
	) {
		return next(
			errNow(400, 'Missing email or password', 'handlers/users/login'),
		);
	}

	// Create a new bcrypt slug from the provided password
	bcrypt
		.genSalt(10)
		.then((salt) => bcrypt.hash(req.body.password, salt))
		.then((hashedPassword) => {
			const user = {
				userName: req.body.name,
				password: hashedPassword,
				email: req.body.email,
			};
			createUser(user)
				.then((userId) => {
					const token = jwt.sign(
						{ user_id: userId },
						process.env.SECRET,
						{ expiresIn: '24h' },
					);
					// We need to decode the token here so we can send the
					// expiry time alongside the new users id and name so
					// the client doesn't need to decode the jwt
					const tokenData = jwt.verify(token, process.env.SECRET);
					res.status(201).send({
						token,
						expires: tokenData.exp,
						user_id: userId,
						user_name: req.body.name,
					});
				})
				.catch((err) => {
					next(
						errNow(
							409,
							'User name or email already exists?',
							'handlers/users/signup/createUser',
							err,
						),
					);
				});
		})
		.catch((err) => {
			err.detail = `handlers/users/signup within bcrypt: ${err.detail}`;
			next(err);
		});
}

module.exports = signup;

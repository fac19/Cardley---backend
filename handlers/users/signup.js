/* eslint-disable no-unused-vars */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const createUser = require('../../model/createUser.js');
require("dotenv").config()

function signup(req, res, next) {
	bcrypt.genSalt(20)
	.then(salt => {
		console.log("SALT:", salt)
		return bcrypt.hash(req.body.password, salt)
	})
	.then(hashedPassword => {
		const user = {
			userName: req.body.name,
			password: hashedPassword,
			email: req.body.email
		}
		createUser(user)
		.then(userId =>{
			const token = jwt.sign(
				{
					user_id: userId
				},
				process.env.SECRET,
				{
					expiresIn: "24h"
				}
			)
			res.status(201).send({
				token,
				// TODO: send expire time back to frontend?
				user_id: userId,
				user_name: req.body.name
			})
		})
		.catch(next) //is it correct to call next here for error handling?
	})
	.catch(next)
}

module.exports = signup;

const get = require('../../model/get.js');

function getDecks(req, res, next) {
	console.log(req.token);
	get({ user_id: req.token.user_id })
		.then((result) => {
			res.status(200).send(result);
		})
		.catch(next);
}

module.exports = getDecks;

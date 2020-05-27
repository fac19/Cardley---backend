const get = require('../../model/getDecks.js');

function getDecks(req, res, next) {
	get({ user_id: req.token.user_id })
		.then((result) => {
			res.status(200).send(result);
		})
		.catch(next);
}

module.exports = getDecks;

const getPublicDecks = require('../../model/getPublicDecks.js');

function getPublic(req, res, next) {
	getPublicDecks()
		.then((result) => {
			res.status(200).send(result);
		})
		.catch(next);
}

module.exports = getPublic;

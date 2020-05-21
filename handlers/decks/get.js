const get = require('../../model/get.js');

function getDecks(req, res, next) {
	get()
		.then((result) => {
			res.status(200).send(result);
		})
		.catch(next);
}

module.exports = getDecks;

const getFromDatabase = require('../../model/getCardsInDeck');

function getCardsInDeck(req, res, next) {
	getFromDatabase(req.params.deck_id)
		.then((result) => {
			res.status(200).send(result.rows);
		})
		.catch(next);
}

module.exports = getCardsInDeck;

// add check for user id
// write test

const getFromDatabase = require('../../model/getCardsInDeck');

function getCardsInDeck(req, res, next) {
	getFromDatabase(req.params.deck_id)
		.then((result) => {
			res.status(200).send(result.rows);
		})
		.catch(next);
}

module.exports = getCardsInDeck;

// add check for user id - user should only be able to get deck if they are subscribed to it?? Can Vatsal see Gregor's deck? I guess this is something we haven't discussed.
// write test
// adjust documentation: search param

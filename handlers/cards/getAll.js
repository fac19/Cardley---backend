const getFromDatabase = require('../../model/getCardsInDeck');
const { canReadDeckOrDie } = require('../../model/helpers');

function getCardsInDeck(req, res, next) {
	canReadDeckOrDie(req.params.deck_id, req.token.user_id)
		.then(() => {
			getFromDatabase(req.params.deck_id)
				.then((result) => {
					res.status(200).send(result.rows);
				})
				.catch(next);
		})
		.catch(next);
}

module.exports = getCardsInDeck;

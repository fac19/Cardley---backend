const db = require('../db/connection.js');

function getCardsInDeck(deckId) {
	return db.query('select * from cards where deck_id = $1;', [deckId]);
}

module.exports = getCardsInDeck;

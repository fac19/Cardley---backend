const db = require('../db/connection.js');

function getCardsInDeck(id) {
	console.log(id);
	return db.query('select * from cards where deck_id = $1;', [id]);
}

module.exports = getCardsInDeck;

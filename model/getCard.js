/* eslint-disable no-else-return */
const db = require('../db/connection.js');

// TODO We have permission checking happen elsewhere nows
// So refactor to use a single integer as it's parameter
// and get rid of the if/else.
function getCard(cardId) {
	return db
		.query(`SELECT * FROM cards WHERE card_id = $1`, [cardId])
		.then((result) => result.rows[0]);
}

module.exports = getCard;

const db = require('../db/connection.js');
const { errNow } = require('../utils.js');

function getDeckIdByName(deckName) {
	return db
		.query(`SELECT * FROM decks WHERE deck_name = $1`, [deckName])
		.then((result) => result.rows[0].deck_id);
}

function getUserIdByName(userName) {
	return db
		.query(`SELECT * FROM users WHERE user_name = $1`, [userName])
		.then((result) => result.rows[0].user_id);
}

function canReadDeckOrDie(deckId, userId) {
	return db
		.query(`SELECT * FROM decks WHERE deck_id = $1`, [deckId])
		.then(({ rows }) => {
			if (!rows || (rows[0].owner_id !== userId && !rows[0].published)) {
				throw errNow(
					401,
					"Deck doesn't exist or you don't have permission to see it",
					'helpers/canReadDeckOrDie',
				);
			}
		});
}

function canWriteDeckOrDie(deckId, userId) {
	return db
		.query(`SELECT * FROM decks WHERE deck_id = $1`, [deckId])
		.then(({ rows }) => {
			if (!rows || rows[0].owner_id !== userId) {
				throw errNow(
					401,
					"Deck doesn't exist or you don't have write permission",
					'helpers/canWriteDeckOrDie',
				);
			}
		});
}

// TODO

// canReadCardOrDie
function canReadCardOrDie(cardId, userId) {
	return db
		.query(
			`
			SELECT
				decks.owner_id, decks.published
			FROM
				decks
			INNER JOIN
				cards
			ON
			    cards.deck_id = decks.deck_id
			WHERE
				cards.card_id = $1
			`,
			[cardId],
		)
		.then(({ rows }) => {
			if (!rows || (rows[0].owner_id !== userId && !rows[0].published)) {
				throw errNow(
					401,
					"Card doesn't exist or you don't have permission to see it",
					'helpers/canReadCardOrDie',
				);
			}
		});
}

// carWriteCardOrDie

module.exports = {
	getDeckIdByName,
	getUserIdByName,
	canReadDeckOrDie,
	canWriteDeckOrDie,
	canReadCardOrDie,
};

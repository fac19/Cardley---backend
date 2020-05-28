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
			if (
				rows.length === 0 ||
				(rows[0].owner_id !== userId && !rows[0].published)
			) {
				throw errNow(
					401,
					"Deck doesn't exist or you don't have permission to see it",
					'helpers/canReadDeckOrDie',
				);
			}
		});
}

function dieIfWeOwnThisDeck(deckId, userId) {
	return db
		.query(`SELECT * FROM decks WHERE deck_id = $1`, [deckId])
		.then(({ rows }) => {
			if (rows.length === 0 || rows[0].owner_id === userId) {
				throw errNow(
					401,
					"Deck doesn't exist or you are the owner of this deck",
					'helpers/dieIfWeOwnThisDeck',
				);
			}
		});
}

function canWriteDeckOrDie(deckId, userId) {
	return db
		.query(`SELECT * FROM decks WHERE deck_id = $1`, [deckId])
		.then(({ rows }) => {
			if (rows.length === 0 || rows[0].owner_id !== userId) {
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
			if (
				rows.length === 0 ||
				(rows[0].owner_id !== userId && !rows[0].published)
			) {
				throw errNow(
					401,
					"Card doesn't exist or you don't have permission to see it",
					'helpers/canReadCardOrDie',
				);
			}
		});
}

// carWriteCardOrDie
function canWriteCardOrDie(cardId, userId) {
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
			if (rows.length === 0 || rows[0].owner_id !== userId) {
				throw errNow(
					401,
					// eslint-disable-next-line max-len
					"Card doesn't exist or you don't have permission to write it",
					'helpers/canWriteCardOrDie',
				);
			}
		});
}

function dieIfNotPublished(deckId) {
	return db
		.query(
			`
			SELECT
				*
			FROM
				decks
			WHERE
				deck_id = $1
			AND
				published = true`,
			[deckId],
		)
		.then(({ rows }) => {
			if (rows.length === 0) {
				throw errNow(
					401,
					"Deck doesn't exist or it isn't published",
					'helpers/dieIfNotPublished',
				);
			}
		});
}

function dieIfWeHaveAlready(deckId, userId) {
	return db
		.query(
			`
		SELECT
			*
		FROM
			collections
		WHERE
			deck_id = $1 AND user_id = $2
		`,
			[deckId, userId],
		)
		.then(({ rows }) => {
			if (rows.length === 1) {
				throw errNow(
					401,
					'You already have that deck in your collection',
					'helpers/dieIfWeHaveAlready',
				);
			}
		});
}

function getEveryCardIdInDeck(deckId) {
	return db
		.query(`SELECT card_id FROM cards WHERE deck_id = $1`, [deckId])
		.then(({ rows }) => {
			return rows.map((row) => row.card_id);
		});
}

module.exports = {
	getDeckIdByName,
	getUserIdByName,
	canReadDeckOrDie,
	canWriteDeckOrDie,
	canReadCardOrDie,
	canWriteCardOrDie,
	dieIfNotPublished,
	dieIfWeHaveAlready,
	getEveryCardIdInDeck,
	dieIfWeOwnThisDeck,
};

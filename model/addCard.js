const db = require('../db/connection.js');
const errNow = require('../utils.js');

// NEED TO TEST THIS
function addCard(card) {
	return db
		.query(
			`INSERT INTO
	cards(deck_id, front_text,
		front_image, back_text, back_image, important, color)
	VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING card_id;`,
			[
				card.deckId,
				card.front_text,
				card.front_image,
				card.back_text,
				card.back_image,
				card.important,
				card.color,
			],
		)
		.then((result) => {
			if (result.rowCount !== 1)
				errNow(
					'500',
					'Could not add card to deck',
					`model/addCard.js, couldn't add
					card to deck_id ${card.deckId}`,
				);
			return result.rows[0];
		});
}

module.exports = addCard;

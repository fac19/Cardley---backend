const db = require('../db/connection.js');
const { errNow } = require('../utils.js');

function updateCard(card) {
	return db
		.query(
			`
			UPDATE
				cards
			SET
				front_text = COALESCE($2, front_text),
				front_image = COALESCE($3, front_image),
				back_text = COALESCE($4, back_text),
				back_image = COALESCE($5, back_image),
				important = COALESCE($6, important),
				color = COALESCE($7, color)
			WHERE
				card_id = ($1)
			RETURNING
				*`,
			[
				card.cardId,
				card.front_text,
				card.front_image,
				card.back_text,
				card.back_image,
				card.important,
				card.color,
			],
		)
		.then((result) => {
			if (result.rows.length !== 1) {
				throw errNow(
					500,
					`Problem updating deck ordering`,
					'models/updateCard result.rows !== 1',
				);
			}
			return true;
		});
}

module.exports = updateCard;

import db from '../db/connection';

// NEED TO TEST THIS
function postCard({
	deckId,
	frontText,
	frontImage,
	backText,
	backImage,
	important,
	color,
}) {
	return db.query(
		`INSERT INTO
	cards(deck_id, front_text,
		front_image, back_text, back_image, important, color)
	VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
		[deckId, frontText, frontImage, backText, backImage, important, color],
	);
}

export default postCard;

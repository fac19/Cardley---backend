const updateCardModel = require('../../model/updateCard');
const { canWriteCardOrDie } = require('../../model/helpers.js');
const { errNow } = require('../../utils.js');

async function updateCard(req, res, next) {
	try {
		// Verify card_id from URL parameter is a positive integer
		const cardId = Number(req.params.card_id);
		if (Number.isNaN(cardId) || cardId < 1)
			throw errNow(
				400,
				`Card ID must be a positive int, we got ${req.params.card_id}`,
				'handlers/cards/updateCard - req.params.card_id is NaN!',
			);
		// Check user has permission to write to this deck
		await canWriteCardOrDie(cardId, req.token.user_id);

		// Prepare addCard parameter object
		const cardDetails = {
			cardId,
			front_text: req.body.front_text,
			front_image: req.body.front_image,
			back_text: req.body.back_text,
			back_image: req.body.back_image,
			important: req.body.important,
			color: req.body.color,
		};

		// run update, it should throw if it fails
		await updateCardModel(cardDetails);
		return res.status(200).send({ updated: true });
	} catch (err) {
		next(err);
	}
	return true; // Linter insists!
}

module.exports = updateCard;

const getOrdering = require('../../model/getOrdering.js');
const getCard = require('../../model/getCard.js');
const { canReadDeckOrDie } = require('../../model/helpers.js');

async function getFirst(req, res, next) {
	try {
		// Step 0. Ensure user has permission to see this deck
		await canReadDeckOrDie(Number(req.params.deck_id), req.token.user_id);

		// Step 1. Get the users card ordering for this deck
		const orderingJSON = await getOrdering({
			deckId: Number(req.params.deck_id),
			userId: req.token.user_id,
		});

		// Step 2. JSON decode the ordering and get card_id[0]
		const ordering = JSON.parse(orderingJSON);
		const cardId = ordering[0];

		// Step 3. Use that card_id to get the card
		const card = await getCard(cardId);

		res.status(200).send({
			current_position: 0,
			deck_length: ordering.length,
			card,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = getFirst;

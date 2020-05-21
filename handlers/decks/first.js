const getOrdering = require('../../model/getOrdering.js');
const getCard = require('../../model/getCard.js');

function getFirst(req, res, next) {
	// Step 1. Get the users card ordering for this deck
	getOrdering({
		deckId: Number(req.params.deck_id),
		userId: req.token.user_id,
	})
		.then(async (orderingJSON) => {
			// Step 2. JSON decode the ordering and get card_id[0]
			const ordering = JSON.parse(orderingJSON);
			const cardId = ordering[0];

			// Step 3. Use that card_id to get the card
			const card = await getCard({ cardId });

			res.status(200).send({
				current_position: 0,
				deck_length: ordering.length,
				card,
			});
		})
		.catch(next);
}

module.exports = getFirst;

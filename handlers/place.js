const getOrdering = require('../model/getOrdering.js');
const updateOrdering = require('../model/updateOrdering.js');
const getCard = require('../model/getCard');

/* This function places a card back in it's deck at the index
specified by the caller with body.place. It then returns the
first card in the deck specified with body.next_deck */
function place(req, res, next) {
	const deckId = Number(req.body.deck_id);
	const nextDeck = Number(req.body.next_deck);
	const userId = req.token.user_id;
	const newPlace = req.body.place;

	// get ordering of deck from previous card, for reinsertion
	getOrdering({
		deckId,
		userId,
	})
		.then(async (orderingJSON) => {
			const ordering = JSON.parse(orderingJSON);
			const firstCard = ordering.shift();
			// splice for new ordering
			ordering.splice(newPlace, 0, firstCard);
			// update ordering of collection for previous card
			await updateOrdering(userId, deckId, JSON.stringify(ordering));

			// We now need to return a next card
			// this might be from a different deck though
			// so we need to get the ordering again.

			const newOrdering = await getOrdering({
				deckId: nextDeck,
				userId,
			});
			const newCardId = JSON.parse(newOrdering)[0];

			// We then use that card_id to get and return the card
			const card = await getCard({ cardId: newCardId });
			res.status(200).send({
				current_position: 0,
				deck_length: ordering.length,
				card,
			});
		})
		.catch(next);
}

module.exports = place;

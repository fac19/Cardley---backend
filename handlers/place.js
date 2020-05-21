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

	// Get the order of this deck for this user as it is now
	getOrdering({
		deckId,
		userId,
	})
		.then(async (orderingJSON) => {
			// It is a JSON string so decode it.
			// Take the card from the front of the deck
			// and insert it back at the specified index.
			const ordering = JSON.parse(orderingJSON);
			const firstCard = ordering.shift();
			ordering.splice(newPlace, 0, firstCard);

			// Save this ordering to the database
			await updateOrdering({
				userId,
				deckId,
				newOrdering: JSON.stringify(ordering),
			});

			// We now need to return the next card.
			// This might be from a different deck though
			// so we need to get the ordering again using
			// the deck_id nextDeck then get the 0th card_id

			const newOrdering = await getOrdering({
				deckId: nextDeck,
				userId,
			});
			const newCardId = JSON.parse(newOrdering)[0];

			// We then return that card
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

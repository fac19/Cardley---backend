const getOrdering = require('../model/getOrdering.js');
const updateOrdering = require('../model/updateOrdering.js');
const getCard = require('../model/getCard');
const { errNow } = require('../utils.js');

/* This function places a card back in it's deck at the index
specified by the caller with body.place. It then returns the
first card in the deck specified with body.next_deck */
function place(req, res, next) {
	const deckId = Number(req.body.deck_id);
	if (Number.isNaN(deckId)) {
		throw errNow(400, 'deck_id must be an integer', 'handlers/place.js');
	}
	const nextDeck = Number(req.body.next_deck);
	if (Number.isNaN(nextDeck)) {
		throw errNow(400, 'next_deck must be an integer', 'handlers/place.js');
	}
	const userId = Number(req.token.user_id);
	if (Number.isNaN(userId)) {
		throw errNow(400, 'user_id must be an integer', 'handlers/place.js');
	}
	const newPlace = Number(req.body.place);
	if (Number.isNaN(newPlace)) {
		throw errNow(400, 'place must be an integer', 'handlers/place.js');
	}
	// In theory we also get card_id although right now we are ignoring it and
	// presuming that we always want to move the card at index 0.

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
			await updateOrdering(userId, deckId, JSON.stringify(ordering));

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
			const card = await getCard(newCardId);
			res.status(200).send({
				current_position: 0,
				deck_length: ordering.length,
				card,
			});
		})
		.catch(next);
}

module.exports = place;

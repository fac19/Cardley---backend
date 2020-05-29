/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const addCardModel = require('../../model/addCard');
const updateOrdering = require('../../model/updateOrdering.js');
const getCollectionsByDeck = require('../../model/getCollectionsByDeck.js');
const { canWriteDeckOrDie } = require('../../model/helpers.js');
const { errNow } = require('../../utils.js');

async function createCard(req, res, next) {
	try {
		// Verify card_id from URL parameter is a positive integer
		const deckId = Number(req.params.deck_id);
		if (Number.isNaN(deckId) || deckId < 1)
			throw errNow(
				400,
				`Deck ID must be a positive int, we got ${req.params.deck_id}`,
				'handlers/cards/createCard - req.params.deck_id is NaN!',
			);

		// Check user has permission to write to this deck
		await canWriteDeckOrDie(deckId, req.token.user_id);

		// Check other mandatory parameters
		// must have either front_text OR front_image
		if (!req.body.front_text && !req.body.front_image) {
			throw errNow(
				400,
				'Cards must have either front_text OR front_image',
				'handlers/cards/createCard.js',
			);
		}

		// Prepare addCard parameter object
		const cardDetails = {
			deckId,
			front_text: req.body.front_text,
			front_image: req.body.front_image,
			back_text: req.body.back_text,
			back_image: req.body.back_image,
			important: req.body.important,
			color: req.body.color,
		};

		// step 1: add card to cards table, returning card_id
		const newCard = await addCardModel(cardDetails);
		const newCardId = newCard.card_id;
		// console.log('newCardId:', newCardId);

		// step 2: add card_id to end of every collection matching deck_id

		// Iterate through all the collections that use the deck
		// Decode them, insert new card id at the start and re-save
		const collections = await getCollectionsByDeck(deckId);

		// Refactored as for loop to avoid async jank!
		// We don't want to return til this has been done.
		for (let colIdx = 0; colIdx < collections.length; colIdx++) {
			const order = JSON.parse(collections[colIdx].ordering);
			order.unshift(newCardId);
			await updateOrdering(
				collections[colIdx].user_id,
				collections[colIdx].deck_id,
				JSON.stringify(order),
			);
		}

		return res.status(201).send({
			created: true,
			card_id: newCardId,
		});
	} catch (err) {
		next(err);
	}
	return true; // Linter insisted!
}

module.exports = createCard;

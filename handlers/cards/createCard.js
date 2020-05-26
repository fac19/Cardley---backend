const addCardModel = require('../../model/addCard');
const updateOrdering = require('../../model/updateOrdering.js');
const getCollectionsByDeck = require('../../model/getCollectionsByDeck.js');
const { canWriteDeckOrDie } = require('../../model/helpers.js');
const { errNow } = require('../../utils.js');

async function createCard(req, res, next) {
	try {
		const deckId = Number(req.params.deck_id);
		if (Number.isNaN(deckId))
			throw errNow(
				400,
				`Deck ID must be an integer, we got ${req.params.deck_id}`,
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

		const cardDetails = {
			deckId,
			front_text: req.body.front_text,
			front_image: req.body.front_image,
			back_text: req.body.back_text,
			back_image: req.body.back_image,
			important: req.body.important,
			color: req.body.color,
		};

		// console.log('cardDetails:', cardDetails);

		// step 1: add card to cards table, returning card_id
		const newCard = await addCardModel(cardDetails);
		const newCardId = newCard.card_id;
		// console.log('newCardId:', newCardId);

		// step 2: add card_id to end of every collection matching deck_id

		// Iterate through all the collections that use the deck
		// Decode them, insert new card id at the start and re-save
		const collections = await getCollectionsByDeck(deckId);
		collections.forEach(async (collection) => {
			const order = JSON.parse(collection.ordering);
			order.unshift(newCardId);
			await updateOrdering(
				collection.user_id,
				collection.deck_id,
				JSON.stringify(order),
			);
		});

		return res.send({
			created: true,
			card_id: newCardId,
		});
	} catch (err) {
		next(err);
	}
	return true; // Linter insisted!
}

module.exports = createCard;

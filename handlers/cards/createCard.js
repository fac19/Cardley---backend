// const addCardModel = require('../../model/addCard');
// const updateOrdering = require('../../model/updateOrdering.js');
// const getCollections = require('../../model/getCollections.js');
// const { canWriteDeckOrDie } = require('../../model/helpers.js');
// const { errNow } = require('../../utils.js');

// WILL BREAK THE CODE
async function addCard(req, res, next) {
	try {
		// const deckId = Number(req.params.deck_id);

		// // Check user has permission to write to this deck
		// await canWriteDeckOrDie(deckId, req.token.user_id);

		// // Check mandatory parameters
		// // must have either front_text OR front_image
		// if (!req.body.front_text && !req.body.front_image) {
		// 	throw errNow(
		// 		"400",
		// 		"Cards must have either front_text OR front_image",
		// 		"handlers/cards/createCard.js"
		// 	)
		// }

		// const cardDetails = {
		// 	deckId,
		// 	front_text: req.body.front_text,
		// 	front_image: req.body.front_image,
		// 	back_text: req.body.back_text,
		// 	back_image: req.body.back_image,
		// 	important: req.body.important,
		// 	color: req.body.color || `#FFF`,
		// };

		// console.log("cardDetails:", cardDetails)

		// step 1: add card to cards table, returning card_id
		// const newCard = await addCardModel(cardDetails);
		// const newCardId = newCard.card_id;
		// console.log('newCardId:', newCardId);

		// step 2: add card_id to end of every collection matching deck_id
		// iterrate through each matching collection id

		// get current ordering
		// decode current ordering
		// insert new card id at front
		// reencode
		// save to db

		// const collections = await getCollections(deckId)
		// console.log("COLLECTIONS:", collections);

		// collections.forEach(async (collection) => {
		// 	console.log("COLLECTION:", collection);
		// 	const order = JSON.parse(collection.ordering);
		// 	order.unshift(newCardId);
		// 	const result = await updateOrdering(
		// 		collection.user_id,
		// 		collection.deck_id,
		// 		JSON.stringify(order)
		// 	);
		// 	if (!result)
		// 		errNow(
		// 			500,
		// 			'Problem updating order of cards',
		// 			'handlers/cards/add.js - updateCollection',
		// 		);
		// 	// return;
		// })
		res.send({ ok: 'ok' });
	} catch (err) {
		console.log('createCardCATCH:', err);
		next(err);
	}
}

module.exports = addCard;

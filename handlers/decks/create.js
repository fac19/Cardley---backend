const addDeck = require('../../model/addDeck');
const addCollection = require('../../model/addCollection');

async function postDeck(req, res, next) {
	try {
		const deckIdResponse = await addDeck({
			ownerId: req.token.user_id,
			deckName: req.params.deck_name,
		});

		const deckId = deckIdResponse.deck_id;

		await addCollection({
			deckId,
			userId: req.token.user_id,
		});

		res.status(200).send({
			deck_id: deckId,
		});
	} catch (err) {
		next(err);
	}
}

module.exports = postDeck;

const addCollection = require('../../model/addCollection');
const { dieIfNotPublished } = require('../../model/helpers.js');
const { dieIfWeHaveAlready } = require('../../model/helpers.js');
const { getEveryCardIdInDeck } = require('../../model/helpers.js');

async function addPublic(req, res, next) {
	try {
		await dieIfNotPublished(req.params.deck_id);
		await dieIfWeHaveAlready(req.params.deck_id, req.token.user_id);
		const ordering = await getEveryCardIdInDeck(req.params.deck_id);
		const addedOrdering = await addCollection({
			deckId: req.params.deck_id,
			userId: req.token.user_id,
			ordering,
		});
		if (JSON.stringify(ordering) !== addedOrdering)
			throw new Error("Ordering didn't save for some reason, boo!");

		res.status(200).send({ added: true });
	} catch (err) {
		next(err);
	}
}

module.exports = addPublic;

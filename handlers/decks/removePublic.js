const removeCollection = require('../../model/removeCollection');
const { dieIfWeOwnThisDeck } = require('../../model/helpers.js');

async function removePublic(req, res, next) {
	try {
		await dieIfWeOwnThisDeck(req.params.deck_id);
		await removeCollection({
			deckId: req.params.deck_id,
			userId: req.token.user_id,
		});
		res.status(200).send({ removed: true });
	} catch (err) {
		next(err);
	}
}

module.exports = removePublic;

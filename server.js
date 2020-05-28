require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const handleError = require('./middleware/error');
const logging = require('./middleware/logging');

// Our handlers
const signup = require('./handlers/users/signup.js');
const login = require('./handlers/users/login.js');
const getPublic = require('./handlers/decks/getPublic.js');
const getDecks = require('./handlers/decks/get.js');
const getFirst = require('./handlers/decks/first.js');
const postDeck = require('./handlers/decks/createDeck.js');
const place = require('./handlers/place.js');
const getCardsInDeck = require('./handlers/cards/getAll.js');
const createCard = require('./handlers/cards/createCard.js');
const updateCard = require('./handlers/cards/updateCard.js');
const addPublic = require('./handlers/decks/addPublic.js');
const removePublic = require('./handlers/decks/removePublic.js');

const PORT = process.env.PORT || 3001;
const server = express();
server.use(express.json());
server.use(cors());

if (process.env.TESTING !== 'TRUE') {
	server.use(logging);
}

server.post('/signup', signup);
server.post('/login', login);
server.get('/public-decks', auth, getPublic);
server.get('/decks', auth, getDecks);
server.get('/decks/first/:deck_id', auth, getFirst);
server.post('/decks/:deck_name', auth, postDeck);
server.get('/cards/deck/:deck_id', auth, getCardsInDeck);
server.post('/place', auth, place);
server.post('/cards/:deck_id', auth, createCard);
server.put('/cards/:card_id', auth, updateCard);
server.post('/decks/add-public/:deck_id', auth, addPublic);
server.delete('/decks/remove-public/:deck_id', auth, removePublic);

server.use(handleError);

if (process.env.TESTING !== 'TRUE') {
	server.listen(PORT, () =>
		// eslint-disable-next-line
		console.log(`Listening on http://localhost:${PORT}`),
	);
}

module.exports = server;

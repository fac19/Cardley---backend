require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const handleError = require('./middleware/error');

// Our handlers
const signup = require('./handlers/users/signup.js');
const login = require('./handlers/users/login.js');
const getPublic = require('./handlers/decks/getPublic.js');
const getDecks = require('./handlers/decks/get.js');
const getFirst = require('./handlers/decks/first.js');

const PORT = process.env.PORT || 3000;
const server = express();
server.use(express.json());
server.use(cors());

server.post('/signup', signup);
server.post('/login', login);
server.get('/public-decks', getPublic);
server.get('/decks', getDecks);
server.get('/decks/first/:deck_id', auth, getFirst);

server.use(handleError);

if (process.env.TESTING !== 'TRUE') {
	server.listen(PORT, () =>
		// eslint-disable-next-line
		console.log(`Listening on http://localhost:${PORT}`),
	);
}

module.exports = server;

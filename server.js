require('dotenv').config();
const express = require('express');
const auth = require('./middleware/auth');
const handleError = require('./middleware/error');

// Our handlers
const signup = require('./handlers/users/signup.js');
const getPublic = require('./handlers/decks/getPublic.js');

const PORT = process.env.PORT || 3000;
const server = express();
server.use(express.json());

server.post('/signup', signup);
server.get('/public-decks', getPublic);

server.use(handleError);

if (process.env.TESTING !== 'TRUE') {
	server.listen(PORT, () =>
		console.log(`Listening on http://localhost:${PORT}`),
	);
}

module.exports = server;

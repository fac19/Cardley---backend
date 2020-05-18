const express = require('express');
// const auth = require('./middleware/auth');
const signup = require('./handlers/users/signup.js');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const server = express();
server.use(express.json());

server.post('/signup', signup);

if (process.env.TESTING !== 'TRUE') {
	server.listen(PORT, () =>
		console.log(`Listening on http://localhost:${PORT}`),
	);
}

module.exports = server;

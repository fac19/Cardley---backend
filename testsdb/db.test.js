const supertest = require('supertest');
const build = require('../db/build');
const db = require('../db/connection');
const server = require('../server');

const createUser = require('../model/createUser');
const getUser = require('../model/getUser');
const get = require('../model/get');
const getOrdering = require('../model/getOrdering');
const getCard = require('../model/getCard');

const helpers = require('../model/helpers');

test('Database builds with test fixtures', () => {
	return build().then(() => {
		return db.query('SELECT * FROM users WHERE USER_ID = 1').then((res) => {
			expect(res.rows[0].user_name).toBe('admin');
		});
	});
});

test('model createUser - signup data is successfully entered into db', () => {
	return build().then(() => {
		const params = {
			userName: 'Bob',
			email: 'bob@iscool.com',
			password: 'wevs',
		};
		return createUser(params).then((res) => {
			expect(typeof res).toBe(typeof 1);
		});
	});
});

test('model getUser - check we can get a user record by email', () => {
	return build().then(() => {
		const params = {
			email: 'admin@iscool.com',
		};
		return getUser(params).then((res) => {
			expect(res.user_name).toBe('admin');
			expect(res.password_slug.length).toBeGreaterThan(10);
		});
	});
});

test('model getCard - check we can get a card by card_id', async () => {
	await build();
	const params = { cardId: 1 };
	const card = await getCard(params);

	expect(card.card_id).toBeDefined();
	expect(card.deck_id).toBeDefined();
	expect(card.front_text).toBeDefined();
	expect(card.front_image).toBeDefined();
	expect(card.back_text).toBeDefined();
	expect(card.back_image).toBeDefined();
	expect(card.important).toBeDefined();
	expect(card.color).toBeDefined();

	expect(card.front_text).toBe('window');
});

test('model get - check model returns a list of decks', () => {
	return build().then(() => {
		const params = {
			user_id: 1,
		};
		return get(params).then((res) => {
			expect(Array.isArray(res)).toBe(true);
			expect(res.length > 1).toBe(true);
			expect(res[0].user_name).toBe('admin');
			expect(
				res[0].deck_name === 'French Vocab' ||
					res[0].deck_name === 'ES6 APIs',
			).toBe(true);
			expect(typeof res[0].deck_id).toBe(typeof 1);
		});
	});
});

// Prettier insists on reformatting it to be >80 chars long!
// eslint-disable-next-line max-len
test('model getOrdering - check we can get an ordering by user_id', async () => {
	await build();
	const userId = await helpers.getUserIdByName('admin');
	const deckId = await helpers.getDeckIdByName('French Vocab');
	// console.log('THE IDS:', userId, deckId);
	const ordering = await getOrdering({ userId, deckId });
	// console.log('ORDERING:', ordering);
	expect(ordering).toBe(JSON.stringify([1, 2, 4, 5]));
});

test('model canReadCardOrDie - happy path', async () => {
	await build();
	const userId = await helpers.getUserIdByName('admin');
	return expect(helpers.canReadCardOrDie(2, userId)).resolves;
});

test('model canReadCardOrDie - check we die if we should', async () => {
	await build();
	const userId = await helpers.getUserIdByName('tom');
	return expect(helpers.canReadCardOrDie(2, userId)).rejects.toThrowError(
		"Card doesn't exist or you don't have permission to see it",
	);
});

// HANDLERS
// HANDLERS
// HANDLERS

test('handler /signup, happy path', async () => {
	await build();
	const res = await supertest(server)
		.post('/signup')
		.send({
			name: 'roger',
			password: 'rogeriscool',
			email: 'roger@iscool.com',
		})
		.expect(201)
		.expect('content-type', 'application/json; charset=utf-8');
	expect(res.body.user_name).toBe('roger');
	expect(typeof res.body.user_id).toBe(typeof 1);
	expect(res.body.token.length).toBeGreaterThan(10);
});

test('handler /signup, duplicate name', async () => {
	await build();
	const res = await supertest(server)
		.post('/signup')
		.send({
			name: 'Mateybobs',
			password: 'rogeriscool',
			email: 'admin@iscool.com',
		})
		.expect(409)
		.expect('content-type', 'application/json; charset=utf-8');
	expect(res.body.error).toBe('User name or email already exists?');
});

test('handler /public-decks, happy path', async () => {
	await build();
	const res = await supertest(server)
		.get('/public-decks')
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');
	const userNames = res.body.map((v) => v.user_name);
	const deckNames = res.body.map((v) => v.deck_name);
	expect(userNames.includes('admin')).toBe(true);
	expect(deckNames.includes('ES6 APIs')).toBe(true);
});

test('handler /login, happy path', async () => {
	await build();
	// Sign up for an account
	await supertest(server)
		.post('/signup')
		.send({
			name: 'roger',
			password: 'rogeriscool',
			email: 'roger@iscool.com',
		})
		.expect(201)
		.expect('content-type', 'application/json; charset=utf-8');

	// Log into that account
	const login = await supertest(server)
		.post('/login')
		.send({
			password: 'rogeriscool',
			email: 'roger@iscool.com',
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');

	expect(login.body.user_name).toBe('roger');
	expect(login.body.token.length).toBeGreaterThan(10);
});

test('handler /login, good email, bad password', async () => {
	await build();
	// Sign up for an account
	await supertest(server)
		.post('/signup')
		.send({
			name: 'roger',
			password: 'rogeriscool',
			email: 'roger@iscool.com',
		})
		.expect(201)
		.expect('content-type', 'application/json; charset=utf-8');

	// Log into that account
	const login = await supertest(server)
		.post('/login')
		.send({
			password: 'rogerisfool',
			email: 'roger@iscool.com',
		})
		.expect('content-type', 'application/json; charset=utf-8');

	expect(login.body.error).toBe('Bad email or password');
	expect(login.body.code).toBe(401);
});

test('handler /login, bad email, good password', async () => {
	await build();
	// Sign up for an account
	await supertest(server)
		.post('/signup')
		.send({
			name: 'roger',
			password: 'rogeriscool',
			email: 'roger@iscool.com',
		})
		.expect(201)
		.expect('content-type', 'application/json; charset=utf-8');

	// Log into that account
	const login = await supertest(server)
		.post('/login')
		.send({
			password: 'rogeriscool',
			email: 'boger@iscool.com',
		})
		// .expect(200)
		.expect('content-type', 'application/json; charset=utf-8');

	expect(login.body.error).toBe('Bad email or password');
	expect(login.body.code).toBe(401);
});

test('handler /login, empty field', async () => {
	await build();

	// Sign up for an account
	await supertest(server)
		.post('/signup')
		.send({
			name: 'roger',
			password: 'rogeriscool',
			email: 'roger@iscool.com',
		})
		.expect(201)
		.expect('content-type', 'application/json; charset=utf-8');

	// Log into that account
	const login = await supertest(server)
		.post('/login')
		.send({
			password: 'rogeriscool',
			email: '',
		})
		// .expect(200)
		.expect('content-type', 'application/json; charset=utf-8');

	expect(login.body.error).toBe('Missing email or password');
	expect(login.body.code).toBe(400);
});

// /decks/first/:deck_id - logged in as correct user for deck
// /decks/first/:deck_id - logged in as correct user for deck
// /decks/first/:deck_id - logged in as correct user for deck
test('handler /decks/first/:deck_id - correct user', async () => {
	await build();

	const deckId = await helpers.getDeckIdByName('French Vocab');
	// Log in and get token
	const login = await supertest(server)
		.post('/login')
		.send({
			password: 'password',
			email: 'admin@iscool.com',
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');
	expect(login.body.token).toBeDefined();

	// Now we can make our get request with the auth header
	const res = await supertest(server)
		.get(`/decks/first/${deckId}`)
		.set({
			Authorization: `Bearer ${login.body.token}`,
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');
	expect(res.body.card.front_text).toBe('window');
	expect(res.body.current_position).toBe(0);
	expect(res.body.deck_length).toBeDefined();
	expect(typeof res.body.deck_length).toBe(typeof 1);
});

// /decks/first/:deck_id - logged in as WRONG user for deck
// /decks/first/:deck_id - logged in as WRONG user for deck
// /decks/first/:deck_id - logged in as WRONG user for deck
test('handler /decks/first/:deck_id - wrong user', async () => {
	await build();

	const deckId = await helpers.getDeckIdByName('French Vocab');
	// Log in and get token
	const login = await supertest(server)
		.post('/login')
		.send({
			password: 'password',
			email: 'tom@iscool.com',
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');
	expect(login.body.token).toBeDefined();

	// Now we can make our get request with the auth header
	const res = await supertest(server)
		.get(`/decks/first/${deckId}`)
		.set({
			Authorization: `Bearer ${login.body.token}`,
		})
		.expect(401)
		.expect('content-type', 'application/json; charset=utf-8');
	expect(res.body.code).toBe(401);
	expect(res.body.error).toBe(
		"Deck doesn't exist or you don't have permission to see it",
	);
});

// Auth only route - not logged in
// Auth only route - not logged in
// Auth only route - not logged in
test('Auth only route - not logged in', async () => {
	await build();
	const deckId = await helpers.getDeckIdByName('French Vocab');
	// Make get request without auth header
	const res = await supertest(server)
		.get(`/decks/first/${deckId}`)
		.expect('content-type', 'application/json; charset=utf-8')
		.expect(401);
	expect(res.body.code).toBe(401);
	expect(res.body.error).toBe('Authorization header is required');
});

// Auth only route - invalid jwt
// Auth only route - invalid jwt
// Auth only route - invalid jwt
test('Auth only route - invalid jwt', async () => {
	await build();
	const deckId = await helpers.getDeckIdByName('French Vocab');
	// Make get request with bad token in auth header
	const res = await supertest(server)
		.get(`/decks/first/${deckId}`)
		.set({
			Authorization: `Bearer qwertyuiopasdf`,
		})
		.expect('content-type', 'application/json; charset=utf-8')
		.expect(401);
	expect(res.body.code).toBe(401);
	expect(res.body.error).toBe('Unauthorized: invalid token');
});

// /decks/place - logged in as correct user for deck
// /decks/place - logged in as correct user for deck
// /decks/place - logged in as correct user for deck
test('handler /place, happy path', async () => {
	await build();

	// Log into that account
	const login = await supertest(server)
		.post('/login')
		.send({
			password: 'password',
			email: 'admin@iscool.com',
		})
		// .expect(200)
		.expect('content-type', 'application/json; charset=utf-8');

	const cardRecord = await supertest(server)
		.post('/place')
		.set({
			Authorization: `Bearer ${login.body.token}`,
		})
		.send({
			deck_id: 1,
			card_id: 0, // TODO if we use this we need to update place
			place: 4,
			next_deck: 2,
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');

	// console.log('CARD RECORD:', cardRecord);
	const { card } = cardRecord.body;
	expect(card.card_id).toBeDefined();
	expect(card.deck_id).toBeDefined();
	expect(card.front_text).toBeDefined();
	expect(card.front_image).toBeDefined();
	expect(card.back_text).toBeDefined();
	expect(card.back_image).toBeDefined();
	expect(card.important).toBeDefined();
	expect(card.color).toBeDefined();
	expect(cardRecord.body.current_position).toBe(0);
	expect(typeof cardRecord.body.deck_length).toBe(typeof 1);
	expect(card.front_text).toBe('What are the parameters to fetch?');

	// We also need to verify the card has been put back in the right place!
	// We also need to verify the card has been put back in the right place!
	// We also need to verify the card has been put back in the right place!

	const ordering = await getOrdering({ userId: 1, deckId: 1 });
	expect(ordering).toBe(JSON.stringify([2, 4, 5, 1]));
});

// ends the connection to the pool (so that the tests can end their process)
afterAll(() => {
	db.end();
	// db.$pool.end();
});

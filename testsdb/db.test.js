const supertest = require('supertest');
const build = require('../db/build');
const db = require('../db/connection');
const server = require('../server');

const createUser = require('../model/createUser');
const getUser = require('../model/getUser');
const get = require('../model/get');
const getOrdering = require('../model/getOrdering');
const getCard = require('../model/getCard');
const addDeck = require('../model/addDeck');
const addCollection = require('../model/addCollection');
const getCardsInDeck = require('../model/getCardsInDeck');
const getCollections = require('../model/getCollections');
const updateOrdering = require('../model/updateOrdering');
const addCard = require('../model/addCard');

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

// addCardModel

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

test('model getCardsInDeck - can get all cards in a given deck', async () => {
	await build();
	const cardsInDeck = await getCardsInDeck(1);
	expect(cardsInDeck.rows.length).toBe(4);
});

test('model canReadCardOrDie - happy path', async () => {
	await build();
	const userId = await helpers.getUserIdByName('admin');
	return expect(helpers.canReadCardOrDie(2, userId)).resolves;
});

test('model canReadCardOrDie - wrong user', async () => {
	await build();
	const userId = await helpers.getUserIdByName('tom');
	return expect(helpers.canReadCardOrDie(2, userId)).rejects.toThrowError(
		"Card doesn't exist or you don't have permission to see it",
	);
});

test('model canWriteCardOrDie - happy path', async () => {
	await build();
	const userId = await helpers.getUserIdByName('admin');
	return expect(helpers.canWriteCardOrDie(2, userId)).resolves;
});

test('model canWriteCardOrDie - wrong user', async () => {
	await build();
	const userId = await helpers.getUserIdByName('tom');
	return expect(helpers.canWriteCardOrDie(2, userId)).rejects.toThrowError(
		"Card doesn't exist or you don't have permission to write it",
	);
});

test('model addDeck returns a number', async () => {
	await build();
	const deckId = await addDeck({
		ownerId: '1',
		deckName: "tom's deck",
		published: true,
	});
	expect(typeof deckId.deck_id).toBe('number');
});

test('model addCollection adds a collection', async () => {
	await build();
	const userId = 2;
	const deckId = 4;

	const ordering = await addCollection({ userId, deckId });
	expect(ordering.rows[0].ordering).toBe('[]');
});

test('model addCard adds a card', async () => {
	await build();
	const card = {
		deckId: '1',
		front_text: 'front-text',
		front_image: 'image-url-front',
		back_image: 'image-url-back',
		important: true,
		color: 'black',
	};
	const newCard = await addCard(card);
	const cardId = newCard.card_id;
	expect(typeof cardId).toBe('number'); // number in string? Vatsal

	const cardWeJustAdded = await getCard({ cardId });
	expect(cardWeJustAdded.front_image).toBe('image-url-front');
	expect(cardWeJustAdded.important).toBe(true);
	expect(cardWeJustAdded.deck_id).toBe(1);
	expect(cardWeJustAdded.back_text).toBe(null);
});

test('model getCollections gets a collection', async () => {
	await build();
	const deckId = 2;
	const collections = await getCollections(deckId);
	expect(Array.isArray(collections)).toBe(true);
	expect(collections.length >= 2).toBe(true);
	const decodedCollection = JSON.parse(collections[0].ordering);
	expect(Array.isArray(decodedCollection)).toBe(true);
});

test('model updateOrdering updates the order for a deck and user', async () => {
	await build();
	const newOrdering = JSON.stringify([1, 2, 4]);
	const returnOrdering = await updateOrdering({
		userId: 1,
		deckId: 2,
		newOrdering,
	});
	expect(returnOrdering.length).toBe(1);
	const collections = await getCollections(returnOrdering[0].deck_id);
	const filteredCollection = collections.filter(
		(collection) => collection.user_id === returnOrdering[0].user_id,
	);
	expect(filteredCollection.length).toBe(1);
	expect(filteredCollection[0].ordering).toBe(newOrdering);
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

// cannot access a private deck of another user
test(`handler cards/deck/:id`, async () => {
	await build();

	const login = await supertest(server)
		.post('/login')
		.send({
			password: 'password',
			email: 'tom@iscool.com',
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');

	const cards = await supertest(server)
		.get('/cards/deck/1')
		.set('Authorization', `Bearer ${login.body.token}`)
		.expect(401)
		.expect('content-type', 'application/json; charset=utf-8');

	expect(cards.body.error).toBe(
		"Deck doesn't exist or you don't have permission to see it",
	);
	expect(cards.body.code).toBe(401);
});

// authenticated user can add deck,
// and this adds a collection and deck belonging to the user
test(`handler /decks/:name - logged in user can make deck`, async () => {
	const admin = await supertest(server)
		.post('/login')
		.send({
			email: 'admin@iscool.com',
			password: 'password',
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');

	// console.log(admin.body.token)

	const newDeck = await supertest(server)
		.post('/decks/test-deck')
		.set({
			Authorization: `Bearer ${admin.body.token}`,
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');

	const newDeckId = newDeck.body.deck_id;

	const collection = await db.query(
		`SELECT
			collection_id
		FROM
			collections
		WHERE
			user_id = ${1} AND deck_id = ${newDeckId}`,
	);

	const newCollectionId = collection.rows[0].collection_id;

	const deck = await db
		.query(`select owner_id from decks where deck_id = ${newDeckId}`)
		.then((res) => res.rows[0]);
	expect(typeof newCollectionId).toBe('number');
	expect(deck.owner_id).toBe(1);
	// see whether collection and deck were succesfully added
});

// ends the connection to the pool (so that the tests can end their process)
afterAll(() => {
	db.end();
	// db.$pool.end();
});

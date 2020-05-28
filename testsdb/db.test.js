const supertest = require('supertest');
const build = require('../db/build');
const db = require('../db/connection');
const server = require('../server');

const createUser = require('../model/createUser');
const getUser = require('../model/getUser');
const get = require('../model/getDecks');
const getOrdering = require('../model/getOrdering');
const getCard = require('../model/getCard');
const addDeck = require('../model/addDeck');
const addCollection = require('../model/addCollection');
const getCardsInDeck = require('../model/getCardsInDeck');
const getCollectionsByDeck = require('../model/getCollectionsByDeck');
const getCollectionsByUser = require('../model/getCollectionsByUser');
const updateOrdering = require('../model/updateOrdering');
const addCard = require('../model/addCard');

const helpers = require('../model/helpers');

// Helpers
// Helpers
// Helpers

function loginAs(user) {
	return supertest(server)
		.post('/login')
		.send({ password: 'password', email: `${user}@iscool.com` })
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');
}

beforeEach(async () => {
	await build();
});

// Model tests
// Model tests
// Model tests

test('Database builds with test fixtures', async () => {
	return db.query('SELECT * FROM users WHERE USER_ID = 1').then((res) => {
		expect(res.rows[0].user_name).toBe('admin');
	});
});

// Test signup data is successfully entered into db
test('model createUser - data saved in db', async () => {
	const params = {
		userName: 'Bob',
		email: 'bob@iscool.com',
		password: 'wevs',
	};
	return createUser(params).then((res) => {
		expect(typeof res).toBe(typeof 1);
	});
});

test('model getUser - check we can get a user record by email', async () => {
	const params = {
		email: 'admin@iscool.com',
	};
	return getUser(params).then((res) => {
		expect(res.user_name).toBe('admin');
		expect(res.password_slug.length).toBeGreaterThan(10);
	});
});

test('model getCard - check we can get a card by card_id', async () => {
	const card = await getCard(1);

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

test('model get - check model returns a list of decks', async () => {
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

// addCardModel

// Prettier insists on reformatting it to be >80 chars long!
// eslint-disable-next-line max-len
test('model getOrdering - check we can get an ordering by user_id', async () => {
	const userId = await helpers.getUserIdByName('admin');
	const deckId = await helpers.getDeckIdByName('French Vocab');
	// console.log('THE IDS:', userId, deckId);
	const ordering = await getOrdering({ userId, deckId });
	// console.log('ORDERING:', ordering);
	expect(ordering).toBe(JSON.stringify([1, 2, 4, 5]));
});

test('model getCardsInDeck - can get all cards in a given deck', async () => {
	const cardsInDeck = await getCardsInDeck(1);
	expect(cardsInDeck.rows.length).toBe(4);
});

test('model canReadCardOrDie - happy path', async () => {
	const userId = await helpers.getUserIdByName('admin');
	return expect(helpers.canReadCardOrDie(2, userId)).resolves;
});

test('model canReadCardOrDie - wrong user', async () => {
	const userId = await helpers.getUserIdByName('tom');
	return expect(helpers.canReadCardOrDie(2, userId)).rejects.toThrowError(
		"Card doesn't exist or you don't have permission to see it",
	);
});

test('model canWriteCardOrDie - happy path', async () => {
	const userId = await helpers.getUserIdByName('admin');
	return expect(helpers.canWriteCardOrDie(2, userId)).resolves;
});

test('model canWriteCardOrDie - wrong user', async () => {
	const userId = await helpers.getUserIdByName('tom');
	return expect(helpers.canWriteCardOrDie(2, userId)).rejects.toThrowError(
		"Card doesn't exist or you don't have permission to write it",
	);
});

test('model addDeck returns a number', async () => {
	const deckId = await addDeck({
		ownerId: '1',
		deckName: "tom's deck",
		published: true,
	});
	expect(typeof deckId.deck_id).toBe('number');
});

test('model addCollection adds a collection', async () => {
	const userId = 2;
	const deckId = 4;
	const ordering = await addCollection({ userId, deckId });
	expect(ordering).toBe('[]');
});

test('model addCard adds a card', async () => {
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

	const cardWeJustAdded = await getCard(cardId);
	expect(cardWeJustAdded.front_image).toBe('image-url-front');
	expect(cardWeJustAdded.important).toBe(true);
	expect(cardWeJustAdded.deck_id).toBe(1);
	expect(cardWeJustAdded.back_text).toBe(null);
});

test('model getCollectionsByDeck gets a collection', async () => {
	const deckId = 2;
	const collections = await getCollectionsByDeck(deckId);
	expect(Array.isArray(collections)).toBe(true);
	expect(collections.length >= 2).toBe(true);
	const decodedCollection = JSON.parse(collections[0].ordering);
	expect(Array.isArray(decodedCollection)).toBe(true);
});

test('model updateOrdering updates the order for a deck and user', async () => {
	const userId = 1;
	const deckId = 2;
	const newOrdering = JSON.stringify([1, 3, 9, 11, 2, 4]);
	const didItUpdate = await updateOrdering(userId, deckId, newOrdering);
	expect(didItUpdate).toBe(true);
	const collections = await getCollectionsByUser(userId);
	const filteredCollection = collections.filter(
		(collection) => collection.deck_id === deckId,
	);
	expect(filteredCollection.length).toBe(1);
	expect(filteredCollection[0].ordering).toBe(newOrdering);
});

// HANDLERS
// HANDLERS
// HANDLERS

test('handler /signup, happy path', async () => {
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
	// Log in and get token
	const login = await loginAs('tom');
	expect(login.body.token).toBeDefined();

	const res = await supertest(server)
		.get('/public-decks')
		.set({
			Authorization: `Bearer ${login.body.token}`,
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');
	const userNames = res.body.map((v) => v.user_name);
	const deckNames = res.body.map((v) => v.deck_name);
	expect(userNames.includes('admin')).toBe(true);
	expect(deckNames.includes('ES6 APIs')).toBe(true);
});

// API should not include a users own decks in the list of
// public decks.
test('handler /public-decks, not own decks', async () => {
	// Log in and get token
	const login = await loginAs('admin');
	expect(login.body.token).toBeDefined();

	const res = await supertest(server)
		.get('/public-decks')
		.set({
			Authorization: `Bearer ${login.body.token}`,
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');
	const userNames = res.body.map((v) => v.user_name);
	const deckNames = res.body.map((v) => v.deck_name);
	expect(userNames.includes('admin')).toBe(false);
	expect(deckNames.includes('ES6 APIs')).toBe(false);
	expect(deckNames.includes('French Vocab')).toBe(false);
	expect(deckNames.includes('Music')).toBe(false);
	expect(deckNames.includes('Capital Cities')).toBe(true);
});

test('handler /signup, happy path', async () => {
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
	const deckId = await helpers.getDeckIdByName('French Vocab');

	// Log in and get token
	const login = await loginAs('admin');
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
	const deckId = await helpers.getDeckIdByName('French Vocab');

	// Log in and get token
	const login = await loginAs('tom');
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
	// Log into that account
	const login = await loginAs('admin');

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
	const login = await loginAs('tom');

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
	const admin = await loginAs('admin');

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

// Add a public deck to the users collection - happy path
// Tom has a published deck that admin would like in their collection
test(`handler /decks/add-public/:deck-id add public deck`, async () => {
	const userId = await helpers.getUserIdByName('admin');
	const requestDeckId = await helpers.getDeckIdByName('Capital Cities');
	const decksInitially = await get({ user_id: userId });
	const numberOfDecksInitially = decksInitially.length;
	const login = await loginAs('admin');
	const result = await supertest(server)
		.post(`/decks/add-public/${requestDeckId}`)
		.set({
			Authorization: `Bearer ${login.body.token}`,
		})
		.send({}) // dont need to send anything as can get req.params.deck_id and user info from jwt
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');
	const decksNow = await get({ user_id: userId });
	const numberOfDecksFinally = decksNow.length;
	expect(numberOfDecksFinally).toBe(numberOfDecksInitially + 1);
	expect(result.body.added).toBeDefined();
	expect(result.body.added).toBe(true);
});

// Remove a public deck to the users collection - happy path
// User tom no longer wants admin's deck ES6 APIs in their collection
test(`handler /decks/remove-public/:deck-id add public deck`, async () => {
	const userId = await helpers.getUserIdByName('tom');
	const requestDeckId = await helpers.getDeckIdByName('ES6 APIs');
	const decksInitially = await get({ user_id: userId });
	const numberOfDecksInitially = decksInitially.length;
	const login = await loginAs('tom');
	const result = await supertest(server)
		.delete(`/decks/remove-public/${requestDeckId}`)
		.set({
			Authorization: `Bearer ${login.body.token}`,
		})
		.send({})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');
	const decksNow = await get({ user_id: userId });
	const numberOfDecksFinally = decksNow.length;
	expect(numberOfDecksFinally).toBe(numberOfDecksInitially - 1);
	expect(result.body.removed).toBeDefined();
	expect(result.body.removed).toBe(true);
});

// Add a card to one of users decks, happy path...
// Authenticated user can add a card to a deck they are the owner of.
// The added card is also added at the front of all deck orderings
// for that deck.
test(`handler /cards/:deck_id, add card to own deck, happy path`, async () => {
	// Authenticated user
	const admin = await loginAs('admin');

	// Can add a card to a deck they are the owner of...
	// Admin is the owner of "ES6 APIs"
	const deckId = await helpers.getDeckIdByName('ES6 APIs');

	// Send card to the server
	// Handler for this route is at /handlers/cards/createCard.js
	const newCardResponse = await supertest(server)
		.post(`/cards/${deckId}`)
		.set({
			Authorization: `Bearer ${admin.body.token}`,
		})
		.send({
			front_text: 'this is the front text',
			front_image: 'this is a dummy front image url',
			back_text: 'this is the back text',
			back_image: 'this is a dummy back image url',
			important: true,
			color: '#1F6',
		})
		.expect(201)
		.expect('content-type', 'application/json; charset=utf-8');

	// Check response contains 'created: true' and the new card_id
	expect(newCardResponse.body.created).toBeDefined();
	expect(newCardResponse.body.created).toBe(true);
	expect(newCardResponse.body.card_id).toBeDefined();
	expect(typeof newCardResponse.body.card_id).toBe(typeof 1);
	const cardId = newCardResponse.body.card_id;

	// Get the actual card with the returned card_id and
	// verify it contains what we expect it to
	const card = await getCard(cardId);
	expect(card.front_text).toBeDefined();
	expect(card.front_text).toBe('this is the front text');
	expect(card.back_image).toBe('this is a dummy back image url');

	// Now get Tom's ordering and verify the new card was inserted at
	// the front of the deck
	const tomsId = await helpers.getUserIdByName('tom');
	const tomsOrdering = await getOrdering({ deckId, userId: tomsId });
	expect(JSON.parse(tomsOrdering)[0]).toBe(cardId);
});

// Add a card to one of users decks, partial data, happy path...
// Authenticated user can add a card to a deck they are the owner of.
test(`handler /cards/:deck_id, add card, partial data`, async () => {
	// Authenticated user
	const admin = await loginAs('admin');

	// Can add a card to a deck they are the owner of...
	// Admin is the owner of "ES6 APIs"
	const deckId = await helpers.getDeckIdByName('ES6 APIs');

	// Send card to the server
	// Handler for this route is at /handlers/cards/createCard.js
	const newCardResponse = await supertest(server)
		.post(`/cards/${deckId}`)
		.set({
			Authorization: `Bearer ${admin.body.token}`,
		})
		.send({
			front_text: 'this is the front text',
		})
		.expect(201)
		.expect('content-type', 'application/json; charset=utf-8');

	// Check response contains 'created: true' and the new card_id
	expect(newCardResponse.body.created).toBe(true);
	const cardId = newCardResponse.body.card_id;

	// Get the actual card with the returned card_id and
	// verify it contains what we expect it to
	const card = await getCard(cardId);
	expect(card.front_text).toBeDefined();
	expect(card.front_text).toBe('this is the front text');
	expect(card.front_image).toBe(null);
	expect(card.back_text).toBe(null);
	expect(card.back_image).toBe(null);
	expect(card.important).toBe(null);
	expect(card.color).toBe(null);
});

// Add a card to user's deck, sad path...
// User is authenticated and has correct permission to add to the deck but
// their request omits front_text AND front_image so the request should fail
test(`handler /cards/:deck_id, add card, missing params`, async () => {
	// Authenticated user
	const admin = await loginAs('admin');

	// Can add a card to a deck they are the owner of...
	// Admin is the owner of "ES6 APIs"
	const deckId = await helpers.getDeckIdByName('ES6 APIs');

	// Send card to the server
	// Handler for this route is at /handlers/cards/createCard.js
	const newCardResponse = await supertest(server)
		.post(`/cards/${deckId}`)
		.set({
			Authorization: `Bearer ${admin.body.token}`,
		})
		.send({
			// We deliberately omit front_text and front_image
			back_text: 'this is the back text',
			back_image: 'this is a dummy back image url',
			color: '#1F6',
		})
		.expect(400)
		.expect('content-type', 'application/json; charset=utf-8');

	// Check response is the appropriate error message
	expect(newCardResponse.body.error).toBeDefined();
	expect(newCardResponse.body.error).toContain('must have either');
});

// Add a card to my deck, sad path...
// User is authenticated but tried to add to a non-existant deck so the request
// should fail
test(`handler /cards/:deck_id, add card to non-existant deck`, async () => {
	// Authenticated user
	const admin = await loginAs('admin');

	// Send card to the server
	// Handler for this route is at /handlers/cards/createCard.js
	const newCardResponse = await supertest(server)
		.post(`/cards/93847598347523423`)
		.set({
			Authorization: `Bearer ${admin.body.token}`,
		})
		.send({
			front_text: 'this is the front text',
			front_image: 'this is a dummy front image url',
			back_text: 'this is the back text',
			back_image: 'this is a dummy back image url',
			important: true,
			color: '#1F6',
		})
		.expect(500)
		.expect('content-type', 'application/json; charset=utf-8');

	// Check response is the appropriate error message
	// console.log('NCRB:', newCardResponse.text);
	expect(newCardResponse.body.error).toBeDefined();
	expect(newCardResponse.body.error).toContain('out of range');
	expect(newCardResponse.body.code).toBe(22003);
});

// Update a card, happy path...
// Authenticated user can update a card they are the owner of.
// Missing fields do NOT overwrite existing ones with nulls.
test(`handler PUT /cards/:card_id, edit own card, happy path`, async () => {
	// Authenticated user
	const admin = await loginAs('admin');

	// Can add a card to a deck they are the owner of...
	// Admin is the owner of "ES6 APIs"
	const userId = await helpers.getUserIdByName('admin');
	const deckId = await helpers.getDeckIdByName('ES6 APIs');
	const deckOrdering = await getOrdering({ deckId, userId });
	const cardId = JSON.parse(deckOrdering)[0];

	// Send card to the server
	// Handler for this route is at /handlers/cards/createCard.js
	const updateResponse = await supertest(server)
		.put(`/cards/${cardId}`)
		.set({
			Authorization: `Bearer ${admin.body.token}`,
		})
		.send({
			front_text: 'This was a question about fetch',
			color: '#F16',
		})
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');

	// Check response contains 'updated: true'
	expect(updateResponse.body.updated).toBeDefined();
	expect(updateResponse.body.updated).toBe(true);

	// Get the actual card with the returned card_id and
	// verify it contains what we expect it to
	const card = await getCard(cardId);
	expect(card.front_text).toBeDefined();
	expect(card.front_text).toBe('This was a question about fetch');
	expect(card.back_text).toContain('the resource you want');
	expect(card.color).toBe('#F16');
});

// Update a card, sad path, wrong user...
// Authenticated user can't update a card they don't own
test(`handler PUT /cards/:card_id, can't edit other users card`, async () => {
	// Authenticated user
	const tom = await loginAs('tom');

	// Can't add a card to a deck they are NOT the owner of...
	// tom is NOT the owner of "ES6 APIs"
	// cardId is id of a card owned by admin
	const userId = await helpers.getUserIdByName('admin');
	const deckId = await helpers.getDeckIdByName('ES6 APIs');
	const deckOrdering = await getOrdering({ deckId, userId });
	const cardId = JSON.parse(deckOrdering)[0];

	// Send card to the server
	// Handler for this route is at /handlers/cards/createCard.js
	const updateResponse = await supertest(server)
		.put(`/cards/${cardId}`)
		.set({
			Authorization: `Bearer ${tom.body.token}`,
		})
		.send({
			front_text: 'This WAS a question about fetch',
			color: '#F16',
		})
		.expect(401)
		.expect('content-type', 'application/json; charset=utf-8');

	// Check response contains .error with right error message
	expect(updateResponse.body.error).toBeDefined();
	expect(updateResponse.body.error).toContain("doesn't exist or you");

	// Get the actual card with the returned card_id and
	// verify it hasn't been updated
	const card = await getCard(cardId);
	expect(card.front_text).toBeDefined();
	expect(card.front_text).toContain('What are the parameters to fetch');
	expect(card.color).not.toBe('#F16');
});

// Update a card, sad path, non-existant card id...
// Authenticated user can't update a card that doesn't exist
test(`handler PUT /cards/:card_id, non-existant card`, async () => {
	// Authenticated user
	const tom = await loginAs('tom');

	// Send card to the server
	// Handler for this route is at /handlers/cards/createCard.js
	const updateResponse = await supertest(server)
		.put(`/cards/123456789`)
		.set({
			Authorization: `Bearer ${tom.body.token}`,
		})
		.send({
			front_text: 'This WAS a question about fetch',
			color: '#F16',
		})
		.expect(401)
		.expect('content-type', 'application/json; charset=utf-8');

	// Check response contains .error with right error message
	expect(updateResponse.body.error).toBeDefined();
	expect(updateResponse.body.error).toContain("doesn't exist or you");
});

// Ends the connection to the pool so Jest can finish.
afterAll(() => {
	db.end();
	// db.$pool.end();
});

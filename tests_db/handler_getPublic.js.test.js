const supertest = require('supertest');
const build = require('../db/build');
const server = require('../server');
const db = require('../db/connection');

// Promises version

// test('Test /public-decks route', () => {
// 	return build().then(() => {
// 		return supertest(server)
// 			.get('/public-decks')
// 			.expect(200)
// 			.expect('content-type', 'application/json; charset=utf-8')
// 			.then((res) => {
// 				expect(res.body[0].user_name).toBe('admin');
// 				expect(res.body[0].deck_name).toBe('ES6 APIs');
// 			});
// 	});
// });

// Async version

test('Test /public-decks route', async () => {
	await build();
	const res = await supertest(server)
		.get('/public-decks')
		.expect(200)
		.expect('content-type', 'application/json; charset=utf-8');
	expect(res.body[0].user_name).toBe('admin');
	expect(res.body[0].deck_name).toBe('ES6 APIs');
});

afterAll(() => {
	db.end();
});

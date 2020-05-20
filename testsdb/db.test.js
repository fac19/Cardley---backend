const supertest = require('supertest');
const build = require('../db/build');
const db = require('../db/connection');
const server = require('../server');

const createUser = require('../model/createUser');
const getUser = require('../model/getUser');

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
	expect(res.body[0].user_name).toBe('admin');
	expect(res.body[0].deck_name).toBe('ES6 APIs');
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

// ends the connection to the pool (so that the tests can end their process)
afterAll(() => {
	db.end();
	// db.$pool.end();
});

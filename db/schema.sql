BEGIN;

	DROP TABLE IF EXISTS users, decks, collections, cards, stats
	CASCADE;

CREATE TABLE users
(
	id SERIAL PRIMARY KEY,
	user_name VARCHAR(255) NOT NULL UNIQUE,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL
	-- admin user?
);

CREATE TABLE decks
(
	id SERIAL PRIMARY KEY,
	owner_id INTEGER REFERENCES users(id),
	deck_name VARCHAR(255) NOT NULL,
	published BOOLEAN
);

CREATE TABLE collections
(
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id),
	deck_id INTEGER REFERENCES decks(id),
	ordering TEXT
);

CREATE TABLE cards
(
	id SERIAL PRIMARY KEY,
	deck_id INTEGER REFERENCES decks(id),
	front_text TEXT,
	front_image VARCHAR(1000),
	back_text TEXT,
	back_image VARCHAR(1000),
	important BOOL DEFAULT false,
	color VARCHAR(200)
);

COMMIT;
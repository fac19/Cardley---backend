BEGIN;

	DROP TABLE IF EXISTS users, decks, collections, cards, stats
	CASCADE;


CREATE TABLE users
(
	user_id SERIAL PRIMARY KEY,
	user_name VARCHAR(255) NOT NULL UNIQUE,
	email VARCHAR(255) NOT NULL UNIQUE,
	password_slug VARCHAR(255) NOT NULL
	-- admin user?
);

CREATE TABLE decks
(
	deck_id SERIAL PRIMARY KEY,
	owner_id INTEGER REFERENCES users(user_id),
	deck_name VARCHAR(255) NOT NULL,
	published BOOLEAN DEFAULT false
);

CREATE TABLE collections
(
	collection_id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(user_id),
	deck_id INTEGER REFERENCES decks(deck_id),
	ordering TEXT
);

CREATE TABLE cards
(
	card_id SERIAL PRIMARY KEY,
	deck_id INTEGER REFERENCES decks(deck_id),
	front_text TEXT,
	front_image VARCHAR(1000),
	back_text TEXT,
	back_image VARCHAR(1000),
	important BOOLEAN DEFAULT false,
	color VARCHAR(200)
);

COMMIT;
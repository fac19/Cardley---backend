/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
// require('dotenv').config();
const fs = require('fs');
const path = require('path');
const supertest = require('supertest');
const build = require('../build');
const server = require('../../server');
const addDeck = require('../../model/addDeck');
const addCard = require('../../model/addCard');
const addCollection = require('../../model/addCollection');
const getCollectionsByDeck = require('../../model/getCollectionsByDeck.js');
const updateOrdering = require('../../model/updateOrdering.js');

build().then(() => {
	async function createUser(name, email, password) {
		return supertest(server)
			.post('/signup')
			.send({ name, password, email })
			.expect(201)
			.expect('content-type', 'application/json; charset=utf-8')
			.catch(() => console.log(`Unable to create user ${name}`))
			.then(({ body }) => {
				console.log(`Created user: ${name}`);
				return body.user_id;
			});
	}

	async function setupUsers() {
		const meg = await createUser('meg', 'meg@iscool.com', 'password');
		const bob = await createUser('bob', 'bob@iscool.com', 'password');
		const joe = await createUser('joe', 'joe@iscool.com', 'password');
		const pat = await createUser('pat', 'pat@iscool.com', 'password');
		return [meg, bob, joe, pat];
	}

	async function importDeck(userId, fileName, published) {
		console.log(`Importing ${fileName} for ${userId}`);

		// CREATE THE DECK
		const [deckName] = fileName.split('.');
		console.log('DECKNAME:', deckName);
		const deckIdResponse = await addDeck({
			ownerId: userId,
			deckName,
			published,
		});
		const deckId = deckIdResponse.deck_id;
		console.log('Created deck_id:', deckId);
		const initialOrdering = await addCollection({
			deckId,
			userId,
		});
		console.log('Initial ordering for deck:', deckId, initialOrdering);

		// ADD THE CARDS
		const wholeFile = fs.readFileSync(
			path.join(__dirname, fileName),
			'utf-8',
		);
		const lines = wholeFile.split(/\r?\n/); // .slice(0, 5);
		console.log(lines.length, 'lines to process');
		// REFACTOR WITH FOR LOOPS
		// .forEach(async (line) => {

		for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
			console.log('Processing line', lineIdx + 1, 'of', fileName);
			// console.log(line);
			const { front, back } = JSON.parse(lines[lineIdx]);
			const resultRow = await addCard({
				deckId,
				front_text: front,
				back_text: back,
			});
			const newCardId = resultRow.card_id;
			const collections = await getCollectionsByDeck(deckId);

			// REFACTOR WITH FOR LOOPS
			// collections.forEach(async (collection) => {
			for (let colIdx = 0; colIdx < collections.length; colIdx++) {
				// console.log('Updating orderings', collections[colIdx]);
				const order = JSON.parse(collections[colIdx].ordering);
				order.unshift(newCardId);
				await updateOrdering(
					collections[colIdx].user_id,
					collections[colIdx].deck_id,
					JSON.stringify(order),
				);
				// console.log('done updating ordering');
			}

			console.log('ADDED Card ID:', newCardId);

			// });
		}
		// });

		return true;
	}

	async function importAll() {
		const [meg, bob, joe, pat] = await setupUsers();
		await importDeck(bob, 'Asian History.json_lines', true);
		await importDeck(bob, 'Gross Anatomy.json_lines', true);
		await importDeck(meg, 'Chord Formulas.json_lines', true);
		await importDeck(meg, 'HTML Tags.json_lines', true);
		await importDeck(joe, 'Electronics.json_lines', true);
		await importDeck(joe, 'Physical Geography.json_lines', true);
		await importDeck(pat, 'Git.json_lines', true);
		await importDeck(pat, 'Spanish.json_lines', true);
	}

	importAll().then(() => {
		console.log('Done');
		setTimeout(process.exit, 3000);
	});
});

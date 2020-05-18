// const build = require('../db/build');
// const connection = require('../db/connection');

test("dummy test so our otherwise empty tests don't crash", () => {
	console.log('You should not see me');
	expect(3).toBe(3);
});

// test('Database builds with test fixtures', () => {
// 	return build().then((result) => {
// 		console.log('IN TEST:', result);
// 		expect(3).toBe(3);
// 	});
// });

// //ends the connection to the pool (so that the tests can end their process)
// afterAll(() => {
// 	connection.end();
// });

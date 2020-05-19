const build = require('../db/build');
const db = require('../db/connection');

test('Database builds with test fixtures', () => {
	return build().then(() => {
		return db.query('SELECT * FROM users WHERE USER_ID = 1').then((res) => {
			expect(res.rows[0].user_name).toBe('admin');
		});
	});
});

// ends the connection to the pool (so that the tests can end their process)
afterAll(() => {
	db.end();
});

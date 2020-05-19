const { createUser } = require('../model/createUser');
const build = require('../db/build');

// You need this so you can close the pool when you're done
// Also, you can use it if you need to run any raw SQL e.g.
// db.query("SELECT * FROM users").then( (res)=>{ your code here })
const db = require('../db/connection');

test('signup data is successfully entered into db', () => {
	return build().then(() => {
		// console.log('Wut?!');
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

// ends the connection to the pool (so that the tests can end their process)
afterAll(() => {
	db.end();
});

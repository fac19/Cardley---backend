const supertest = require('supertest')
const build = require('../db/build')
const server = require('../server')
const db = require('../db/connection')

test('signup route', async ()=>{
	await build()
	const res = await supertest(server)
		.post('/signup')
		.send({
			name: "roger",
			password: "rogeriscool",
			email: "roger@iscool.com"
		})
		.expect(201)
		.expect('content-type', 'application/json; charset=utf-8')
    console.log(res.body.user_name)
    expect(res.body.user_name).toBe("roger")
	// expect(res.body.user_id).toBe("1")
	// expect(res.body.token).toBe("need to get actual token!")
})

// test('signup route', ()=>{
// 	return build().then(()=>{
// 		return supertest(server)
// 			.post('/signup')
// 			.send({
// 				name: "roger",
// 				password: "rogeriscool",
// 				email: "roger@iscool.com"
// 			})
// 			.expect(201)
// 			.expect('content-type', 'application/json; charset=utf-8')
// 			.then((res) => {
// 				// token,
// 				// // TODO: send expire time back to frontend?
// 				// user_id: userId,
// 				// user_name: req.body.name
// 				console.log(res.body.user_name);
// 				expect(res.body.user_name).toBe("roger");
// 			})
// 			.catch(console.error);
// 	})
// })

afterAll(() => {
	db.end();
});
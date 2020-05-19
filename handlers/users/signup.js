const createUser = require('../../model/createUser.js');

function signup(req, res, next) {
	// if (
	//       req.body.email === undefined ||
	//       req.body.username === undefined ||
	//       req.body.password === undefined
	//   ) {
	//       const error = new Error("Missing parameter: email, username, password all required.");
	//       error.status = 400;
	//       next(error);
	//   }
	//   const newUserEmail = req.body.email;
	//   const newUserName = req.body.username;
	//   const rawPassword = req.body.password;
	//   bcrypt
	//       .genSalt(10)
	//       .then(salt => bcrypt.hash(rawPassword, salt))
	//       .then(cookedPassword => {
	//           const newUser = {
	//               email: newUserEmail,
	//               username: newUserName,
	//               password: cookedPassword
	//           };
	//           model
	//               .createUser(newUser)
	//               .then(userID => {
	//                   const token = jwt.sign(
	//                       {
	//                           user_id: userID,
	//                           admin: false
	//                       },
	//                       secret,
	//                       {
	//                           expiresIn: "1h"
	//                       }
	//                   );
	//                   res.status(201).send({
	//                       user_id: userID,
	//                       username: newUserName,
	//                       email: newUserEmail,
	//                       token: token
	//                   });
	//               })
	//               .catch( err => {
	//                   res.status(401).send({
	//                       error: "Could not sign up with those credentials, that email may already exist",
	//                       msg: err.message
	//                   });
	//               }
	//               );
	//       })
	//       .catch(next);
}

module.exports = signup;

![build status](https://travis-ci.com/Ivo-Evans/Cardley---backend.svg?branch=master)



Cardley API

1. To install clone the following repo and install with `npm i`
   `https://github.com/fac19/Cardley---backend.git`

2. To run locally you will need a postgres 'production' database and a user with full permissions
   Create these with you favourite db admin tool.

3. To run the tests locally you will need a 'testing' database as above.

4. You will need a .env file in the project root with these fields.
   PGDATABASE={ your local production database name }
   TESTDATABASE={ your local testing database name }
   PGUSER={ your database user name }
   PGPASSWORD={ your database password }
   SECRET=SECRETCODE

    PGUSER and PGPASSWORD can be ommited on some systems. TESTDATABASE is only needed if you would like to run the database tests.

    You can change SECRET to whatever you like but it will break several of the tests and prevent loging from any of the example user accounts in test.sql or examples.sql

5. Starting the server.

    - `npm start` - No console logging
    - `npm run dev` - Minimal error logging
    - `npm run debug` - Verbose error logging

6. Running the tests.
    - `npm run test` - Tests that don't use the test database
    - `npm run testdb` - Tests that DO use the test database

---

Live list of API routes.

https://hackmd.io/pm56shSXSHeQqLBeRZ2olw

Expect breaking changes!

---

Active routes...

/signup
/login
/public-decks
/decks
/decks/first/:id

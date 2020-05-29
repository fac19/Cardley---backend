# Cardley API server

![build status](https://travis-ci.com/Ivo-Evans/Cardley---backend.svg?branch=master)

[![codecov](https://codecov.io/gh/fac19/Cardley---backend/branch/master/graph/badge.svg)](https://codecov.io/gh/fac19/Cardley---backend)


1. To install clone the following repo and install with `npm i`
   `https://github.com/fac19/Cardley---backend.git`

2. To run locally you will need a postgres 'production' database and a user with full permissions. Create these with you favourite db admin tool.
    - The database schema can be installed by running `npm run initdb`

3. To run the tests locally you will need a 'testing' database as above.

4. You will need a .env file in the project root with these fields.
   - PGDATABASE={ your local production database name }
   - TESTDATABASE={ your local testing database name }
   - PGUSER={ your database user name }
   - PGPASSWORD={ your database password }
   - SECRET=SECRETCODE

    PGUSER and PGPASSWORD can be ommited on some systems. TESTDATABASE is only needed if you would like to run the database tests.

5. Starting the server.

    - `npm start` - No console logging
    - `npm run dev` - Minimal error logging
    - `npm run debug` - Verbose error logging

6. Running the tests.
    - `npm run test` - Tests that don't use the test database
    - `npm run testdb` - Tests that DO use the test database

7. Populating the database with demo users and example decks
    - `npm run initdemodb`
    - This will give you several example decks and 4 test users...
        - user: meg, email: meg@iscool.com, password: password
        - user: joe, email: joe@iscool.com, password: password
        - user: pat, email: pat@iscool.com, password: password
        - user: bob, email: bob@iscool.com, password: password
    - Note that at the time of writing creating decks isn't yet possible on the front end so you will probably want to do this.

---

Full API docs here...

https://hackmd.io/pm56shSXSHeQqLBeRZ2olw
 (copy as of 29-May-2020)
 
---

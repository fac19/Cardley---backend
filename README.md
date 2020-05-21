Cardley API

1. To install clone the following repo and install with `npm i`
   `https://github.com/fac19/Cardley---backend.git`

2. To run locally you will need a postgres 'production' database and a user with full permissions
   Create these with you favourite db admin tool.


    "scripts": {
    	"dev": "LOGGING=ON nodemon server.js",
    	"debug": "LOGGING=VERBOSE nodemon server.js",
    	"test": "TESTING=TRUE jest tests/*.test.js",
    	"testdb": "TESTING=TRUE jest -i testsdb/*.test.js",
    	"initdb": "node db/build.js",
    	"lint": "eslint .",
    	"prettify": "pretty-quick --staged"
    },

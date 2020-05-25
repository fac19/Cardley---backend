BEGIN;

	-- USERS TABLE
	INSERT INTO users
		(user_name, email, password_slug)
	VALUES
		('admin', 'admin@iscool.com', '$2a$10$zH7.4s2AbH8Lz.SqsauRSOldLUacu3axD.0ZgoR2v2CJpM/pItOiy'),
		('tom', 'tom@iscool.com', '$2a$10$fFI3n2FQzODKlE6SU5Cy1OydfwgA24BepGmWxarDt8wsGk92DebW.');

	-- DECKS TABLE
	-- published=true means it is public, published=false means it is private.
	INSERT INTO decks
		(owner_id, deck_name, published)
	VALUES
		(1, 'French Vocab', false),
		(1, 'ES6 APIs', true),
		(2, 'Capital Cities', true),
		(1, 'Music', true);

	-- CARDS TABLE
	INSERT INTO cards
		( deck_id, front_text, front_image, back_text, back_image, important, color)

	VALUES
		(	1,
			'window',
			'https://images-na.ssl-images-amazon.com/images/I/614IJG4EIcL._AC_SX425_.jpg',
			'fenêtre',
			'https://images-na.ssl-images-amazon.com/images/I/614IJG4EIcL._AC_SX425_.jpg',
			false,
			'rgb(160,149,144)'
		),
		(	1,
			'bed',
			'http://t0.gstatic.com/images?q=tbn:ANd9GcSuAm_C-ktaK_ZxXxZlMSqE_JvM1QULef5F91fK1QFOF2SGVeTVLP2x9VTmvFn493RkXQdJokbt5sp0MzvaEWk',
			'lit',
			null,
			true,
			'rgb(174,232,143)'
		),
		( 2,
			'What are the parameters to fetch?',
			null,
			'1. The path to the resource you want\n2.An options/init object.',
			null,
			false,
			'rgb(174,232,143)'
		),
		(	1,
			'car',
			null,
			'voiture',
			null,
			false,
			'rgb(174,232,143)'
	),
		(	1,
			'church',
			null,
			'église',
			null,
			false,
			'rgb(174,232,143)'
	),
		(	2,
			'What are the arguments to .splice?',
			null,
			'1. Index to start from\n2. How many elements to delete\n3. An unlimited number of new elements to insert',
			null,
			false,
			'rgb(174,232,143)'
	),
		( 2,
			'What is the opposite of "spread syntax"?',
			null,
			'\"rest syntax\", used for destructuring',
			null,
			false,
			'rgb(174,232,143)'
	);

	INSERT INTO collections
		( user_id, deck_id, ordering)
	VALUES
		( 1, 1, '[1,2,4,5]'),
		( 1, 2, '[3,6,7]'),
		( 2, 3, '[]'),
		( 2, 2, '[7,3,6]');

	COMMIT;
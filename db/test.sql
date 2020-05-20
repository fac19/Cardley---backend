BEGIN;

	INSERT INTO users
		(user_name, email, password_slug)
	VALUES
		('admin', 'admin@iscool.com', '$2a$10$zH7.4s2AbH8Lz.SqsauRSOldLUacu3axD.0ZgoR2v2CJpM/pItOiy');

	INSERT INTO decks
		(owner_id, deck_name, published)
	VALUES
		(1, 'French Vocab', false),
		(1, 'ES6 APIs', true);

	COMMIT;
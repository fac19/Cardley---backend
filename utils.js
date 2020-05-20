function errNow(code, message, details, orig = null) {
	const err = new Error(message);
	if (err.details) {
		err.detail = `${details}: ${err.detail}`;
	} else {
		err.detail = details;
	}

	err.code = code;
	if (orig) err.orig = orig;
	return err;
}

module.exports = { errNow };

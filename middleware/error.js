function handleError(err, req, res, next) {
	const errorStatus = err.status || 400;
	console.log('API error:', err);
	res.status(errorStatus).send({ error: err.message });
}

module.exports = handleError;

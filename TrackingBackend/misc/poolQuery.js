const pool = require("./databaseCon");
const assert = require("assert");

const poolQuery = async (queryString, values) => {
	const con = await pool.connect();
	try {
		assert(queryString);
		assert(typeof queryString === "string");
		if (!values) {
			values = [];
		}
		const result = await con.query(queryString, values);
		return result;
	} catch (e) {
		console.log(e);
		throw e;
	} finally {
		con.release();
	}
}
module.exports = poolQuery;

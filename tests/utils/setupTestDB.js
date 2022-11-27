require("dotenv").config();
const db = require("../../config/db");

const setupTestDB = () => {
	beforeAll(() => {
		db.connect(process.env.MONGODB_URL);
	});

	afterAll(() => {
		db.disconnect();
	});
};

module.exports = setupTestDB;

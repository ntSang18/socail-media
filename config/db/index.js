const mongoose = require("mongoose");

async function connect(url) {
	try {
		await mongoose.connect(url, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("Connect successfully!!!");
	} catch (error) {
		console.log(error);
		console.log("Connect failure!!!");
	}
}

async function disconnect() {
	await mongoose.disconnect();
}

module.exports = { connect, disconnect };

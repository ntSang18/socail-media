require("dotenv").config();
const app = require("./app");
const db = require("./config/db");

const URI = process.env.MONGODB_URL;
db.connect(URI);

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log("Server is running on port", port);
});

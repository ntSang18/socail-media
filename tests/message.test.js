const request = require("supertest");
const app = require("../app");
const setupTestDB = require("./utils/setupTestDB");
const Messages = require("../models/messageModel");
const Conversations = require("../models/conversationModel");

var token;

setupTestDB();

describe("login", () => {
	test("Return status 200 and data if email and password correct", async () => {
		const res = await request(app).post("/api/login").send({
			email: "thanhsang6325@gmail.com",
			password: "123456",
		});

		expect(res.status).toBe(200);
		token = res.body.access_token;
	});
});

describe("message routes", () => {
	describe("POST /api/message", () => {
		let newMessage;
		beforeEach(() => {
			newMessage = {
				sender: "63839f3e0ca6c9bc4b6ca339",
				recipient: "63724c1e61414d3b249136cf",
				text: "test create new message",
			};
		});

		test("Return status 200 if data is ok", async () => {
			await request(app)
				.post("/api/message")
				.set("Authorization", token)
				.send(newMessage)
				.expect(200);
		});

		test("Return status 500 if missing text field", async () => {
			await request(app)
				.post("/api/message")
				.set("Authorization", token)
				.send({
					sender: "63839f3e0ca6c9bc4b6ca339",
					recipient: "63846825165f38ddd28b8050",
				})
				.expect(500);
		});

		test("Return status 400 if header has no authorization or wrong authorization", async () => {
			await request(app)
				.post("/api/message")
				.send(newMessage)
				.expect(400);
		});
	});

	describe("GET /api/conversations", () => {
		let recipients;
		beforeEach(() => {
			recipients = "63839f3e0ca6c9bc4b6ca339";
		});
		test("Return status 200 and data", async () => {
			const res = await request(app)
				.get("/api/conversations")
				.set("Authorization", token);

			const dbConversations = await Conversations.find({ recipients });
			expect(res.status).toBe(200);
			expect(res.body.result).toBe(dbConversations.length);
		});

		test("Return status 400 if header has no authorization or wrong authorization", async () => {
			await request(app).get("/api/conversations").expect(400);
		});
	});

	describe("GET /api/message/:id", () => {
		let recipient;
		let sender;
		beforeEach(() => {
			recipient = "63724c1e61414d3b249136cf";
			sender = "63839f3e0ca6c9bc4b6ca339";
		});

		test("Return status 200 and data", async () => {
			const res = await request(app)
				.get(`/api/message/${recipient}`)
				.set("Authorization", token);

			const dbMessages = await Messages.find({
				sender,
				recipient,
			});
			expect(res.status).toBe(200);
			expect(res.body.result).toBe(dbMessages.length);
		});

		test("Return status 200 and wrong data if recipient doesn't exits", async () => {
			const dbMessages = await Messages.find({
				sender,
				recipient,
			});
			recipient = "63724c1e61414d3b249136cc";
			const res = await request(app)
				.get(`/api/message/${recipient}`)
				.set("Authorization", token);
			expect(res.status).toBe(200);
			expect(res.body.result).not.toBe(dbMessages.length);
		});

		test("Return status 500 if recipient invalid format", async () => {
			recipient = "63846825165f38ddd28b805";
			await request(app)
				.get(`/api/message/${recipient}`)
				.set("Authorization", token)
				.expect(500);
		});

		test("Return status 400 if header has no authorization or wrong authorization", async () => {
			await request(app).get(`/api/message/${recipient}`).expect(400);
		});
	});

	describe("DELETE /api/message/:id", () => {
		let message;
		beforeEach(async () => {
			message = await Messages.findOne().sort({ createdAt: -1 }).limit(1);
		});

		test("Return status 200", async () => {
			await request(app)
				.delete(`/api/message/${message._id}`)
				.set("authorization", token)
				.expect(200);

			const dbMessage = await Messages.findById(message._id);
			expect(dbMessage).toBeNull();
		});

		test("return status 500 if id invalid format", async () => {
			let invalidId = "invalidId";
			await request(app)
				.delete(`/api/message/${invalidId}`)
				.set("authorization", token)
				.expect(500);
		});

		test("Return status 400 if header has no authorization or wrong authorization", async () => {
			await request(app)
				.delete(`/api/message/${message._id}`)
				.expect(400);
		});
	});

	describe("DELETE /api/conversation/:id", () => {
		let recipient;
		beforeEach(() => {
			recipient = "63724c1e61414d3b249136cf";
		});

		test("Return status 200", async () => {
			await request(app)
				.delete(`/api/conversation/${recipient}`)
				.set("authorization", token)
				.expect(200);
		});

		test("Return status 400 if header has no authorization or wrong authorization", async () => {
			await request(app)
				.delete(`/api/conversation/${recipient}`)
				.expect(400);
		});
	});
});

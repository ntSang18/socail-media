const request = require("supertest");
const app = require("../app");
const setupTestDB = require("./utils/setupTestDB");
const Comments = require("../models/commentModel");

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

describe("comment routes", () => {
	let comment;
	beforeEach(async () => {
		comment = await Comments.findOne().sort({ createdAt: -1 }).limit(1);
	});

	describe("POST /api/comment", () => {
		let newComment;
		beforeEach(() => {
			newComment = {
				postId: "6384b7a61a0739adb65f8d0c",
				content: "test content",
				postUserId: "63839f3e0ca6c9bc4b6ca339",
				reply: "638dfbbc215fe285fc9c858e",
			};
		});

		test("Return status 200 if data is ok", async () => {
			const res = await request(app)
				.post("/api/comment")
				.set("Authorization", token)
				.send(newComment);

			expect(res.status).toBe(200);
			expect(res.body).toMatchObject({
				newComment: {
					content: "test content",
					user: "63839f3e0ca6c9bc4b6ca339",
					postId: "6384b7a61a0739adb65f8d0c",
					postUserId: "63839f3e0ca6c9bc4b6ca339",
					reply: "638dfbbc215fe285fc9c858e",
					_id: expect.anything(),
				},
			});
			const dbComment = await Comments.findById(res.body._id);
			expect(dbComment).toBeDefined();
		});

		test("Return status 400 if postId does not exist", async () => {
			newComment.postId = "637243682a8dbdbcb39a1181";
			const res = await request(app)
				.post("/api/comment")
				.set("Authorization", token)
				.send(newComment);

			expect(res.status).toBe(400);
			expect(res.body.msg).toBe("This post does not exist.");
		});

		test("Return status 400 if reply comment does not exist", async () => {
			newComment.reply = "6383a30c26dc080fcf4c1d8a";
			const res = await request(app)
				.post("/api/comment")
				.set("Authorization", token)
				.send(newComment);

			expect(res.status).toBe(400);
			expect(res.body.msg).toBe("This comment does not exist.");
		});

		test("Return status 500 if data is not valid", async () => {
			newComment.postId = "";
			await request(app)
				.post("/api/comment")
				.set("Authorization", token)
				.send(newComment)
				.expect(500);
		});

		test("Return status 400 if header has no authorization or wrong authorization", async () => {
			await request(app)
				.post("/api/comment")
				.send(newComment)
				.expect(400);
		});
	});

	describe("PATCH /api/comment/:id", () => {
		test("Return status 200 if data is ok", async () => {
			await request(app)
				.patch(`/api/comment/${comment._id}`)
				.set("Authorization", token)
				.send({
					content: "test change comment",
				})
				.expect(200);
		});

		test("Return status 500 if _id is not valid", async () => {
			let invalidId = "invalidId";
			await request(app)
				.patch(`/api/comment/${invalidId}`)
				.set("Authorization", token)
				.send({
					content: "test change comment",
				})
				.expect(500);
		});

		test("Return status 400 if header has no authorization or wrong authorization", async () => {
			await request(app)
				.patch(`/api/comment/${comment._id}`)
				.send({
					content: "test change comment",
				})
				.expect(400);
		});
	});

	describe("PATCH /api/comment/:id/like", () => {
		test("Return status 200 if _id is valid", async () => {
			await request(app)
				.patch(`/api/comment/${comment._id}/like`)
				.set("Authorization", token)
				.expect(200);
		});

		test("Return status 500 if _id is invalid", async () => {
			let invalidId = "invalidId";
			await request(app)
				.patch(`/api/comment/${invalidId}/like`)
				.set("Authorization", token)
				.expect(500);
		});

		test("Return status 400 if header has no authorization or wrong authorization", async () => {
			await request(app)
				.patch(`/api/comment/${comment._id}/like`)
				.expect(400);
		});
	});

	describe("PATCH /api/comment/:id/unlike", () => {
		test("Return status 200 if _id is valid", async () => {
			await request(app)
				.patch(`/api/comment/${comment._id}/unlike`)
				.set("Authorization", token)
				.expect(200);
		});

		test("Return status 500 if _id is invalid", async () => {
			let invalidId = "invalidId";
			await request(app)
				.patch(`/api/comment/${invalidId}/unlike`)
				.set("Authorization", token)
				.expect(500);
		});

		test("Return status 400 if header has no authorization or wrong authorization", async () => {
			await request(app)
				.patch(`/api/comment/${comment._id}/unlike`)
				.expect(400);
		});
	});

	describe("DELETE /api/comment/:id", () => {
		test("Return status 200 if data is ok", async () => {
			await request(app)
				.delete(`/api/comment/${comment._id}`)
				.set("Authorization", token)
				.expect(200);

			const dbComment = await Comments.findById(comment._id);
			expect(dbComment).toBeNull();
		});

		test("Return status 500 if _id doesn't exits", async () => {
			comment._id = "6383ae7f152cf0286dd62b7a";
			await request(app)
				.delete(`/api/comment/${comment._id}`)
				.set("Authorization", token)
				.expect(500);
		});

		test("Return status 500 if _id is not valid", async () => {
			let invalidId = "invalidId";
			await request(app)
				.delete(`/api/comment/${invalidId}`)
				.set("Authorization", token)
				.expect(500);
		});

		test("Return status 400 if header has no authorization or wrong authorization", async () => {
			await request(app)
				.delete(`/api/comment/${comment._id}`)
				.expect(400);
		});
	});
});

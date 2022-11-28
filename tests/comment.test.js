const request = require("supertest");
const app = require("../app");
const setupTestDB = require("./utils/setupTestDB");
const Comments = require("../models/commentModel");

const token =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzODM5ZjNlMGNhNmM5YmM0YjZjYTMzOSIsImlhdCI6MTY2OTU3MDc5NywiZXhwIjoxNjY5NjU3MTk3fQ.E6eHh26JAK__PTF3iULybg-zxJnBP7z-uum0RHo5aYA";

setupTestDB();

describe("comment routes", () => {
	let comment;
	beforeEach(async () => {
		comment = await Comments.findOne().sort({ createdAt: -1 }).limit(1);
	});

	describe("POST /api/comment", () => {
		let newComment;
		beforeEach(() => {
			newComment = {
				postId: "637243682a8dbdbcb39a1180",
				content: "test content",
				postUserId: "63837dee6a89b5efe2323005",
				reply: "6383a2d1af073af800570403",
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
					postId: "637243682a8dbdbcb39a1180",
					postUserId: "63837dee6a89b5efe2323005",
					reply: "6383a2d1af073af800570403",
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

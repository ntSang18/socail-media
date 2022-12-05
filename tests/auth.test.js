const request = require("supertest");
const app = require("../app");
const setupTestDB = require("./utils/setupTestDB");
const Users = require("../models/userModel");

setupTestDB();

describe("auth routes", () => {
	// describe("POST /api/register", () => {
	// 	let newUser;
	// 	beforeEach(() => {
	// 		newUser = {
	// 			fullname: "Thanh Sang Nguyen",
	// 			username: "ntsang18",
	// 			email: "thanhsangm2708@gmail.com",
	// 			password: "123456",
	// 			gender: "male",
	// 		};
	// 	});

	// 	test("Return status 200 and data if request data is ok", async () => {
	// 		const res = await request(app).post("/api/register").send(newUser);

	// 		expect(res.status).toBe(200);
	// 		expect(res.body).toMatchObject({
	// 			msg: "Register Success!",
	// 			access_token: expect.anything(),
	// 			user: {
	// 				_id: expect.anything(),
	// 				fullname: "Thanh Sang Nguyen",
	// 				username: "ntsang18",
	// 				email: "thanhsangm2708@gmail.com",
	// 				password: "",
	// 			},
	// 		});

	// 		const dbUser = await Users.findById(res.body.user._id);
	// 		expect(dbUser).toBeDefined();
	// 	});

	// 	test("Return status 400 if user name already exists", async () => {
	// 		newUser.username = "Sang18";

	// 		await request(app).post("/api/register").send(newUser).expect(400);
	// 	});

	// 	test("Return 400 if email already exists", async () => {
	// 		newUser.username = "thanhsang6325@gmail.com";

	// 		await request(app).post("/api/register").send(newUser).expect(400);
	// 	});

	// 	test("Return 400 if password less than 6 characters", async () => {
	// 		newUser.password = "12345";

	// 		await request(app).post("/api/register").send(newUser).expect(400);
	// 	});

	// 	test("Return 500 if 1 of the fields is missing", async () => {
	// 		await request(app).post("/api/register").send({}).expect(500);
	// 	});
	// });

	describe("POST /api/login", () => {
		test("Return status 200 and data if email and password correct", async () => {
			const res = await request(app).post("/api/login").send({
				email: "thanhsang6325@gmail.com",
				password: "123456",
			});

			expect(res.status).toBe(200);
			expect(res.body).toMatchObject({
				msg: "Login Success!",
				access_token: expect.anything(),
				user: {},
			});
		});

		test("Return 400 if email does not exist", async () => {
			await request(app)
				.post("/api/login")
				.send({
					email: "wrongemail@gmail.com",
					password: "123456",
				})
				.expect(400);
		});

		test("Return 400 if password is incorrect", async () => {
			await request(app)
				.post("/api/login")
				.send({
					email: "thanhsang6325@gmail.com",
					password: "wrongpassword",
				})
				.expect(400);
		});

		test("Return 500 if password is missing", async () => {
			await request(app)
				.post("/api/login")
				.send({
					email: "thanhsang6325@gmail.com",
				})
				.expect(500);
		});
	});

	describe("POST /api/logout", () => {
		test("Return status 200", async () => {
			await request(app).post("/api/logout").expect(200);
		});
	});
});

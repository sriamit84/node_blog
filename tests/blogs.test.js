const Page = require("./helpers/page");

let page;

beforeEach(async () => {
	page = await Page.build();
	await page.goto("http://localhost:3000");
});

afterEach(() => {
	page.close();
});

describe("When logged in ", async () => {
	beforeEach(async () => {
		await page.login();
		await page.click("a.btn-floating");
	});

	test("Can see blog create form", async () => {
		const text = await page.getContentsOf(".title label");
		expect(text).toEqual("Blog Title");
	});

	describe("And using valid inputs", async () => {
		beforeEach(async () => {
			await page.type(".title>input", "My Test Blog");
			await page.type(".content>input", "My Test Blog Content");
			await page.click("button.teal");
		});

		test("submitting takes user to review screen", async () => {
			const confirmationPageTitle = await page.getContentsOf("form h5");
			expect(confirmationPageTitle).toEqual("Please confirm your entries");
		});

		test("submitting then saving blog to index page ", async () => {
			await page.click("button.green");
			await page.waitFor(".card");

			const blogPostTitle = await page.getContentsOf(".card-title");
			const blogPostContent = await page.getContentsOf("p");
			expect(blogPostTitle).toEqual("My Test Blog");
			expect(blogPostContent).toEqual("My Test Blog Content");
		});
	});

	describe("And using invalid inputs", async () => {
		beforeEach(async () => {
			await page.click("button.teal");
		});

		test("the form shows the error message", async () => {
			const validationError = await page.getContentsOf(".title>div.red-text");
			expect(validationError).toEqual("You must provide a value");
		});
	});
});

describe("When user is not logged in", async () => {
	const actions = [
		{
			method: "get",
			url: "/api/blogs",
		},
		{
			method: "post",
			url: "/api/blogs",
			body: {
				title: "My Test Title",
				content: "My Test Content",
			},
		},
	];
	test("User should not be able to perform any actions related to blogs", async () => {
		const results = await page.executeReqs(actions);
		results.forEach((result) =>
			expect(result).toEqual({ error: "You must log in!" })
		);
	});
});

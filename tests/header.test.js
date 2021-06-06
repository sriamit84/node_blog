const Page = require("./helpers/page");

let page;

beforeEach(async () => {
	page = await Page.build();
	await page.goto("http://localhost:3000");
});

afterEach(() => {
	page.close();
});

test("The header has correct text", async () => {
	const headerName = await page.getContentsOf("a.brand-logo");

	expect(headerName).toEqual("Blogster");
});

test("Clicking Login will start oauth flow", async () => {
	await page.click(".right a");
	let url = await page.url();
	expect(url).toMatch("/accounts.google.com");
});

test("When signed in, shows logout button", async () => {
	await page.login();

	const text = await page.getContentsOf('a[href="/auth/logout"]');

	expect(text).toEqual("Logout");
});

const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class Page {
	constructor(page) {
		this.page = page;
	}

	static async build() {
		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox"],
		});
		const page = await browser.newPage();
		const customPage = new Page(page);

		return new Proxy(customPage, {
			get: function (target, property) {
				return customPage[property] || browser[property] || page[property];
			},
		});
	}

	async login() {
		const user = await userFactory();

		const { session, signature } = await sessionFactory(user);

		await this.page.setCookie({ name: "session", value: session });
		await this.page.setCookie({ name: "session.sig", value: signature });

		await this.page.goto("http://localhost:3000/blogs");

		await this.page.waitFor('a[href="/auth/logout"]');
	}

	async getContentsOf(selector) {
		return this.page.$eval(selector, (elem) => elem.innerHTML);
	}

	async get(url) {
		return this.page.evaluate((url) => {
			return fetch(`${url}`, {
				method: "GET",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/json",
				},
			}).then((res) => res.json());
		}, url);
	}

	async post(url, body) {
		return this.page.evaluate(
			(url, body) => {
				return fetch(`${url}`, {
					method: "POST",
					credentials: "same-origin",
					headers: {
						"Content-Type": "application/json",
					},
					data: JSON.stringify(body),
				}).then((res) => res.json());
			},
			url,
			body
		);
	}

	executeReqs(actions) {
		return Promise.all(
			actions.map(({ method, url, body }) => {
				return this[method](url, body);
			})
		);
	}
}

module.exports = Page;

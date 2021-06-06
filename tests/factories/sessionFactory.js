const Keygrip = require("keygrip");

const keys = require("../../config/keys");

const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
	const Buffer = require("safe-buffer").Buffer;

	const sessionObject = {
		passport: {
			user: user._id.toString(),
		},
	};

	const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");

	const signature = keygrip.sign("session=" + session);

	console.log(session, " :::  ", signature);

	return { session, signature };
};

let { VirtualBundle } = require("faucet-pipeline-js/lib/bundle/virtual");

// a plugin loads the highlighter for the language
let loadLanguages = require("prismjs/components/");
loadLanguages(["jsx"]);

let rendering = `
import Renderer, { Fragment as _F, createElement as _h } from "complate-stream";
import BufferedStream from "complate-stream/src/buffered-stream";

let renderer = new Renderer();

function render(macro, fragment) {
	let view = () => _h(_F, null, macro);
	let stream = new BufferedStream();
	renderer.renderView(view, null, stream, { fragment }, () => {
		let html = stream.read();
	RENDERED = html;
	});
}`;

let bundle = new VirtualBundle("./", {
	format: "CommonJS",
	jsx: { pragma: "createElement" }
}, {
	browsers: {}
});

module.exports = function(snippet) {
	return new Promise((resolve, reject) => {
		let viewCode = snippet.replace("\n\n", "\n\n; " + rendering + "; render(") + ")";

		bundle.compile(viewCode).then(({ code, error }) => {
			if(error) {
				return reject(error);
			}

			let RENDERED;
			eval(code); // eslint-disable-line no-eval

			resolve(RENDERED);
		});
	});
};

const App = require('./layouts/Dash.svelte').default;

const app = new App({
	target: document.body,
});

window.app = app;

module.exports = app;
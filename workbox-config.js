module.exports = {
	globDirectory: './',
	globPatterns: [
		'**/*.{js,png,html,css}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};
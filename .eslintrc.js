module.exports = {
	parser: "@typescript-eslint/parser", // Specifies the ESLint parser
	parserOptions: {
		ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
		sourceType: "module" // Allows for the use of imports
	},
	extends: [
		"oclif",
		"oclif-typescript",
		"plugin:@typescript-eslint/recommended",
		"prettier/@typescript-eslint",
		"plugin:prettier/recommended",
	],
	rules: {
	}
};

import { expect } from "@oclif/test";
import outdent from "outdent";

import { DumbJavaDocParser } from "../../src/RegistryManagers/DumbJavaDocParser";

describe("DumbJavaDocParser", () => {
	it("should handle single line doc blocks", () => {
		const raw = "/** @deprecated 1.0 Please don't use me anymore */";
		const actual = new DumbJavaDocParser(raw);

		expect(actual.body).to.deep.equal(["@deprecated 1.0 Please don't use me anymore"]);
	});

	it("should handle multiline doc blocks", () => {
		const raw = outdent`
			/**
			 * @param string $variable Some string variable as an argument
			 */
		`;
		const actual = new DumbJavaDocParser(raw);

		expect(actual.body).to.deep.equal(["@param string $variable Some string variable as an argument"]);
	});

	it("should handle multiline doc blocks with empty lines", () => {
		const raw = outdent`
			/**
			 * Hello
			 *
			 * @param string $variable Some string variable as an argument
			 *
			 * @return string
			 */
		`;
		const actual = new DumbJavaDocParser(raw);

		expect(actual.body).to.deep.equal([
			"Hello",
			"",
			"@param string $variable Some string variable as an argument",
			"",
			"@return string",
		]);
	});

	it("should add a new tag to the docblock", () => {
		const raw = "/** @deprecated 1.0 Please don't use me anymore */";
		const actual = new DumbJavaDocParser(raw);
		actual.addTag("since", "1.0.2");

		expect(actual.write()).to.equal(outdent`
			/**
			 * @deprecated 1.0 Please don't use me anymore
			 * @since 1.0.2
			 */
		`);
	});

	it("should preserve the indentation of the docblock", () => {
		const raw = outdent`
			// This is the correct indentation
				/**
				 * @param string $variable Some string variable as an argument
				 *
				 * @return string
				 */
		`;
		const actual = new DumbJavaDocParser(raw);
		actual.addTag("since", "1.0.2");

		expect(actual.write()).to.equal(
			[
				"\t/**",
				"\t * @param string $variable Some string variable as an argument",
				"\t *",
				"\t * @return string",
				`\t * @since 1.0.2`,
				"\t */",
			].join("\n"),
		);
	});

	it("should persist spacing inside of the phpdoc", () => {
		const raw = outdent`
			/**
			 * Hello World
			 *
			 * @param string $hello This is a very long message that should be wrapping two
			 *                      separate lines.
			 *
			 * @return array
			 */
		`;
		const actual = new DumbJavaDocParser(raw);

		expect(actual.body).to.deep.equal([
			"Hello World",
			"",
			"@param string $hello This is a very long message that should be wrapping two",
			"                     separate lines.",
			"",
			"@return array",
		]);
	});

	it("should add a tag as the first tag", () => {
		const raw = outdent`
			/**
			 * Hello world
			 *
			 * @param string $hello
			 */
		`;
		const actual = new DumbJavaDocParser(raw);
		actual.addTag("since", "1.0.0", actual.AS_FIRST_TAG);

		expect(actual.body).to.deep.equal(["Hello world", "", "@since 1.0.0", "@param string $hello"]);
	});
});

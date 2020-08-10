import { expect } from "@oclif/test";
import { outdent } from "outdent";

import { QueueFileWriter } from "../../src/RegistryManagers/QueueFileWriter";

describe("QueueFileWriter", () => {
	it("should insert new line at the beginning of the file", () => {
		const content = outdent`
			function hello() {}
		`;
		const writer = new QueueFileWriter(content, "");
		writer.insertLineAbove(1, `/** @since future */`);

		const expected = outdent`
			/** @since future */
			function hello() {}
		`;

		expect(writer.write()).to.equal(expected);
	});

	it("should insert new lines midway through the file", () => {
		const content = outdent`
			import { whatever } from 'dependency-hell';

			function noop() {}
		`;
		const writer = new QueueFileWriter(content, "");
		writer.insertLinesAbove(3, ["/**", " * A no-op function.", " */"]);

		const expected = outdent`
			import { whatever } from 'dependency-hell';

			/**
			 * A no-op function.
			 */
			function noop() {}
		`;

		expect(writer.write()).to.equal(expected);
	});

	it("should delete one line", () => {
		const content = outdent`
			import { whatever } from 'dependency-hell';

			/**
			 * A no-op function.
			 */
			function noop() {}
		`;
		const writer = new QueueFileWriter(content, "");
		writer.removeLine(1);

		const expected = outdent`

			/**
			 * A no-op function.
			 */
			function noop() {}
		`;

		expect(writer.write()).to.equal(expected);
	});

	it("should delete specified lines", () => {
		const content = outdent`
			import { whatever } from 'dependency-hell';

			/**
			 * A no-op function.
			 */
			function noop() {}
		`;
		const writer = new QueueFileWriter(content, "");
		writer.removeLines(3, 5);

		const expected = outdent`
			import { whatever } from 'dependency-hell';

			function noop() {}
		`;

		expect(writer.write()).to.equal(expected);
	});

	it("should replace a single line", () => {
		const content = outdent`
			import { whatever } from 'dependency-hell';

			/**
			 * A no-op function.
			 */
			function noop() {}
		`;
		const writer = new QueueFileWriter(content, "");
		writer.replaceLine(4, " * A special no-op function.");

		const expected = outdent`
			import { whatever } from 'dependency-hell';

			/**
			 * A special no-op function.
			 */
			function noop() {}
		`;

		expect(writer.write()).to.equal(expected);
	});

	it("should replace lines with different size replacement", () => {
		const content = outdent`
			import { whatever } from 'dependency-hell';

			/**
			 * A no-op function.
			 */
			function noop() {}
		`;
		const writer = new QueueFileWriter(content, "");
		writer.replaceLines(
			3,
			5,
			outdent`
				/**
				 * A real special no-op function that does nothing!
				 *
				 * @public
				 * @since 1.0.0
				 */
			`.split("\n"),
		);

		const expected = outdent`
			import { whatever } from 'dependency-hell';

			/**
			 * A real special no-op function that does nothing!
			 *
			 * @public
			 * @since 1.0.0
			 */
			function noop() {}
		`;

		expect(writer.write()).to.equal(expected);
	});

	it("should handle multiple calls to replaceLines", () => {
		const content = outdent`
			import { whatever } from 'dependency-hell';

			/**
			 * @api
			 */
			function noop() {}

			/** @api */
			function noop2() {}
		`;
		const writer = new QueueFileWriter(content, "");

		writer.replaceLines(
			8,
			8,
			outdent`
			/**
			 * The new and approved no-op function!
			 *
			 * @api
			 * @since 2.0.0
			 */
		`.split("\n"),
		);

		writer.replaceLines(
			3,
			5,
			outdent`
			/**
			 * @api
			 * @since 1.0.0
			 */
		`.split("\n"),
		);

		const expected = outdent`
			import { whatever } from 'dependency-hell';

			/**
			 * @api
			 * @since 1.0.0
			 */
			function noop() {}

			/**
			 * The new and approved no-op function!
			 *
			 * @api
			 * @since 2.0.0
			 */
			function noop2() {}
		`;

		expect(writer.write()).to.equal(expected);
	});
});

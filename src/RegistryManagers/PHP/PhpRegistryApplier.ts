import { existsSync, readFileSync } from "fs";
import { join } from "path";

import * as autoBind from "auto-bind";
import Engine from "php-parser";

import { IRegistry, IRegistryEntry } from "../IRegistry";
import { IRegistryApplier } from "../IRegistryApplier";
import { QueueFileWriter } from "../QueueFileWriter";
import { PhpRegistryEntry } from "./PhpRegistryTypes";

export default class PhpRegistryApplier implements IRegistryApplier<PhpRegistryEntry> {
	private readonly parser: Engine;

	constructor() {
		this.parser = new Engine({
			parser: {
				extractDoc: true,
			},
			ast: {
				withPositions: true,
			},
		});

		autoBind(this);
	}

	apply(directory: string, registry: IRegistry<PhpRegistryEntry>): void {
		Object.values(registry).forEach((entry: IRegistryEntry<PhpRegistryEntry>) => {
			const fullPath = join(directory, entry.relativeFilePath);

			if (!existsSync(fullPath)) {
				return;
			}

			const content = readFileSync(fullPath, "utf8");
			const ast = this.parser.parseCode(content);

			if (entry.type === "class") {
				const fileWriter = new QueueFileWriter(content);
				fileWriter.insertLines(17, ["/**", ` * @since ${entry.semVerStr}`, " */"]);
				fileWriter.insertLine(48, `     * @since ${entry.semVerStr}`);

				const q = fileWriter.write();
				const t = 1;
			}

			const t = 1;
		});
	}
}

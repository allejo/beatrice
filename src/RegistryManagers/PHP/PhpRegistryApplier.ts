import { readFileSync } from "fs";

import * as autoBind from "auto-bind";
import Engine, { Class, Function, Namespace, Node, Program } from "php-parser";

import { walkRepository } from "../../Utilities/Filesystem";
import { assumeType } from "../../Utilities/TypeCasting";
import { IRegistry } from "../IRegistry";
import { IRegistryApplier } from "../IRegistryApplier";
import { QueueFileWriter } from "../QueueFileWriter";
import { PhpRegistryEntry } from "./PhpRegistryTypes";

interface AstCallbacks {
	onClass: (cls: Class) => void;
	onMethod: (cls: Function) => void;
}

export class PhpRegistryApplier implements IRegistryApplier<PhpRegistryEntry> {
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

	apply(directory: string, srcDirs: string[], registry: IRegistry<PhpRegistryEntry>): void {
		walkRepository<void>(directory, srcDirs, (absFilePath: string): void => {
			const fileContent = readFileSync(absFilePath, "utf8");
			const writer = new QueueFileWriter(fileContent);
			const ast = this.parser.parseCode(fileContent);

			this.astTraversal(ast, {
				onClass: (cls: Class) => {
					if (cls.leadingComments) {
						// This class has an existing comment
						const line = cls.leadingComments[0].loc.start;
						const t = 1;
					} else {
						const startingLine = ast.loc.start;

						writer.insertLine(startingLine, ["/**", ` * @since {}`, " */"]);
						const t = 1;
					}
				},
				onMethod: (fxn: Function) => {},
			});
		}).catch(() => {
			console.log("Welp, I errored out?");
		});
	}

	private astTraversal(ast: Node, callbacks: AstCallbacks): void {
		if (ast.kind === "program") {
			assumeType<Program>(ast);

			ast.children.forEach(node => {
				this.astTraversal(node, callbacks);
			});
		} else if (ast.kind === "namespace") {
			assumeType<Namespace>(ast);

			ast.children.forEach(node => {
				this.astTraversal(node, callbacks);
			});
		} else if (ast.kind === "class") {
			assumeType<Class>(ast);

			callbacks.onClass(ast);

			ast.body.forEach(node => {
				this.astTraversal(node, callbacks);
			});
		} else if (ast.kind === "method") {
			assumeType<Function>(ast);

			callbacks.onMethod(ast);
		}
	}
}

import { readFileSync, writeFileSync } from "fs";

import autoBind from "auto-bind";
import Engine, { Class, CommentBlock, Function, Location, Namespace, Node, Program } from "php-parser";

import { walkRepository } from "../../Utilities/Filesystem";
import { assumeType } from "../../Utilities/TypeCasting";
import { DumbJavaDocParser } from "../DumbJavaDocParser";
import { IRegistry } from "../IRegistry";
import { IRegistryApplier } from "../IRegistryApplier";
import { QueueFileWriter } from "../QueueFileWriter";
import { AstParserError } from "./errors";
import { PhpRegistryEntry } from "./PhpRegistryTypes";

type Dictionary = Record<string, string>;

interface AstCallbacks {
	onClass: (writer: QueueFileWriter, cls: Class, options: Dictionary) => void;
	onMethod: (writer: QueueFileWriter, cls: Function, options: Dictionary) => void;
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
			let writer: QueueFileWriter, ast: Node;

			try {
				[writer, ast] = this.buildWriters(absFilePath);
			} catch (e) {
				console.log(`Error detected in file ${e.filePath}:`);
				console.log(`  ${e.astError.name}: ${e.astError.message}`);

				return;
			}

			const applier = (writer: QueueFileWriter, node: Class | Function, options: Dictionary) => {
				const signature = PhpRegistryApplier.getRegistrySignature(node, options);
				let docBlock: DumbJavaDocParser;
				let location: Location;

				if (node.leadingComments) {
					const docBlocks: CommentBlock[] = node.leadingComments.filter(c => c.kind === "commentblock");

					if (docBlocks.length > 0) {
						const [docBlockComment] = docBlocks.slice(-1);
						docBlock = new DumbJavaDocParser(docBlockComment.value);

						if (docBlockComment.loc) {
							location = docBlockComment.loc;
						}
					}
				} else {
					if (!node.loc) {
						// @TODO throw an error here?
						return;
					}

					location = node.loc;
					docBlock = new DumbJavaDocParser("");
					docBlock.addTag("since", registry[signature]?.semVerStr ?? "future");

					writer.insertLines(location.start.line, docBlock.writeAsArray());

					writeFileSync(writer.filePath, writer.write());
				}
			};

			this.astTraversal(writer, ast, {
				onClass: applier,
				onMethod: applier,
			});
		}).catch(e => {
			console.error(`An unknown error happened: ${e}`);
		});
	}

	private astTraversal(writer: QueueFileWriter, ast: Node, callbacks: AstCallbacks, options: Dictionary = {}): void {
		if (ast.kind === "program") {
			assumeType<Program>(ast);

			ast.children.forEach(node => {
				this.astTraversal(writer, node, callbacks);
			});
		} else if (ast.kind === "namespace") {
			assumeType<Namespace>(ast);

			ast.children.forEach(node => {
				this.astTraversal(writer, node, callbacks, { namespace: ast.name });
			});
		} else if (ast.kind === "class") {
			assumeType<Class>(ast);

			callbacks.onClass(writer, ast, options);

			ast.body.forEach(node => {
				this.astTraversal(writer, node, callbacks, {
					...options,
					className: ast.name?.name ?? ast.name,
				});
			});
		} else if (ast.kind === "method") {
			assumeType<Function>(ast);

			callbacks.onMethod(writer, ast, options);
		}
	}

	private buildWriters(phpFilePath: string): [QueueFileWriter, Program] {
		const fileContent = readFileSync(phpFilePath, "utf8");
		let ast: Program;

		try {
			ast = this.parser.parseCode(fileContent);
		} catch (e) {
			throw new AstParserError(phpFilePath, e);
		}

		const writer = new QueueFileWriter(fileContent, phpFilePath);

		return [writer, ast];
	}

	private static getRegistrySignature(ast: Node, options: Dictionary): string {
		if (ast.kind === "class") {
			assumeType<Class>(ast);
			const className = ast.name?.name ?? ast.name;

			return `${options.namespace ?? ""}\\${className}`;
		} else if (ast.kind === "method") {
			assumeType<Function>(ast);
			const fxnName = ast.name?.name ?? ast.name;

			return `${options.namespace ?? ""}\\${options.className ?? ""}::${fxnName}`;
		}

		throw Error("Unsupported AST node.");
	}
}

import { readFileSync, writeFileSync } from "fs";

import autoBind from "auto-bind";
import { Class, CommentBlock, Engine, Function, Location, Namespace, Node, Program } from "php-parser";

import { walkRepository } from "../../Utilities/Filesystem";
import { assumeType } from "../../Utilities/TypeCasting";
import { DumbJavaDocParser } from "../DumbJavaDocParser";
import { IRegistry } from "../IRegistry";
import { IRegistryApplier } from "../IRegistryApplier";
import { IRegistryOptions, TagOrder } from "../IRegistryOptions";
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

	constructor(protected readonly options: Partial<IRegistryOptions>) {
		this.options = {
			tagOrder: TagOrder.FIRST,
			...options,
		};
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
				const semVerAdded = registry[signature]?.semVerStr ?? "future";

				let docBlock: DumbJavaDocParser | null = null;
				let location: Location | null = null;

				if (node.leadingComments) {
					const docBlocks: CommentBlock[] = node.leadingComments.filter(c => c.kind === "commentblock");

					if (docBlocks.length > 0) {
						const [docBlockComment] = docBlocks.slice(-1);
						docBlock = new DumbJavaDocParser(docBlockComment.value);

						if (docBlockComment.loc) {
							location = docBlockComment.loc;
						}
					}

					if (!docBlock || !location) {
						// @TODO log an error here too...?
						return;
					}

					let position = -1;

					if (this.options.tagOrder === TagOrder.FIRST) {
						position = docBlock.AS_FIRST_TAG;
					} else if (this.options.tagOrder === TagOrder.LAST) {
						position = -1;
					}

					docBlock.addTag("since", semVerAdded, position);
					writer.replaceLines(location.start.line, location.end.line, docBlock.writeAsArray());
					writeFileSync(writer.filePath, writer.write());
				} else {
					if (!node.loc) {
						// @TODO log an error here?
						return;
					}

					location = node.loc;
					docBlock = new DumbJavaDocParser("");
					docBlock.addTag("since", semVerAdded);
					writer.insertLinesAbove(location.start.line, docBlock.writeAsArray());
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
					className: typeof ast.name === "object" ? ast.name.name : ast.name,
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
			ast = this.parser.parseCode(fileContent, "");
		} catch (e) {
			throw new AstParserError(phpFilePath, e);
		}

		const writer = new QueueFileWriter(fileContent, phpFilePath);

		return [writer, ast];
	}

	private static getRegistrySignature(ast: Node, options: Dictionary): string {
		if (ast.kind === "class") {
			assumeType<Class>(ast);
			const className = typeof ast.name === "object" ? ast.name.name : ast.name;

			return `${options.namespace ?? ""}\\${className}`;
		} else if (ast.kind === "method") {
			assumeType<Function>(ast);
			const fxnName = typeof ast.name === "object" ? ast.name.name : ast.name;

			return `${options.namespace ?? ""}\\${options.className ?? ""}::${fxnName}`;
		}

		throw Error("Unsupported AST node.");
	}
}

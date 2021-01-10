import { readFileSync } from "fs";

import autoBind from "auto-bind";
import { Class, Engine, Function, Identifier, Interface, Namespace, Node, Program, Trait } from "php-parser";

import { assumeType } from "../../Utilities/TypeCasting";
import { BaseRegistryBuilder } from "../BaseRegistryBuilder";
import { PhpFile } from "./PhpRegistryTypes";

export class PhpRegistryBuilder extends BaseRegistryBuilder<PhpFile> {
	private readonly parser: Engine;

	constructor() {
		super();

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

	parseFile(filePath: string): PhpFile {
		const content = readFileSync(filePath, "utf8");
		const ast: Program = this.parser.parseCode(content, "");
		const fileRegistry: PhpFile = {
			file: filePath,
			classes: {},
			functions: {},
		};

		this.astTraversal(ast, fileRegistry, {
			file: filePath,
		});

		return fileRegistry;
	}

	private astTraversal(ast: Node, fileRegistry: PhpFile, settings?: Record<string, any>): void {
		if (ast.kind === "program") {
			assumeType<Program>(ast);

			ast.children.forEach(node => {
				this.astTraversal(node, fileRegistry, settings);
			});
		} else if (ast.kind === "namespace") {
			assumeType<Namespace>(ast);

			ast.children.forEach(node => {
				this.astTraversal(node, fileRegistry, {
					...settings,
					namespace: ast.name,
				});
			});
		} else if (ast.kind === "class" || ast.kind === "trait" || ast.kind === "interface") {
			assumeType<Class | Interface | Trait>(ast);

			const className = PhpRegistryBuilder.getName(ast.name);

			fileRegistry.classes[className] = {
				file: settings?.file || "",
				namespace: settings?.namespace,
				tagAdded: this.semVer!,
				className: className,
				methods: [],
			};

			ast.body.forEach(node => {
				this.astTraversal(node, fileRegistry, {
					...settings,
					namespace: settings?.namespace,
					className: ast.name,
				});
			});
		} else if (ast.kind === "method") {
			assumeType<Function>(ast);

			const className = PhpRegistryBuilder.getName(settings?.className || "");

			if (!className) {
				return;
			}

			fileRegistry.classes[className].methods.push({
				file: settings?.file || "",
				namespace: settings?.namespace,
				tagAdded: this.semVer!,
				fxnName: PhpRegistryBuilder.getName(ast.name),
			});
		}
	}

	private static getName(name: Identifier | string): string {
		if (typeof name === "string") {
			return name;
		}

		return name.name;
	}
}

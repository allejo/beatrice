import { readFileSync } from "fs";

import Engine, {
  PHPClass,
  PHPFunction,
  PHPIdentifier,
  PHPNamespace,
  PHPNode,
  PHPProgram,
} from "php-parser";

import { assumeType } from "../../Utilities";
import BaseAstManager from "../BaseAstManager";
import { PhpFile } from "./PhpNode";

export default class PhpAstManager extends BaseAstManager<PhpFile> {
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
  }

  public parseFile(filePath: string): PhpFile {
    const content = readFileSync(filePath, "utf8");
    const ast: PHPProgram = this.parser.parseCode(content);
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

  private astTraversal(
    ast: PHPNode,
    fileRegistry: PhpFile,
    settings?: Record<string, any>,
  ): void {
    if (ast.kind === "program") {
      assumeType<PHPProgram>(ast);

      ast.children.forEach(node => {
        this.astTraversal(node, fileRegistry, settings);
      });
    } else if (ast.kind === "namespace") {
      assumeType<PHPNamespace>(ast);

      ast.children.forEach(node => {
        this.astTraversal(node, fileRegistry, {
          ...settings,
          namespace: ast.name,
        });
      });
    } else if (ast.kind === "class") {
      assumeType<PHPClass>(ast);

      ast.body.forEach(node => {
        const className = PhpAstManager.getName(ast.name);

        fileRegistry.classes[className] = {
          file: settings?.file || "",
          namespace: settings?.namespace,
          tagAdded: this.semVer!,
          className: className,
          functions: [],
        };

        this.astTraversal(node, fileRegistry, {
          ...settings,
          namespace: settings?.namespace,
          className: ast.name,
        });
      });
    } else if (ast.kind === "method") {
      assumeType<PHPFunction>(ast);

      const className = PhpAstManager.getName(settings?.className || "");

      if (!className) {
        return;
      }

      fileRegistry.classes[className].functions.push({
        file: settings?.file || "",
        namespace: settings?.namespace,
        tagAdded: this.semVer!,
        fxnName: PhpAstManager.getName(ast.name),
      });
    }
  }

  private static getName(name: PHPIdentifier | string): string {
    if (typeof name === "string") {
      return name;
    }

    return name.name;
  }
}

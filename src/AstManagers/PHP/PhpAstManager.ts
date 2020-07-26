import { readFileSync } from "fs";

import Engine from "php-parser";

import BaseAstManager from "../BaseAstManager";
import { PhpFile } from "./PhpFile";

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
    const ast = this.parser.parseCode(content);

    console.log(ast);

    return {
      file: filePath,
      tagAdded: this.semVer!,
      functions: [],
    };
  }
}

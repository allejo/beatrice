import { promises as fs } from "fs";
import { join } from "path";

export default abstract class BaseAstManager implements IAstManager {
  public async walkRepository(
    repoDir: string,
    srcDirs: string[]
  ): Promise<void> {
    const tgtSrcDirs = srcDirs.map(srcDir => join(repoDir, srcDir));

    for (const tgtSrcDir of tgtSrcDirs) {
      await this.walkDir(tgtSrcDir);
    }
  }

  public abstract parseFile(filePath: string): void;

  private async walkDir(srcDirPath: string): Promise<void> {
    const dir = fs.readdir(srcDirPath);

    for (const fileOrDirName of await dir) {
      const absPath = join(srcDirPath, fileOrDirName);
      const fsObj = await fs.stat(absPath);

      if (fsObj.isDirectory()) {
        await this.walkDir(absPath);
      } else {
        this.parseFile(absPath);
      }
    }
  }
}

import { promises as fs } from "fs";
import { join } from "path";

import { SemVer } from "semver";

import { VersionRegistry } from "../VersionRegistry";
import { IAstManager } from "./IAstManager";

export default abstract class BaseAstManager<T> implements IAstManager<T> {
  protected semVer: SemVer | null = null;

  public async walkRepository(
    repoDir: string,
    srcDirs: string[],
    semVer: SemVer,
  ): Promise<VersionRegistry<T>> {
    this.semVer = semVer;

    const tgtSrcDirs = srcDirs.map(srcDir => join(repoDir, srcDir));
    const output: VersionRegistry<T> = {
      repositoryDirectory: repoDir,
      files: {},
    };

    for (const tgtSrcDir of tgtSrcDirs) {
      await this.walkDir(tgtSrcDir);
    }

    return output;
  }

  public abstract parseFile(filePath: string): T;

  private async walkDir(srcDirPath: string): Promise<Record<string, T>> {
    const dir = fs.readdir(srcDirPath);
    const files: Record<string, T> = {};

    for (const fileOrDirName of await dir) {
      const absPath = join(srcDirPath, fileOrDirName);
      const fsObj = await fs.stat(absPath);

      if (fsObj.isDirectory()) {
        await this.walkDir(absPath);
      } else {
        files[absPath] = this.parseFile(absPath);
      }
    }

    return files;
  }
}

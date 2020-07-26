import { SemVer } from "semver";

import { VersionRegistry } from "../VersionRegistry";

export interface IAstManager<T> {
  parseFile(filePath: string): T;

  walkRepository(
    repoDir: string,
    srcDirs: string[],
    semVer: SemVer,
  ): Promise<VersionRegistry<T>>;
}

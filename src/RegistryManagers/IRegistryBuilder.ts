import { SemVer } from "semver";

import { VersionRegistry } from "../VersionRegistry";

export interface IRegistryBuilder<T> {
	parseFile(filePath: string): T;

	walkRepository(repoDir: string, srcDirs: string[], semVer: SemVer): Promise<VersionRegistry<T>>;
}

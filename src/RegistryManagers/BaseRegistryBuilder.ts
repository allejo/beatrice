import { SemVer } from "semver";

import { walkRepository } from "../Utilities/Filesystem";
import { VersionRegistry } from "../VersionRegistry";
import { IRegistryBuilder } from "./IRegistryBuilder";

export abstract class BaseRegistryBuilder<T> implements IRegistryBuilder<T> {
	protected semVer: SemVer | null = null;

	public async walkRepository(repoDir: string, srcDirs: string[], semVer: SemVer): Promise<VersionRegistry<T>> {
		this.semVer = semVer;

		return walkRepository<T>(repoDir, srcDirs, this.parseFile);
	}

	public abstract parseFile(filePath: string): T;
}

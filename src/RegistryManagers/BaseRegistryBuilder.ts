import { promises as fs } from "fs";
import { join } from "path";

import { SemVer } from "semver";

import { VersionRegistry } from "../VersionRegistry";
import { IRegistryBuilder } from "./IRegistryBuilder";

export default abstract class BaseRegistryBuilder<T>
	implements IRegistryBuilder<T> {
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
			output.files = {
				...output.files,
				...(await this.walkDir(tgtSrcDir)),
			};
		}

		return output;
	}

	public abstract parseFile(filePath: string): T;

	private async walkDir(srcDirPath: string): Promise<Record<string, T>> {
		const dir = fs.readdir(srcDirPath);
		let files: Record<string, T> = {};

		for (const fileOrDirName of await dir) {
			const absPath = join(srcDirPath, fileOrDirName);
			const fsObj = await fs.stat(absPath);

			if (fsObj.isDirectory()) {
				files = {
					...files,
					...(await this.walkDir(absPath)),
				};
			} else {
				files[absPath] = this.parseFile(absPath);
			}
		}

		return files;
	}
}

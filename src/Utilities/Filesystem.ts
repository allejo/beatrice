import { promises as fs } from "fs";
import { join } from "path";

import { VersionRegistry } from "../VersionRegistry";

type callback<T> = (absFilePath: string) => T;
type FileMap<T> = Record<string, T>;

/**
 * Walk a directory recursively and call a callback for each file found.
 *
 * @param dir The directory path we will be traversing through
 * @param cb  The callback that will be called with the absolute path of each
 * 	          file in said directories
 */
async function walkDir<T>(dir: string, cb: callback<T>): Promise<FileMap<T>> {
	const directoryContents = fs.readdir(dir);
	const promises: Promise<FileMap<T>>[] = [];
	let files: FileMap<T> = {};

	for (const fileOrDirName of await directoryContents) {
		const absPath = join(dir, fileOrDirName);
		const fsObj = await fs.stat(absPath);

		if (fsObj.isDirectory()) {
			promises.push(walkDir(absPath, cb));
		} else {
			files[absPath] = cb(absPath);
		}
	}

	return Promise.all(promises).then((values: FileMap<T>[]) => {
		values.forEach((value: FileMap<T>) => {
			files = {
				...files,
				...value,
			};
		});

		return files;
	});
}

/**
 * Walk through specified folders within a repository.
 *
 * @param repoDir
 * @param srcDirs
 * @param cb
 */
export function walkRepository<T>(
	repoDir: string,
	srcDirs: string[],
	cb: callback<T>,
): Promise<VersionRegistry<T>> {
	const tgtSrcDirs = srcDirs.map(srcDir => join(repoDir, srcDir));
	const output: VersionRegistry<T> = {
		repositoryDirectory: repoDir,
		files: {},
	};
	const promises: Promise<FileMap<T>>[] = [];

	for (const tgtSrcDir of tgtSrcDirs) {
		promises.push(walkDir(tgtSrcDir, cb));
	}

	return Promise.all(promises).then((value: FileMap<T>[]) => {
		value.forEach(value1 => {
			output.files = {
				...output.files,
				...value1,
			};
		});

		return output;
	});
}

import { SemVer } from "semver";

import { IVersionControlManager } from "./IVersionControlManager";

export abstract class BaseManager<Ref> implements IVersionControlManager<Ref> {
	includePreReleases: boolean = false;

	static vcsType: string = "";

	constructor(
		protected directory: string,
		protected outputLog: (msg: string) => void,
		protected outputError: (msg: string) => void,
	) {
		if (!this.isValidRepository()) {
			throw new Error(
				`This is not a valid ${BaseManager.vcsType} repository.`,
			);
		}
	}

	abstract getVersions(): AsyncIterableIterator<[SemVer, Ref]>;

	abstract onStart(): Promise<void>;

	abstract onVersionPreSwitch(version: SemVer, tag: Ref): Promise<void>;

	abstract onVersionPostSwitch(version: SemVer, tar: Ref): Promise<void>;

	abstract onFinish(): Promise<void>;

	protected abstract isValidRepository(): boolean;
}

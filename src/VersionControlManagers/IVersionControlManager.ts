import { SemVer } from "semver";

export interface IVersionControlManager<RefType> {
	includePreReleases: boolean;

	getVersions(): AsyncIterableIterator<[SemVer, RefType]>;

	onStart(): Promise<void>;

	onVersionPreSwitch(version: SemVer, tag: RefType): Promise<void>;

	onVersionPostSwitch(version: SemVer, tag: RefType): Promise<void>;

	onFinish(): Promise<void>;
}

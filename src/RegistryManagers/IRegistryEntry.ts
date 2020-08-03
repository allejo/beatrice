import { SemVer } from "semver";

export interface IRegistryEntry<T> {
	[key: string]: {
		relativeFilePath: string;
		semVer: SemVer;
		semVerStr: string;
	} & T;
}

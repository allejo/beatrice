import { SemVer } from "semver";

export type IRegistryEntry<T> = {
	relativeFilePath: string;
	semVer: SemVer;
	semVerStr: string;
} & T;

export interface IRegistry<T> {
	[key: string]: IRegistryEntry<T>;
}

import { FullVersionHistory } from "../VersionRegistry";
import { IRegistryEntry } from "./IRegistryEntry";

export interface IRegistryReducer<V, R> {
	reduce(fullVH: FullVersionHistory<V>): IRegistryEntry<R>;
}

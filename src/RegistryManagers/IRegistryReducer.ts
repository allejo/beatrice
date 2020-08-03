import { FullVersionHistory } from "../VersionRegistry";
import { IRegistry } from "./IRegistry";

export interface IRegistryReducer<V, R> {
	reduce(fullVH: FullVersionHistory<V>): IRegistry<R>;
}

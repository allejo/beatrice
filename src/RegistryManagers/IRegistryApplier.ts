import { IRegistry } from "./IRegistry";

export interface IRegistryApplier<T> {
	apply(directory: string, srcDirs: string[], registry: IRegistry<T>): void;
}

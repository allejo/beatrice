import { IRegistry } from "./IRegistry";

export interface IRegistryApplier<T> {
	apply(directory: string, registry: IRegistry<T>): void;
}

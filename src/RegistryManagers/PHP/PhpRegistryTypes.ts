import { SemVer } from "semver";

interface Base {
	file: string;
	namespace?: string;
	tagAdded: SemVer;
}

export interface PhpFunction extends Base {
	fxnName: string;
}

export interface PhpClass extends Base {
	className: string;
	methods: PhpFunction[];
}

export interface PhpFile {
	file: string;
	classes: Record<string, PhpClass>;
	functions: Record<string, PhpFunction>;
}

export interface PhpRegistryEntry {
	type: "class" | "method" | "function" | "property";
	className?: string;
	namespace?: string;
	propertyName?: string;
	functionName?: string;
}

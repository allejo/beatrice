import { SemVer, lt } from "semver";

import { FullVersionHistory, VersionRegistry } from "../../VersionRegistry";
import { PhpClass, PhpFile, PhpFunction } from "./PhpRegistryTypes";

const items = (obj: object) => Object.values(obj);
type Opt<T> = T | undefined;

export default class PhpRegistryReducer {
	private apiDiff: Record<string, SemVer> = {};

	constructor(readonly repoDirectory: string) {}

	reduce(fullVH: FullVersionHistory<PhpFile>): Record<string, SemVer> {
		items(fullVH).forEach((releaseRegistry: VersionRegistry<PhpFile>) => {
			items(releaseRegistry.files).forEach((file: PhpFile) => {
				items(file.classes).forEach((cls: PhpClass) => {
					const clsSig: string = this.getClassSignature(cls);
					const prvClsVer: Opt<SemVer> = this.apiDiff[clsSig];

					if (prvClsVer == null || lt(cls.tagAdded, prvClsVer)) {
						this.apiDiff[clsSig] = cls.tagAdded;
					}

					cls.functions.forEach((fxn: PhpFunction) => {
						const fxnSig = this.getMethodSignature(fxn, cls);
						const prvFxnVer: Opt<SemVer> = this.apiDiff[fxnSig];

						if (prvFxnVer == null || lt(fxn.tagAdded, prvFxnVer)) {
							this.apiDiff[fxnSig] = fxn.tagAdded;
						}
					});
				});
			});
		});

		return this.apiDiff;
	}

	private getClassSignature(phpClass: PhpClass) {
		const relPath = phpClass.file.replace(this.repoDirectory, "");

		return `${relPath}#${phpClass.namespace}\\${phpClass.className}`;
	}

	private getMethodSignature(methodSignature: PhpFunction, cls: PhpClass) {
		return `${this.getClassSignature(cls)}::${methodSignature.fxnName}`;
	}
}

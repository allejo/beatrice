import { SemVer, lt } from "semver";

import { FullVersionHistory, VersionRegistry } from "../../VersionRegistry";
import { PhpClass, PhpFile, PhpFunction } from "./PhpRegistryTypes";

const items = (obj: object) => Object.values(obj);
type SemVerLike = SemVer | string;

export default class PhpRegistryReducer {
	constructor(readonly repoDirectory: string) {}

	reduce(fullVH: FullVersionHistory<PhpFile>): Record<string, string> {
		const apiDiff: Record<string, string> = {};

		items(fullVH).forEach((releaseRegistry: VersionRegistry<PhpFile>) => {
			items(releaseRegistry.files).forEach((file: PhpFile) => {
				items(file.classes).forEach((cls: PhpClass) => {
					const clsSig: string = this.getClassSignature(cls);
					const prvClsVer: SemVerLike | null = apiDiff[clsSig];

					if (prvClsVer == null || lt(cls.tagAdded, prvClsVer)) {
						apiDiff[clsSig] = this.semVerToStr(cls.tagAdded);
					}

					cls.functions.forEach((fxn: PhpFunction) => {
						const fxnSig = this.getMethodSignature(fxn, cls);
						const prvFxnVer: SemVerLike | null = apiDiff[fxnSig];

						if (prvFxnVer == null || lt(fxn.tagAdded, prvFxnVer)) {
							apiDiff[fxnSig] = this.semVerToStr(fxn.tagAdded);
						}
					});
				});
			});
		});

		return apiDiff;
	}

	private getClassSignature(phpClass: PhpClass) {
		const relPath = phpClass.file.replace(this.repoDirectory, "");

		return `${relPath}#${phpClass.namespace}\\${phpClass.className}`;
	}

	private getMethodSignature(methodSignature: PhpFunction, cls: PhpClass) {
		return `${this.getClassSignature(cls)}::${methodSignature.fxnName}`;
	}

	private semVerToStr(semVer: SemVer | string): string {
		if (semVer instanceof SemVer) {
			return semVer.version;
		}

		return semVer;
	}
}

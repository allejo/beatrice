import { SemVer, lt } from "semver";

import { FullVersionHistory, VersionRegistry } from "../../VersionRegistry";
import { IRegistry } from "../IRegistry";
import { IRegistryReducer } from "../IRegistryReducer";
import { PhpClass, PhpFile, PhpFunction, PhpRegistryEntry } from "./PhpRegistryTypes";

const items = (obj: object) => Object.values(obj);
type SemVerLike = SemVer | string;

export class PhpRegistryReducer implements IRegistryReducer<PhpFile, PhpRegistryEntry> {
	constructor(readonly repoDirectory: string) {}

	reduce(fullVH: FullVersionHistory<PhpFile>): IRegistry<PhpRegistryEntry> {
		const apiDiff: IRegistry<PhpRegistryEntry> = {};

		items(fullVH).forEach((releaseRegistry: VersionRegistry<PhpFile>) => {
			items(releaseRegistry.files).forEach((file: PhpFile) => {
				items(file.classes).forEach((cls: PhpClass) => {
					const clsSig: string = this.getClassSignature(cls);
					const prvClsVer: SemVerLike | null = apiDiff[clsSig]?.semVer;

					if (prvClsVer == null || lt(cls.tagAdded, prvClsVer)) {
						apiDiff[clsSig] = {
							type: "class",
							relativeFilePath: this.getRelFilePath(cls.file),
							className: cls.className,
							namespace: cls.namespace,
							semVer: cls.tagAdded,
							semVerStr: PhpRegistryReducer.semVerToStr(cls.tagAdded),
						};
					}

					cls.methods.forEach((fxn: PhpFunction) => {
						const fxnSig = this.getMethodSignature(fxn, cls);
						const prvFxnVer: SemVerLike | null = apiDiff[fxnSig]?.semVer;

						if (prvFxnVer == null || lt(fxn.tagAdded, prvFxnVer)) {
							apiDiff[fxnSig] = {
								type: "method",
								relativeFilePath: this.getRelFilePath(cls.file),
								className: cls.className,
								namespace: cls.namespace,
								semVer: cls.tagAdded,
								semVerStr: PhpRegistryReducer.semVerToStr(fxn.tagAdded),
								functionName: fxn.fxnName,
							};
						}
					});
				});
			});
		});

		return apiDiff;
	}

	private getRelFilePath(filePath: string) {
		return filePath.replace(this.repoDirectory, "");
	}

	private getClassSignature(phpClass: PhpClass) {
		return `${phpClass.namespace}\\${phpClass.className}`;
	}

	private getMethodSignature(methodSignature: PhpFunction, cls: PhpClass) {
		return `${this.getClassSignature(cls)}::${methodSignature.fxnName}`;
	}

	private static semVerToStr(semVer: SemVer | string): string {
		if (semVer instanceof SemVer) {
			return semVer.version;
		}

		return semVer;
	}
}

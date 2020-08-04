import { existsSync, lstatSync } from "fs";

import { Reference, Repository, Tag } from "nodegit";
import { SemVer, parse } from "semver";

import { BaseManager } from "./BaseManager";

export class NodeGitManager extends BaseManager<Reference> {
	private gitRepo: Repository | null = null;

	private startingPoint: Reference | null = null;

	static vcsType = "Git";

	async onStart(): Promise<void> {
		this.gitRepo = await Repository.open(this.directory);

		// @TODO Check if HEAD is dirty

		this.startingPoint = await this.gitRepo.head();
	}

	async onVersionPreSwitch(version: SemVer, tag: Reference): Promise<void> {
		this.outputLog(`Checking out tag: ${tag.name()}`);

		await this.gitRepo?.checkoutRef(tag);
	}

	async onVersionPostSwitch(version: SemVer, tar: Reference): Promise<void> {
		return Promise.resolve(undefined);
	}

	async onFinish(): Promise<void> {
		if (this.startingPoint === null) {
			return;
		}

		try {
			await this.gitRepo!.checkoutRef(this.startingPoint);

			this.outputLog("Original starting point of this repository restored.");
		} catch {
			this.outputError("Original starting point could not be restored.");
		}
	}

	async *getVersions(): AsyncIterableIterator<[SemVer, Reference]> {
		if (!this.gitRepo) {
			return [];
		}

		const tagReferences: string[] = await Tag.list(this.gitRepo);

		for (let i = 0; i < tagReferences.length; i++) {
			const tagReference: string = tagReferences[i];
			const tagSemVer: SemVer | null = parse(tagReference);

			if (tagSemVer !== null) {
				if (tagSemVer.prerelease.length > 0 && !this.includePreReleases) {
					continue;
				}

				const reference = await this.gitRepo.getReference(tagReference);

				yield [tagSemVer, reference];
			} else {
				this.outputError(`Following tag could not be parsed as semver: ${tagReference}`);
			}
		}
	}

	protected isValidRepository(): boolean {
		const dir = `${this.directory}/.git`;

		return existsSync(dir) && lstatSync(dir).isDirectory();
	}
}

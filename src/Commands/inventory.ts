import { Command, flags } from "@oclif/command";

import { IRegistryOptions, strToTagOrder } from "../RegistryManagers/IRegistryOptions";
import { PhpRegistryApplier } from "../RegistryManagers/PHP/PhpRegistryApplier";
import { PhpRegistryBuilder } from "../RegistryManagers/PHP/PhpRegistryBuilder";
import { PhpRegistryReducer } from "../RegistryManagers/PHP/PhpRegistryReducer";
import { PhpFile } from "../RegistryManagers/PHP/PhpRegistryTypes";
import { NodeGitManager } from "../VersionControlManagers/NodeGitManager";
import { FullVersionHistory } from "../VersionRegistry";

export default class Inventory extends Command {
	static description = "Create an inventory of an API";

	static flags = {
		lang: flags.string({ char: "l", description: "The language to parse" }),
		force: flags.boolean({ char: "f" }),
		prereleases: flags.boolean({ char: "p" }),
		tagOrder: flags.enum({ char: "o", options: ["first", "last"], default: "first" }),
	};

	static args = [
		{ name: "repoDir", required: true },
		{ name: "srcDirs", required: true },
	];

	async run() {
		const { args, flags } = this.parse(Inventory);
		const registryOptions: Partial<IRegistryOptions> = {
			tagOrder: strToTagOrder(flags.tagOrder),
		};

		const phpAstManager = new PhpRegistryBuilder(registryOptions);
		const vcsManager = new NodeGitManager(args.repoDir, this.log, this.error);
		vcsManager.includePreReleases = flags.prereleases;

		await vcsManager.onStart();
		const fullVersionHistory: FullVersionHistory<PhpFile> = {};
		const tags = vcsManager.getVersions();
		const srcDirs = args.srcDirs.split(",");

		for await (const [semVer, tag] of tags) {
			await vcsManager.onVersionPreSwitch(semVer, tag);

			const tagName = tag.name().replace("refs/tags/", "");

			fullVersionHistory[tagName] = await phpAstManager.walkRepository(args.repoDir, srcDirs, semVer);

			await vcsManager.onVersionPostSwitch(semVer, tag);
		}

		await vcsManager.onFinish();

		const reducer = new PhpRegistryReducer(args.repoDir);
		const apiDiff = reducer.reduce(fullVersionHistory);

		const applier = new PhpRegistryApplier(registryOptions);
		applier.apply(args.repoDir, srcDirs, apiDiff);
	}
}

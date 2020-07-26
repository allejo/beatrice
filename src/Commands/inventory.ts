import { Command, flags } from "@oclif/command";

import PhpAstManager from "../AstManagers/PHP/PhpAstManager";
import { PhpFile } from "../AstManagers/PHP/PhpNode";
import { NodeGitManager } from "../VersionControlManagers/NodeGitManager";
import { FullVersionHistory } from "../VersionRegistry";

export default class Inventory extends Command {
  static description = "Create an inventory of an API";

  static flags = {
    lang: flags.string({ char: "l", description: "The language to parse" }),
    force: flags.boolean({ char: "f" }),
    prereleases: flags.boolean({ char: "p" }),
  };

  static args = [
    { name: "repoDir", required: true },
    { name: "srcDirs", required: true },
  ];

  async run() {
    const { args, flags } = this.parse(Inventory);

    const phpAstManager = new PhpAstManager();
    const vcsManager = new NodeGitManager(args.repoDir, this.log, this.error);
    vcsManager.includePreReleases = flags.prereleases;

    await vcsManager.onStart();
    const fullVersionHistory: FullVersionHistory<PhpFile> = {};
    const tags = vcsManager.getVersions();

    for await (const [semVer, tag] of tags) {
      await vcsManager.onVersionPreSwitch(semVer, tag);

      const srcDirs = args.srcDirs.split(",");
      const tagName = tag.name().replace("refs/tags/", "");

      fullVersionHistory[tagName] = await phpAstManager.walkRepository(
        args.repoDir,
        srcDirs,
        semVer,
      );

      await vcsManager.onVersionPostSwitch(semVer, tag);
    }

    await vcsManager.onFinish();

    console.log(JSON.stringify(fullVersionHistory));
  }
}

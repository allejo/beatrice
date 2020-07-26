import { Command, flags } from "@oclif/command";

import PhpAstManager from "../AstManagers/PHP/PhpAstManager";
import { NodeGitManager } from "../VersionControlManagers/NodeGitManager";

export default class Inventory extends Command {
  static description = "Create an inventory of an API";

  static flags = {
    lang: flags.string({ char: "l", description: "The language to parse" }),
    force: flags.boolean({ char: "f" }),
    prereleases: flags.boolean({ char: "p" })
  };

  static args = [
    { name: "repoDir", required: true },
    { name: "srcDirs", required: true }
  ];

  async run() {
    const { args, flags } = this.parse(Inventory);

    const phpAstManager = new PhpAstManager();
    const vcsManager = new NodeGitManager(args.repoDir, this.log, this.error);
    vcsManager.includePreReleases = flags.prereleases;

    await vcsManager.onStart();
    const tags = vcsManager.getVersions();

    for await (const [semVer, tag] of tags) {
      await vcsManager.onVersionPreSwitch(semVer, tag);

      const srcDirs = args.srcDirs.split(",");
      await phpAstManager.walkRepository(args.repoDir, srcDirs);

      await vcsManager.onVersionPostSwitch(semVer, tag);
    }

    await vcsManager.onFinish();
  }
}

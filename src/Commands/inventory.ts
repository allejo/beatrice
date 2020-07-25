import { Command, flags } from "@oclif/command";

import { NodeGitManager } from "../VersionControlManagers/NodeGitManager";

export default class Inventory extends Command {
  static description = "Create an inventory of an API";

  static flags = {
    lang: flags.string({ char: "l", description: "The language to parse" }),
    force: flags.boolean({ char: "f" }),
    prereleases: flags.boolean({ char: "p" })
  };

  static args = [{ name: "directory" }];

  async run() {
    const { args, flags } = this.parse(Inventory);

    const vcsManager = new NodeGitManager(args.directory, this.log, this.error);
    vcsManager.includePreReleases = flags.prereleases;

    await vcsManager.onStart();
    const tags = vcsManager.getVersions();

    for await (const [semVer, tag] of tags) {
      await vcsManager.onVersionPreSwitch(semVer, tag);
      await vcsManager.onVersionPostSwitch(semVer, tag);
    }

    await vcsManager.onFinish();
  }
}

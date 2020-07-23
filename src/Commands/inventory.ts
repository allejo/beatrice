import { Command, flags } from "@oclif/command";

import { GitManager } from "../VersionControlManagers/GitManager";

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

    const vcsManager = new GitManager(args.directory, this.log, this.error);
    vcsManager.includePreReleases = flags.prereleases;

    await vcsManager.startWorkflow();
    const tags = vcsManager.getVersions();

    for await (const [semVer, tag] of tags) {
      await vcsManager.switchVersion(semVer, tag);
    }

    await vcsManager.finishWorkflow();
  }
}

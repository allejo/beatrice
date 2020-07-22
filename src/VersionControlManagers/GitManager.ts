import * as fs from "fs";
import { existsSync, lstatSync } from "fs";

import git from "isomorphic-git";
import { SemVer, parse } from "semver";

import { BaseManager } from "./BaseManager";

export class GitManager extends BaseManager {
  static vcsType = "Git";

  async *getVersions(): AsyncIterableIterator<SemVer> {
    const rawTags: string[] = await git.listTags({ fs, dir: this.directory });

    for (let i = 0; i < rawTags.length; i++) {
      const rawTag: string = rawTags[i];
      const tag: SemVer | null = parse(rawTag);

      if (tag !== null) {
        if (tag.prerelease.length > 0 && !this.includePreReleases) {
          continue;
        }

        yield tag;
      } else {
        this.outputError(
          `Following tag could not be parsed as semver: ${rawTags}`
        );
      }
    }
  }

  isValidRepository(): boolean {
    const dir = `${this.directory}/.git`;

    return existsSync(dir) && lstatSync(dir).isDirectory();
  }
}

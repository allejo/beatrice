import * as fs from "fs";
import { existsSync, lstatSync } from "fs";

import git from "isomorphic-git";
import { SemVer, parse } from "semver";

import { BaseManager } from "./BaseManager";

export class GitManager extends BaseManager {
  private startingCommit: string = "";

  static vcsType = "Git";

  async onStart(): Promise<void> {
    this.startingCommit = await this.getCurrentBranch();
  }

  async onVersionPreSwitch(version: SemVer, tag: string): Promise<void> {
    this.outputLog(`Using tag: ${tag}`);
    await git.checkout({
      fs,
      dir: this.directory,
      ref: tag
    });
  }

  onVersionPostSwitch(version: SemVer, tar: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  async onFinish(): Promise<void> {
    await git.checkout({
      fs,
      dir: this.directory,
      ref: this.startingCommit
    });
  }

  async *getVersions(): AsyncIterableIterator<[SemVer, string]> {
    const rawTags: string[] = await git.listTags({ fs, dir: this.directory });

    for (let i = 0; i < rawTags.length; i++) {
      const rawTag: string = rawTags[i];
      const tag: SemVer | null = parse(rawTag);

      if (tag !== null) {
        if (tag.prerelease.length > 0 && !this.includePreReleases) {
          continue;
        }

        yield [tag, rawTag];
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

  private async getCurrentBranch(): Promise<string> {
    const branch: string | void = await git.currentBranch({
      fs,
      dir: this.directory,
      fullname: false
    });

    if (typeof branch !== "string") {
      return "";
    }

    return branch;
  }
}

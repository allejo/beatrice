import { SemVer } from "semver";

import { IVersionControlManager } from "./IVersionControlManager";

export abstract class BaseManager implements IVersionControlManager {
  includePreReleases: boolean = false;

  static vcsType: string = "";

  constructor(
    protected directory: string,
    protected outputError: (msg: string) => void
  ) {
    if (!this.isValidRepository()) {
      throw new Error(`This is not a valid ${BaseManager.vcsType} repository.`);
    }
  }

  abstract getVersions(): AsyncIterableIterator<SemVer>;

  abstract isValidRepository(): boolean;
}

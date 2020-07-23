import { SemVer } from "semver";

import { IVersionControlManager } from "./IVersionControlManager";

export abstract class BaseManager implements IVersionControlManager {
  includePreReleases: boolean = false;

  static vcsType: string = "";

  constructor(
    protected directory: string,
    protected outputLog: (msg: string) => void,
    protected outputError: (msg: string) => void
  ) {
    if (!this.isValidRepository()) {
      throw new Error(`This is not a valid ${BaseManager.vcsType} repository.`);
    }
  }

  abstract startWorkflow(): Promise<void>;

  abstract switchVersion(version: SemVer, tag: string): Promise<void>;

  abstract finishWorkflow(): Promise<void>;

  abstract getVersions(): AsyncIterableIterator<[SemVer, string]>;

  abstract isValidRepository(): boolean;
}

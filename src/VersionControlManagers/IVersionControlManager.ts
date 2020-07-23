import { SemVer } from "semver";

export interface IVersionControlManager {
  includePreReleases: boolean;

  getVersions(): AsyncIterableIterator<[SemVer, string]>;

  isValidRepository(): boolean;
}

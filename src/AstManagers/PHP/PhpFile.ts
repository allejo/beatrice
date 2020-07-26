import { SemVer } from "semver";

export interface PhpFunction {}

export interface PhpFile {
  file: string;
  namespace?: string;
  className?: string;
  tagAdded: SemVer;
  functions: PhpFunction[];
}

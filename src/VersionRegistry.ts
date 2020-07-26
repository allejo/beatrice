export interface VersionRegistry<T> {
  repositoryDirectory: string;
  files: Record<string, T>;
}

export interface FullVersionHistory<T> {
  [key: string]: VersionRegistry<T>;
}

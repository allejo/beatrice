interface IAstManager {
  parseFile(filePath: string): void;

  walkRepository(repoDir: string, srcDirs: string[]): Promise<void>;
}

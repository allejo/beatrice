/**
 * @link https://github.com/microsoft/TypeScript/issues/10421#issuecomment-518806979
 */
export function assumeType<T>(x: unknown): asserts x is T {
  return; // ¯\_(ツ)_/¯
}

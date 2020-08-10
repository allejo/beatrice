export class AstParserError extends Error {
	constructor(public filePath: string, public astError: Error) {
		super();
	}
}

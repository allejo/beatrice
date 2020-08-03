enum LineAction {
	ADDITION,
	REPLACEMENT,
	DELETION,
}

/**
 * Queue up changes to a file's content based on the current line numbers.
 *
 * Instead of adding a new line and taking into consideration the new line numbers for subsequent changes, this class
 * will take care of that for you.
 */
export class QueueFileWriter {
	private readonly rawContent: string[];
	private actionQueue: Record<number, LineAction> = {};
	private contentQueue: Record<number, string | string[]> = {};

	constructor(content: string) {
		this.rawContent = content.split("\n");
	}

	insertLine(lineNo: number, line: string, replace: boolean = false): void {
		if (this.actionQueue[lineNo] !== undefined && !replace) {
			throw new Error(`There is already an insertion command at line ${lineNo}`);
		}

		this.actionQueue[lineNo] = LineAction.ADDITION;
		this.contentQueue[lineNo] = line;
	}

	insertLines(lineNo: number, lines: string[], replace: boolean = false): void {
		if (this.actionQueue[lineNo] !== undefined && !replace) {
			throw new Error(`There is already an insertion command at line ${lineNo}`);
		}

		this.actionQueue[lineNo] = LineAction.ADDITION;
		this.contentQueue[lineNo] = lines;
	}

	replaceLine(lineNo: number, line: string): void {}

	replaceLines(lineNo: number, lines: string[]): void {}

	removeLine(lineNo: number): void {}

	removeLines(lineNo: number, count: number): void {}

	write(): string {
		const newContent: (string | null)[] = [...this.rawContent];
		let offset = 0;

		Object.entries(this.actionQueue).forEach(([lineNo, action]: [string, LineAction]) => {
			if (action === LineAction.DELETION) {
				newContent[+lineNo] = null;
			}
		});

		Object.entries(this.actionQueue).forEach(([lineNo_, action]: [string, LineAction]) => {
			const lineNo = +lineNo_;

			if (action === LineAction.ADDITION) {
				const content = this.contentQueue[lineNo];

				if (typeof content === "string") {
					newContent.splice(offset + lineNo - 1, 0, content);
					++offset;
				} else {
					newContent.splice(offset + lineNo - 1, 0, ...content);
					offset += content.length;
				}
			} else if (action === LineAction.REPLACEMENT) {
				const content = this.contentQueue[lineNo];

				if (typeof content === "string") {
					newContent[offset + lineNo - 1] = content;
				} else {
					for (let i = 0; i < content.length; i++) {
						newContent[offset + lineNo - 1] = content[i];
					}
				}
			}
		});

		return newContent.filter(l => l !== null).join("\n");
	}
}

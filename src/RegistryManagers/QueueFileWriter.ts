enum LineAction {
	ADDITION = "addition",
	REPLACEMENT = "replacement",
	DELETION = "deletion",
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
		this.checkConflict(lineNo, replace);

		this.actionQueue[lineNo] = LineAction.ADDITION;
		this.contentQueue[lineNo] = line;
	}

	insertLines(lineNo: number, lines: string[], replace: boolean = false): void {
		this.checkConflict(lineNo, replace);

		this.actionQueue[lineNo] = LineAction.ADDITION;
		this.contentQueue[lineNo] = lines;
	}

	replaceLine(lineNo: number, line: string, replace: boolean = false): void {
		this.checkConflict(lineNo, replace);

		this.actionQueue[lineNo] = LineAction.REPLACEMENT;
		this.contentQueue[lineNo] = line;
	}

	replaceLines(lineNo: number, lines: string[], replace: boolean = false): void {
		this.checkConflict(lineNo, replace);

		this.actionQueue[lineNo] = LineAction.REPLACEMENT;
		this.contentQueue[lineNo] = lines;
	}

	removeLine(lineNo: number, replace: boolean = false): void {
		this.checkConflict(lineNo, replace);

		this.actionQueue[lineNo] = LineAction.DELETION;
	}

	removeLines(lineNo: number, count: number, replace: boolean = false): void {
		this.checkConflict(lineNo, replace);

		for (let i = 0; i <= count; i++) {
			this.actionQueue[lineNo + i] = LineAction.DELETION;
		}
	}

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

	/**
	 * Verify that there are no conflicts in actions queued for a given line number.
	 *
	 * @param lineNo
	 * @param replace
	 *
	 * @throws Error when an action is already queued for a specific line
	 */
	private checkConflict(lineNo: number, replace: boolean): void {
		const action: LineAction | undefined = this.actionQueue[lineNo];

		if (action !== undefined && !replace) {
			throw new Error(`There is already ${action} command at line ${lineNo}`);
		}
	}
}

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

	constructor(content: string, public readonly filePath: string) {
		this.rawContent = content.split("\n");
	}

	insertLineAbove(lineNo: number, line: string, replace: boolean = false): void {
		this.checkConflict(lineNo - 1, replace);

		this.actionQueue[lineNo - 1] = LineAction.ADDITION;
		this.contentQueue[lineNo - 1] = line;
	}

	insertLinesAbove(lineNo: number, lines: string[], replace: boolean = false): void {
		this.checkConflict(lineNo - 1, replace);

		this.actionQueue[lineNo - 1] = LineAction.ADDITION;
		this.contentQueue[lineNo - 1] = lines;
	}

	replaceLine(lineNo: number, line: string, replace: boolean = false): void {
		this.checkConflict(lineNo - 1, replace);

		this.actionQueue[lineNo - 1] = LineAction.REPLACEMENT;
		this.contentQueue[lineNo - 1] = line;
	}

	replaceLines(start: number, end: number, lines: string[], replace: boolean = false): void {
		this.checkConflict(start - 1, replace);
		this.actionQueue[start - 1] = LineAction.REPLACEMENT;
		this.contentQueue[start - 1] = lines;

		for (let i = start + 1; i <= end; i++) {
			this.checkConflict(i - 1, replace);
			this.actionQueue[i - 1] = LineAction.DELETION;
		}
	}

	removeLine(lineNo: number, replace: boolean = false): void {
		this.removeLines(lineNo, lineNo, replace);
	}

	removeLines(start: number, end: number, replace: boolean = false): void {
		for (let i = start; i <= end; i++) {
			this.checkConflict(i, replace);
			this.actionQueue[i - 1] = LineAction.DELETION;
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
					newContent.splice(offset + lineNo, 0, content);
					++offset;
				} else {
					newContent.splice(offset + lineNo, 0, ...content);
					offset += content.length;
				}
			} else if (action === LineAction.REPLACEMENT) {
				const content = this.contentQueue[lineNo];

				if (typeof content === "string") {
					newContent[offset + lineNo] = content;
				} else {
					newContent.splice(offset + lineNo, 1, ...content);

					offset += content.length - 1;
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

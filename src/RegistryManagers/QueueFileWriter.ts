enum LineAction {
	ADDITION = "addition",
	REPLACEMENT = "replacement",
	DELETION = "deletion",
}

/**
 * Error thrown when there is a newline detected in a forbidden context.
 */
export class NewlineNotAllowedError extends Error {}

/**
 * Error thrown when there is another action already queued for a specified line.
 */
export class QueueConflictError extends Error {
	constructor(
		public readonly message: string,
		public readonly queuedAction: LineAction,
		public readonly lineNumber: number,
	) {
		super(message);
	}
}

/**
 * Queue up changes to a file's content based on the current line numbers.
 *
 * Instead of adding a new line and taking into consideration the new line numbers for subsequent changes, this class
 * will take care of that for you. Line numbers used as arguments for this class' methods are 1-based indices.
 *
 * @since future
 */
export class QueueFileWriter {
	// The original content of the file represented as a 0-indexed array.
	private readonly content: string[];

	// Queued actions for specific line numbers of the content; a 0-indexed array.
	private actionQueue: Record<number, LineAction> = {};

	// Depending on the actions stored in `actionQueue`, this object keeps the relevant information pertaining to the
	// said actions.
	private contentQueue: Record<number, string | string[]> = {};

	/**
	 * @param content  The content of the entire file
	 * @param filePath The absolute path to the file that is object represents
	 *
	 * @since future
	 */
	constructor(content: string, public readonly filePath: string) {
		this.content = content.split("\n");
	}

	/**
	 * Insert a single line of content above the given line number.
	 *
	 * @param lineNo  A 1-based line number of where to insert text _before_
	 * @param line    The content to insert
	 * @param replace Set to true to replace an existing queued action on this line
	 *
	 * @throws NewlineNotAllowedError when `line` contains newlines
	 * @throws QueueConflictError when there is another action already queued for this line and `replace` is set to false
	 *
	 * @see insertLinesAbove to insert more than one line of content
	 * @since future
	 */
	insertLineAbove(lineNo: number, line: string, replace: boolean = false): void {
		const realLineNo = lineNo - 1;

		this.verifyNoConflict(realLineNo, replace);
		this.verifyNoNewline(line, "line");

		this.actionQueue[realLineNo] = LineAction.ADDITION;
		this.contentQueue[realLineNo] = line;
	}

	/**
	 * Insert multiple lines of content above the given line number.
	 *
	 * @param lineNo  A 1-based line number of where to insert text _before_
	 * @param lines   A batch of lines to insert
	 * @param replace Set to true to replace an existing queued action on this line
	 *
	 * @throws NewlineNotAllowedError when an element in `lines` contain newlines
	 * @throws QueueConflictError when there is another action already queued for this line and `replace` is set to false
	 *
	 * @see insertLineAbove to insert just one line of content
	 * @since future
	 */
	insertLinesAbove(lineNo: number, lines: string[], replace: boolean = false): void {
		const realLineNo = lineNo - 1;

		this.verifyNoConflict(realLineNo, replace);
		lines.forEach((line, i) => this.verifyNoNewline(line, "lines", i));

		this.actionQueue[realLineNo] = LineAction.ADDITION;
		this.contentQueue[realLineNo] = lines;
	}

	/**
	 * Replace a specified line with the given content.
	 *
	 * @param lineNo  A 1-based line number to replace
	 * @param line    The content to use as a replacement
	 * @param replace Set to true to replace an existing queued action on this line
	 *
	 * @throws NewlineNotAllowedError when `line` contains newlines
	 * @throws QueueConflictError when there is another action already queued for this line and `replace` is set to false
	 *
	 * @see replaceLines to replace more than one line of content
	 * @since future
	 */
	replaceLine(lineNo: number, line: string, replace: boolean = false): void {
		const realLineNo = lineNo - 1;

		this.verifyNoConflict(realLineNo, replace);
		this.verifyNoNewline(line, "line");

		this.actionQueue[realLineNo] = LineAction.REPLACEMENT;
		this.contentQueue[realLineNo] = line;
	}

	/**
	 * Replace a set of specified lines with the given content.
	 *
	 * The replacement content in `lines` does **NOT** need to be the same length as the range specified between `start`
	 * and `end`.
	 *
	 * @param start   A 1-based line number to start a replacement range
	 * @param end     A 1-based line number to end the replacement range (inclusive)
	 * @param lines   The new content to replace the range specifed by the range from `start` to `end`
	 * @param replace Set to true to replace an existing queued action on this line
	 *
	 * @throws NewlineNotAllowedError when an element in `lines` contains newlines
	 * @throws QueueConflictError when there is another action already queued for this any line in this range and `replace` is set
	 *   to false
	 *
	 * @see replaceLine to replace a single line of content
	 * @since future
	 */
	replaceLines(start: number, end: number, lines: string[], replace: boolean = false): void {
		const realStart = start - 1;
		const realEnd = end + 1;

		lines.forEach((line, i) => this.verifyNoNewline(line, "lines", i));

		this.verifyNoConflict(realStart, replace);
		this.actionQueue[realStart] = LineAction.REPLACEMENT;
		this.contentQueue[realStart] = lines;

		// +1 because we already queued up the first line's action as a replacement
		for (let i = start + 1; i < realEnd; i++) {
			this.verifyNoConflict(i - 1, replace);
			this.actionQueue[i - 1] = LineAction.DELETION;
		}
	}

	/**
	 * Remove the specified line.
	 *
	 * @param lineNo  A 1-based line number to remove
	 * @param replace Set to true to replace an existing queued action on this line
	 *
	 * @throws QueueConflictError when there is another action already queued for this line and `replace` is set to false
	 *
	 * @see removeLines
	 * @since future
	 */
	removeLine(lineNo: number, replace: boolean = false): void {
		this.removeLines(lineNo, lineNo, replace);
	}

	/**
	 * Remove a range of lines.
	 *
	 * @param start   A 1-based line number to start a deletion range
	 * @param end     A 1-based line number to end the deletion range (inclusive)
	 * @param replace Set to true to replace an existing queued action on this line
	 *
	 * @throws QueueConflictError when there is another action already queued for this line and `replace` is set to false
	 *
	 * @see removeLine
	 * @since future
	 */
	removeLines(start: number, end: number, replace: boolean = false): void {
		for (let i = start; i <= end; i++) {
			this.verifyNoConflict(i, replace);
			this.actionQueue[i - 1] = LineAction.DELETION;
		}
	}

	/**
	 * Run all queued actions and return the final output as a single string with newlines.
	 *
	 * @since future
	 */
	write(): string {
		const newContent: (string | null)[] = [...this.content];
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
	 * @throws QueueConflictError when there is another action already queued for a specific line
	 */
	private verifyNoConflict(lineNo: number, replace: boolean): void {
		const action: LineAction | undefined = this.actionQueue[lineNo];

		if (action !== undefined && !replace) {
			throw new QueueConflictError(
				`There is already a ${action} command queued at line ${lineNo}`,
				action,
				lineNo,
			);
		}
	}

	/**
	 * Verify that the given line does not have newlines.
	 *
	 * @param line    The content to evaluate and check for newlines in
	 * @param varName The variable name to use in the exception message
	 * @param index   The index of `line` in an array to use in the exception message
	 *
	 * @throws NewlineNotAllowedError when the given `line` variable contains new lines
	 */
	private verifyNoNewline(line: string, varName: string, index?: number): void {
		if (/[\r\n]/.exec(line)) {
			let errMsg = `Your ${varName} variable cannot contain newlines`;

			if (index) {
				errMsg += ` at index ${index}`;
			}

			throw new NewlineNotAllowedError(errMsg);
		}
	}
}

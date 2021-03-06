import XRegExp, { MatchArray } from "xregexp";

import { assumeType } from "../Utilities/TypeCasting";

interface DocBlockMatch extends MatchArray {
	indentation: string;
	singleLine: string | undefined;
	multiLine: string | undefined;
}

/**
 * @since future
 */
export class DumbJavaDocParser {
	/**
	 * This RegEx will match doc blocks written as a single line or as a block and it will save the indentation in a
	 * group.
	 */
	private readonly docBlockBodyRe = XRegExp(
		`
			^[ \\t]* # Whitespace indentation and asterisk at the beginning of the line

			# Capture single comments or multiple line
			(?:
				# Match _single_ lines with the following pattern /** ... */
				(?:\\/\\*\\*[ ]?(?<singleLine>.+?)[ ]?\\*\\/) |

				# Match any line that starts with a *, this is for lines in between /** and */ for multiline doc blocks
				(?:\\*(?!\\/)[ ]?(?<multiLine>$|(?:(?!\\*\\/).)+))
			)
		`,
		"gmx", // 'x' allows for comments and free spacing (XRegExp)
	);

	private readonly indentation: string = "";

	/**
	 * The parsed body of the docblock without the asterisks of the comment.
	 */
	public body: string[] = [];

	/**
	 * @since future
	 */
	constructor(public readonly comment: string) {
		this.indentation = XRegExp.exec(this.comment, /(?<indentation>[ \t]*)\/\*\*/)?.groups?.indentation ?? "";

		XRegExp.forEach(this.comment, this.docBlockBodyRe, (matches: MatchArray) => {
			assumeType<DocBlockMatch>(matches);

			const line = matches.multiLine ?? matches.singleLine ?? "";
			const trimmed = line.trim();

			this.body.push(trimmed.length === 0 ? trimmed : line);
		});
	}

	/**
	 * @since future
	 */
	addTag(tagName: string, value: string, position: number = -1) {
		const tagLine = `@${tagName} ${value}`;
		const hasTag = this.body.some(line => line.startsWith(tagLine));

		if (hasTag) {
			return;
		}

		if (position < 0) {
			this.body.push(tagLine);
			return;
		}

		this.body.splice(position, 0, tagLine);
	}

	/**
	 * @since future
	 */
	writeAsArray(indentation?: string): string[] {
		const indent = indentation ?? this.indentation;

		return [`${indent}/**`, ...this.body.map(line => `${indent} * ${line}`.trimRight()), `${indent} */`];
	}

	/**
	 * @since future
	 */
	write(indentation?: string): string {
		return this.writeAsArray(indentation).join(`\n`);
	}

	get AS_FIRST_TAG(): number {
		for (let i = 0; i < this.body.length; i++) {
			if (this.body[i].match(/@\w/) !== null) {
				return i;
			}
		}

		return -1;
	}
}

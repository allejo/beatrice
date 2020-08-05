// A custom type declaration for hidden types from php-parser
//   Generated from https://github.com/allejo/php-parser/tree/feature/typing-overhaul

declare module "php-parser" {
	/**
	 * Defines an array structure
	 * @example
	 * // PHP code :
	 * [1, 'foo' => 'bar', 3]
	 *
	 * // AST structure :
	 * {
	 *  "kind": "array",
	 *  "shortForm": true
	 *  "items": [
	 *    {"kind": "number", "value": "1"},
	 *    {
	 *      "kind": "entry",
	 *      "key": {"kind": "string", "value": "foo", "isDoubleQuote": false},
	 *      "value": {"kind": "string", "value": "bar", "isDoubleQuote": false}
	 *    },
	 *    {"kind": "number", "value": "3"}
	 *  ]
	 * }
	 * @property items - List of array items
	 * @property shortForm - Indicate if the short array syntax is used, ex `[]` instead `array()`
	 */
	export class Array extends Expression {
		/**
		 * List of array items
		 */
		items: Entry | Expression | Variable;
		/**
		 * Indicate if the short array syntax is used, ex `[]` instead `array()`
		 */
		shortForm: boolean;
	}

	/**
	 * Defines an arrow function (it's like a closure)
	 */
	export class ArrowFunc extends Expression {
		arguments: Parameter[];
		type: Identifier;
		body: Expression;
		byref: boolean;
		nullable: boolean;
		isStatic: boolean;
	}

	/**
	 * Assigns a value to the specified target
	 */
	export class Assign extends Expression {
		left: Expression;
		right: Expression;
		operator: string;
	}

	/**
	 * Assigns a value to the specified target
	 */
	export class AssignRef extends Expression {
		left: Expression;
		right: Expression;
		operator: string;
	}

	/**
	 * Binary operations
	 */
	export class Bin extends Operation {
		type: string;
		left: Expression;
		right: Expression;
	}

	/**
	 * A block statement, i.e., a sequence of statements surrounded by braces.
	 */
	export class Block extends Statement {
		children: Node[];
	}

	/**
	 * Defines a boolean value (true/false)
	 */
	export class Boolean extends Literal {}

	/**
	 * A break statement
	 */
	export class Break extends Statement {
		level: number | null;
	}

	/**
	 * Passing by Reference - so the function can modify the variable
	 */
	export class ByRef extends Expression {
		what: ExpressionStatement;
	}

	/**
	 * Executes a call statement
	 */
	export class Call extends Expression {
		what: Identifier | Variable;
		arguments: Variable[];
	}

	/**
	 * A switch case statement
	 * @property test - if null, means that the default case
	 */
	export class Case extends Statement {
		/**
		 * if null, means that the default case
		 */
		test: Expression | null;
		body: Block | null;
	}

	/**
	 * Binary operations
	 */
	export class Cast extends Operation {
		type: string;
		raw: string;
		expr: Expression;
	}

	/**
	 * Defines a catch statement
	 */
	export class Catch extends Statement {
		what: Identifier[];
		variable: Variable;
		body: Statement;
	}

	/**
	 * A class definition
	 */
	export class Class extends Declaration {
		extends: Identifier | null;
		implements: Identifier[];
		body: Declaration[];
		isAnonymous: boolean;
		isAbstract: boolean;
		isFinal: boolean;
	}

	/**
	 * Defines a class/interface/trait constant
	 */
	export class ClassConstant extends ConstantStatement {
		/**
		 * Generic flags parser
		 */
		parseFlags(flags: (number | null)[]): void;
		visibility: string;
	}

	/**
	 * Defines a clone call
	 */
	export class Clone extends Expression {
		what: Expression;
	}

	/**
	 * Defines a closure
	 */
	export class Closure extends Expression {
		arguments: Parameter[];
		uses: Variable[];
		type: Identifier;
		byref: boolean;
		nullable: boolean;
		body: Block | null;
		isStatic: boolean;
	}

	/**
	 * Abstract documentation node (ComentLine or CommentBlock)
	 */
	export class Comment extends Node {
		value: string;
	}

	/**
	 * A comment block (multiline)
	 */
	export class CommentBlock extends Comment {}

	/**
	 * A single line comment
	 */
	export class CommentLine extends Comment {}

	/**
	 * Defines a constant
	 */
	export class Constant extends Node {
		name: string;
		value: Node | string | number | boolean | null;
	}

	/**
	 * Declares a constants into the current scope
	 */
	export class ConstantStatement extends Statement {
		constants: Constant[];
	}

	/**
	 * A continue statement
	 */
	export class Continue extends Statement {
		level: number | null;
	}

	/**
	 * A declaration statement (function, class, interface...)
	 */
	export class Declaration extends Statement {
		/**
		 * Generic flags parser
		 */
		parseFlags(flags: (number | null)[]): void;
		name: number | string;
	}

	/**
	 * The declare construct is used to set execution directives for a block of code
	 */
	export class Declare extends Block {
		directives: any[][];
		mode: string;
	}

	/**
	 * The node is declared as a short tag syntax :
	 * ```php
	 * <?php
	 * declare(ticks=1):
	 * // some statements
	 * enddeclare;
	 * ```
	 */
	export const MODE_SHORT: string;

	/**
	 * The node is declared bracket enclosed code :
	 * ```php
	 * <?php
	 * declare(ticks=1) {
	 * // some statements
	 * }
	 * ```
	 */
	export const MODE_BLOCK: string;

	/**
	 * The node is declared as a simple statement. In order to make things simpler
	 * children of the node are automatically collected until the next
	 * declare statement.
	 * ```php
	 * <?php
	 * declare(ticks=1);
	 * // some statements
	 * declare(ticks=2);
	 * // some statements
	 * ```
	 */
	export const MODE_NONE: string;

	/**
	 * Defines a constant
	 */
	export class DeclareDirective extends Node {
		name: Identifier;
		value: Node | string | number | boolean | null;
	}

	/**
	 * Defines a do/while statement
	 */
	export class Do extends Statement {
		test: Expression;
		body: Statement;
	}

	/**
	 * Defines system based call
	 */
	export class Echo extends Statement {
		shortForm: boolean;
	}

	/**
	 * Defines an empty check call
	 */
	export class Empty extends Expression {}

	/**
	 * Defines an encapsed string (contains expressions)
	 * @property type - Defines the type of encapsed string (shell, heredoc, string)
	 * @property label - The heredoc label, defined only when the type is heredoc
	 */
	export class Encapsed extends Literal {
		/**
		 * Defines the type of encapsed string (shell, heredoc, string)
		 */
		type: string;
		/**
		 * The heredoc label, defined only when the type is heredoc
		 */
		label: string | null;
	}

	/**
	 * The node is a double quote string :
	 * ```php
	 * <?php
	 * echo "hello $world";
	 * ```
	 */
	export const TYPE_STRING: string;

	/**
	 * The node is a shell execute string :
	 * ```php
	 * <?php
	 * echo `ls -larth $path`;
	 * ```
	 */
	export const TYPE_SHELL: string;

	/**
	 * The node is a shell execute string :
	 * ```php
	 * <?php
	 * echo <<<STR
	 *  Hello $world
	 * STR
	 * ;
	 * ```
	 */
	export const TYPE_HEREDOC: string;

	/**
	 * The node contains a list of constref / variables / expr :
	 * ```php
	 * <?php
	 * echo $foo->bar_$baz;
	 * ```
	 */
	export const TYPE_OFFSET: string;

	/**
	 * Part of `Encapsed` node
	 */
	export class EncapsedPart extends Expression {
		expression: Expression;
		syntax: string;
		curly: boolean;
	}

	/**
	 * An array entry - see [Array](#array)
	 * @property key - The entry key/offset
	 * @property value - The entry value
	 * @property byRef - By reference
	 * @property unpack - Argument unpacking
	 */
	export class Entry extends Expression {
		/**
		 * The entry key/offset
		 */
		key: Node | null;
		/**
		 * The entry value
		 */
		value: Node;
		/**
		 * By reference
		 */
		byRef: boolean;
		/**
		 * Argument unpacking
		 */
		unpack: boolean;
	}

	/**
	 * Defines an error node (used only on silentMode)
	 */
	export class Error extends Node {
		message: string;
		line: number;
		token: number | string;
		expected: string | any[];
	}

	/**
	 * Defines an eval statement
	 */
	export class Eval extends Expression {
		source: Node;
	}

	/**
	 * Defines an exit / die call
	 */
	export class Exit extends Expression {
		expression: Node | null;
		useDie: boolean;
	}

	/**
	 * Any expression node. Since the left-hand side of an assignment may
	 * be any expression in general, an expression can also be a pattern.
	 */
	export class Expression extends Node {}

	/**
	 * Defines an expression based statement
	 */
	export class ExpressionStatement extends Statement {
		expression: Expression;
	}

	/**
	 * Defines a for iterator
	 */
	export class For extends Statement {
		init: Expression[];
		test: Expression[];
		increment: Expression[];
		body: Statement;
		shortForm: boolean;
	}

	/**
	 * Defines a foreach iterator
	 */
	export class Foreach extends Statement {
		source: Expression;
		key: Expression | null;
		value: Expression;
		body: Statement;
		shortForm: boolean;
	}

	/**
	 * Defines a classic function
	 */
	export class Function extends Declaration {
		arguments: Parameter[];
		type: Identifier;
		byref: boolean;
		nullable: boolean;
		body: Block | null;
	}

	/**
	 * Imports a variable from the global scope
	 */
	export class Global extends Statement {
		items: Variable[];
	}

	/**
	 * Defines goto statement
	 */
	export class Goto extends Statement {
		label: string;
	}

	/**
	 * Halts the compiler execution
	 * @property after - String after the halt statement
	 */
	export class Halt extends Statement {
		/**
		 * String after the halt statement
		 */
		after: string;
	}

	/**
	 * Defines an identifier node
	 */
	export class Identifier extends Node {
		name: string;
	}

	/**
	 * Defines a if statement
	 */
	export class If extends Statement {
		test: Expression;
		body: Block;
		alternate: Block | If | null;
		shortForm: boolean;
	}

	/**
	 * Defines system include call
	 */
	export class Include extends Expression {
		target: Node;
		once: boolean;
		require: boolean;
	}

	/**
	 * Defines inline html output (treated as echo output)
	 */
	export class Inline extends Literal {}

	/**
	 * An interface definition
	 */
	export class Interface extends Declaration {
		extends: Identifier[];
		body: Declaration[];
	}

	/**
	 * Defines an isset call
	 */
	export class Isset extends Expression {}

	/**
	 * A label statement (referenced by goto)
	 */
	export class Label extends Statement {
		name: string;
	}

	/**
	 * Defines list assignment
	 */
	export class List extends Expression {
		shortForm: boolean;
	}

	/**
	 * Defines an array structure
	 */
	export class Literal extends Expression {
		raw: string;
		value: Node | string | number | boolean | null;
	}

	/**
	 * Defines the location of the node (with it's source contents as string)
	 */
	export class Location {
		source: string | null;
		start: Position;
		end: Position;
	}

	/**
	 * Lookup on an offset in the specified object
	 */
	export class Lookup extends Expression {
		what: Expression;
		offset: Expression;
	}

	/**
	 * Defines magic constant
	 */
	export class Magic extends Literal {}

	/**
	 * Defines a class/interface/trait method
	 */
	export class Method extends Function {
		isAbstract: boolean;
		isFinal: boolean;
		isStatic: boolean;
		visibility: string;
	}

	/**
	 * Defines a class reference node
	 */
	export class Name extends Reference {
		name: string;
		resolution: string;
	}

	/**
	 * This is an identifier without a namespace separator, such as Foo
	 */
	export const UNQUALIFIED_NAME: string;

	/**
	 * This is an identifier with a namespace separator, such as Foo\Bar
	 */
	export const QUALIFIED_NAME: string;

	/**
	 * This is an identifier with a namespace separator that begins with
	 * a namespace separator, such as \Foo\Bar. The namespace \Foo is also
	 * a fully qualified name.
	 */
	export const FULL_QUALIFIED_NAME: string;

	/**
	 * This is an identifier starting with namespace, such as namespace\Foo\Bar.
	 */
	export const RELATIVE_NAME: string;

	/**
	 * The main program node
	 */
	export class Namespace extends Block {
		name: string;
		withBrackets: boolean;
	}

	/**
	 * Creates a new instance of the specified class
	 */
	export class New extends Expression {
		what: Identifier | Variable | Class;
		arguments: Variable[];
	}

	/**
	 * A generic AST node
	 */
	export class Node {
		/**
		 * Attach comments to current node
		 */
		setTrailingComments(docs: any): void;
		/**
		 * Destroying an unused node
		 */
		destroy(): void;
		/**
		 * Includes current token position of the parser
		 */
		includeToken(parser: any): void;
		/**
		 * Helper for extending the Node class
		 */
		static extends(type: string, constructor: (...params: any[]) => any): (...params: any[]) => any;
		loc: Location | null;
		leadingComments: CommentBlock[] | Comment[] | null;
		trailingComments: CommentBlock[] | Comment[] | null;
		kind: string;
	}

	/**
	 * Ignore this node, it implies a no operation block, for example :
	 * [$foo, $bar, /* here a noop node * /]
	 */
	export class Noop extends Node {}

	/**
	 * Defines a nowdoc string
	 */
	export class NowDoc extends Literal {
		label: string;
		raw: string;
	}

	/**
	 * Represents the null keyword
	 */
	export class NullKeyword extends Node {}

	/**
	 * Defines a numeric value
	 */
	export class Number extends Literal {}

	/**
	 * Lookup on an offset in an array
	 */
	export class OffsetLookup extends Lookup {}

	/**
	 * Defines binary operations
	 */
	export class Operation extends Expression {}

	/**
	 * Defines a function parameter
	 */
	export class Parameter extends Declaration {
		type: Identifier | null;
		value: Node | null;
		byref: boolean;
		variadic: boolean;
		nullable: boolean;
	}

	/**
	 * Defines a class reference node
	 */
	export class ParentReference extends Reference {}

	/**
	 * Each Position object consists of a line number (1-indexed) and a column number (0-indexed):
	 */
	export class Position {
		line: number;
		column: number;
		offset: number;
	}

	/**
	 * Defines a post operation `$i++` or `$i--`
	 */
	export class Post extends Operation {
		type: string;
		what: Variable;
	}

	/**
	 * Defines a pre operation `++$i` or `--$i`
	 */
	export class Pre extends Operation {
		type: string;
		what: Variable;
	}

	/**
	 * Outputs
	 */
	export class Print extends Expression {}

	/**
	 * The main program node
	 */
	export class Program extends Block {
		errors: Error[];
		comments: Comment[] | null;
		tokens: String[] | null;
	}

	/**
	 * Defines a class property
	 */
	export class Property extends Statement {
		name: string;
		value: Node | null;
		nullable: boolean;
		type: Identifier | Identifier[] | null;
	}

	/**
	 * Lookup to an object property
	 */
	export class PropertyLookup extends Lookup {}

	/**
	 * Declares a properties into the current scope
	 */
	export class PropertyStatement extends Statement {
		/**
		 * Generic flags parser
		 */
		parseFlags(flags: (number | null)[]): void;
		properties: Property[];
	}

	/**
	 * Defines a reference node
	 */
	export class Reference extends Node {}

	/**
	 * Defines a short if statement that returns a value
	 */
	export class RetIf extends Expression {
		test: Expression;
		trueExpr: Expression;
		falseExpr: Expression;
	}

	/**
	 * A continue statement
	 */
	export class Return extends Statement {
		expr: Expression | null;
	}

	/**
	 * Defines a class reference node
	 */
	export class SelfReference extends Reference {}

	/**
	 * Avoids to show/log warnings & notices from the inner expression
	 */
	export class Silent extends Expression {
		expr: Expression;
	}

	/**
	 * Any statement.
	 */
	export class Statement extends Node {}

	/**
	 * Declares a static variable into the current scope
	 */
	export class Static extends Statement {
		variables: StaticVariable[];
	}

	/**
	 * Lookup to a static property
	 */
	export class StaticLookup extends Lookup {}

	/**
	 * Defines a class reference node
	 */
	export class StaticReference extends Reference {}

	/**
	 * Defines a constant
	 */
	export class StaticVariable extends Node {
		variable: Variable;
		defaultValue: Node | string | number | boolean | null;
	}

	/**
	 * Defines a string (simple or double quoted) - chars are already escaped
	 */
	export class String extends Literal {
		unicode: boolean;
		isDoubleQuote: boolean;
	}

	/**
	 * Defines a switch statement
	 */
	export class Switch extends Statement {
		test: Expression;
		body: Block;
		shortForm: boolean;
	}

	/**
	 * Defines a throw statement
	 */
	export class Throw extends Statement {
		what: Expression;
	}

	/**
	 * A trait definition
	 */
	export class Trait extends Declaration {
		body: Declaration[];
	}

	/**
	 * Defines a trait alias
	 */
	export class TraitAlias extends Node {
		trait: Identifier | null;
		method: Identifier;
		as: Identifier | null;
		visibility: string | null;
	}

	/**
	 * Defines a trait alias
	 */
	export class TraitPrecedence extends Node {
		trait: Identifier | null;
		method: Identifier;
		instead: Identifier[];
	}

	/**
	 * Defines a trait usage
	 */
	export class TraitUse extends Node {
		traits: Identifier[];
		adaptations: Node[] | null;
	}

	/**
	 * Defines a try statement
	 */
	export class Try extends Statement {
		body: Block;
		catches: Catch[];
		allways: Block;
	}

	/**
	 * Defines a class reference node
	 */
	export class TypeReference extends Reference {
		name: string;
	}

	/**
	 * Unary operations
	 */
	export class Unary extends Operation {
		type: string;
		what: Expression;
	}

	/**
	 * Deletes references to a list of variables
	 */
	export class Unset extends Statement {}

	/**
	 * Defines a use statement (with a list of use items)
	 * @property type - Possible value : function, const
	 */
	export class UseGroup extends Statement {
		name: string | null;
		/**
		 * Possible value : function, const
		 */
		type: string | null;
		item: UseItem[];
	}

	/**
	 * Defines a use statement (from namespace)
	 * @property type - Possible value : function, const
	 */
	export class UseItem extends Statement {
		name: string;
		/**
		 * Possible value : function, const
		 */
		type: string | null;
		alias: Identifier | null;
	}

	/**
	 * Importing a constant
	 */
	export const TYPE_CONST: string;

	/**
	 * Importing a function
	 */
	export const TYPE_FUNC: string;

	/**
	 * Any expression node. Since the left-hand side of an assignment may
	 * be any expression in general, an expression can also be a pattern.
	 * @example
	 * // PHP code :
	 * $foo
	 * // AST output
	 * {
	 *  "kind": "variable",
	 *  "name": "foo",
	 *  "curly": false
	 * }
	 * @property name - The variable name (can be a complex expression when the name is resolved dynamically)
	 * @property curly - Indicate if the name is defined between curlies, ex `${foo}`
	 */
	export class Variable extends Expression {
		/**
		 * The variable name (can be a complex expression when the name is resolved dynamically)
		 */
		name: string | Node;
		/**
		 * Indicate if the name is defined between curlies, ex `${foo}`
		 */
		curly: boolean;
	}

	/**
	 * Introduce a list of items into the arguments of the call
	 */
	export class variadic extends Expression {
		what: any[] | Expression;
	}

	/**
	 * Defines a while statement
	 */
	export class While extends Statement {
		test: Expression;
		body: Statement;
		shortForm: boolean;
	}

	/**
	 * Defines a yield generator statement
	 */
	export class Yield extends Expression {
		value: Expression | null;
		key: Expression | null;
	}

	/**
	 * Defines a yield from generator statement
	 */
	export class YieldFrom extends Expression {
		value: Expression;
	}

	/**
	 * The AST builder class
	 * @property withPositions - Should locate any node (by default false)
	 * @property withSource - Should extract the node original code (by default false)
	 */
	export class AST {
		/**
		 * Change parent node informations after swapping childs
		 */
		swapLocations(): void;
		/**
		 * Includes locations from first & last into the target
		 */
		resolveLocations(): void;
		/**
		 * Check and fix precence, by default using right
		 */
		resolvePrecedence(): void;
		/**
		 * Prepares an AST node
		 * @param kind - Defines the node type
		 * (if null, the kind must be passed at the function call)
		 * @param parser - The parser instance (use for extracting locations)
		 */
		prepare(kind: string | null, parser: Parser): (...params: any[]) => any;
		/**
		 * Should locate any node (by default false)
		 */
		withPositions: boolean;
		/**
		 * Should extract the node original code (by default false)
		 */
		withSource: boolean;
	}

	/**
	 * Initialise a new parser instance with the specified options
	 * @example
	 * var parser = require('php-parser');
	 * var instance = new parser({
	 *   parser: {
	 *     extractDoc: true,
	 *     suppressErrors: true,
	 *     version: 704 // or '7.4'
	 *   },
	 *   ast: {
	 *     withPositions: true
	 *   },
	 *   lexer: {
	 *     short_tags: true,
	 *     asp_tags: true
	 *   }
	 * });
	 *
	 * var evalAST = instance.parseEval('some php code');
	 * var codeAST = instance.parseCode('<?php some php code', 'foo.php');
	 * var tokens = instance.tokenGetAll('<?php some php code');
	 * @param options - List of options
	 */
	export class Engine {
		constructor(options: any);
		/**
		 * Parse an evaluating mode string (no need to open php tags)
		 */
		parseEval(buffer: string): Program;
		/**
		 * Function that parse a php code with open/close tags
		 *
		 * Sample code :
		 * ```php
		 * <?php $x = 1;
		 * ```
		 *
		 * Usage :
		 * ```js
		 * var parser = require('php-parser');
		 * var phpParser = new parser({
		 *   // some options
		 * });
		 * var ast = phpParser.parseCode('...php code...', 'foo.php');
		 * ```
		 * @param buffer - The code to be parsed
		 * @param filename - Filename
		 */
		parseCode(buffer: string, filename: string): Program;
		/**
		 * Extract tokens from the specified buffer.
		 * > Note that the output tokens are *STRICLY* similar to PHP function `token_get_all`
		 * @returns - Each item can be a string or an array with following informations [token_name, text, line_number]
		 */
		tokenGetAll(buffer: string): String[];
		lexer: Lexer;
		parser: Parser;
		ast: AST;
		tokens: any;
	}

	/**
	 * Check if the inpyt is a buffer or a string
	 * @param buffer - Input value that can be either a buffer or a string
	 * @returns Returns the string from input
	 */
	export function getStringBuffer(buffer: Buffer | string): string;

	/**
	 * This is the php lexer. It will tokenize the string for helping the
	 * parser to build the AST from its grammar.
	 * @property all_tokens - defines if all tokens must be retrieved (used by token_get_all only)
	 * @property comment_tokens - extracts comments tokens
	 * @property mode_eval - enables the evald mode (ignore opening tags)
	 * @property asp_tags - disables by default asp tags mode
	 * @property short_tags - enables by default short tags mode
	 * @property keywords - List of php keyword
	 * @property castKeywords - List of php keywords for type casting
	 */
	export class Lexer {
		/**
		 * Initialize the lexer with the specified input
		 */
		setInput(): void;
		/**
		 * consumes and returns one char from the input
		 */
		input(): void;
		/**
		 * revert eating specified size
		 */
		unput(): void;
		/**
		 * check if the text matches
		 */
		tryMatch(text: string): boolean;
		/**
		 * check if the text matches
		 */
		tryMatchCaseless(text: string): boolean;
		/**
		 * look ahead
		 */
		ahead(size: number): string;
		/**
		 * consume the specified size
		 */
		consume(size: number): Lexer;
		/**
		 * Gets the current state
		 */
		getState(): void;
		/**
		 * Sets the current lexer state
		 */
		setState(): void;
		/**
		 * prepend next token
		 */
		appendToken(value: any, ahead: any): Lexer;
		/**
		 * return next match that has a token
		 */
		lex(): number | string;
		/**
		 * activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
		 */
		begin(condition: any): Lexer;
		/**
		 * pop the previously active lexer condition state off the condition stack
		 */
		popState(): T | string | any;
		/**
		 * return next match in input
		 */
		next(): number | any;
		EOF: number;
		/**
		 * defines if all tokens must be retrieved (used by token_get_all only)
		 */
		all_tokens: boolean;
		/**
		 * extracts comments tokens
		 */
		comment_tokens: boolean;
		/**
		 * enables the evald mode (ignore opening tags)
		 */
		mode_eval: boolean;
		/**
		 * disables by default asp tags mode
		 */
		asp_tags: boolean;
		/**
		 * enables by default short tags mode
		 */
		short_tags: boolean;
		/**
		 * List of php keyword
		 */
		keywords: any;
		/**
		 * List of php keywords for type casting
		 */
		castKeywords: any;
	}

	/**
	 * reset to true after a new line
	 */
	export var inCoutingState: boolean;

	/**
	 * The PHP Parser class that build the AST tree from the lexer
	 * @property lexer - current lexer instance
	 * @property ast - the AST factory instance
	 * @property token - current token
	 * @property extractDoc - should extract documentation as AST node
	 * @property extractTokens - should extract each token
	 * @property suppressErrors - should ignore parsing errors and continue
	 * @property debug - should output debug informations
	 */
	export class Parser {
		/**
		 * helper : gets a token name
		 */
		getTokenName(): void;
		/**
		 * main entry point : converts a source code to AST
		 */
		parse(): void;
		/**
		 * Raise an error
		 */
		raiseError(): void;
		/**
		 * handling errors
		 */
		error(): void;
		/**
		 * Creates a new AST node
		 */
		node(): void;
		/**
		 * expects an end of statement or end of file
		 */
		expectEndOfStatement(): boolean;
		/**
		 * Force the parser to check the current token.
		 *
		 * If the current token does not match to expected token,
		 * the an error will be raised.
		 *
		 * If the suppressError mode is activated, then the error will
		 * be added to the program error stack and this function will return `false`.
		 */
		expect(token: string | number): boolean;
		/**
		 * Returns the current token contents
		 */
		text(): string;
		/**
		 * consume the next token
		 */
		next(): void;
		/**
		 * Eating a token
		 */
		lex(): void;
		/**
		 * Check if token is of specified type
		 */
		is(): void;
		/**
		 * current lexer instance
		 */
		lexer: Lexer;
		/**
		 * the AST factory instance
		 */
		ast: AST;
		/**
		 * current token
		 */
		token: number | string;
		/**
		 * should extract documentation as AST node
		 */
		extractDoc: boolean;
		/**
		 * should extract each token
		 */
		extractTokens: boolean;
		/**
		 * should ignore parsing errors and continue
		 */
		suppressErrors: boolean;
		/**
		 * should output debug informations
		 */
		debug: boolean;
	}

	/**
	 * outputs some debug information on current token
	 */
	export const ignoreStack: any;
}

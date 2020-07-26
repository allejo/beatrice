// A custom type declaration for hidden types from php-parser

declare module "php-parser" {
  export interface PHPNode extends Node {}

  export interface PHPIdentifier extends Node {
    name: string;
  }

  export interface PHPStatement extends PHPNode {}

  export interface PHPDeclaration extends PHPStatement {
    name: PHPIdentifier | string;
    isAbstract: boolean;
    isFinal: boolean;
    visibility?: string;
    isStatic?: boolean;
  }

  export interface PHPBlock extends PHPStatement {
    children: PHPNode[];
  }

  export interface PHPParameter extends PHPDeclaration {
    value: PHPNode | null;
    type: PHPIdentifier | null;
    byref: boolean;
    variadic: boolean;
    nullable: boolean;
  }

  export interface PHPProgram extends Program {}

  export interface PHPNamespace extends Block {
    name: string;
    withBrackets: boolean;
  }

  export interface PHPClass extends PHPDeclaration {
    isAnonymous: boolean;
    extends: PHPIdentifier | null;
    implements: PHPIdentifier[];
    body: PHPDeclaration[];
  }

  export interface PHPFunction extends PHPDeclaration {
    arguments: Array<PHPParameter>;
    byref: boolean;
    type: PHPIdentifier;
    nullable: boolean;
    block: PHPBlock | null;
  }
}

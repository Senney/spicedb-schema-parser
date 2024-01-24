import { Token } from './lexer';

class Statement {}
class Expression {}

class DefinitionStatement extends Statement {
  constructor(
    public resourceName: string,
    public block: BlockStatement,
  ) {
    super();
  }
}

class BlockStatement extends Statement {
  constructor(public statements: Statement[]) {
    super();
  }
}

class RelationStatement extends Statement {
  constructor(
    public relationName: string,
    public relationDefinition: RelationDefinitionExpression,
  ) {
    super();
  }
}

class PermissionStatement extends Statement {
  constructor(
    public permissionName: string,
    public permissionDefinition: PermissionDefinitionExpression,
  ) {
    super();
  }
}

class RelationDefinitionExpression extends Expression {
  constructor() {
    super();
  }
}

class PermissionDefinitionExpression extends Expression {
  constructor() {
    super();
  }
}

class BinaryExpression extends Expression {
  constructor(
    public lhs: Expression,
    public operator: Token,
    public rhs: Expression,
  ) {
    super();
  }
}

class GroupingExpression extends Expression {
  constructor(public expression: Expression) {
    super();
  }
}

export {
  BinaryExpression,
  BlockStatement,
  DefinitionStatement,
  Expression,
  GroupingExpression,
  PermissionDefinitionExpression,
  PermissionStatement,
  RelationDefinitionExpression,
  RelationStatement,
  Statement,
}

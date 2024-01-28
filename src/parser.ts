import {
  BinaryExpression,
  BlockStatement,
  DefinitionStatement,
  Expression,
  IdentifierExpression,
  MembershipIdentifierExpression,
  PermissionDefinitionExpression,
  PermissionStatement,
  RelationDefinitionExpression,
  RelationStatement,
  Statement,
} from './ast';
import { SyntaxError } from './error';
import { Token, TokenType } from './lexer';

class SpiceDBSchemaParser {
  private current = 0;

  constructor(private tokens: Token[]) {}

  public parse(): Statement[] {
    this.current = 0;

    const statements: Statement[] = [];

    while (this.current < this.tokens.length) {
      statements.push(this.definitionStatement());
    }

    return statements;
  }

  private definitionStatement(): Statement {
    this.consume(TokenType.DEFINITION, 'definition');
    const resourceName = this.consume(TokenType.IDENTIFIER, 'identifier');

    return new DefinitionStatement(resourceName.lexeme, this.blockStatement());
  }

  private blockStatement(): BlockStatement {
    this.consume(TokenType.LEFT_BRACE, '{');

    const statements: Statement[] = [];

    while (!this.check(TokenType.RIGHT_BRACE)) {
      statements.push(this.relationStatement());
    }

    this.consume(TokenType.RIGHT_BRACE, '}');

    return new BlockStatement(statements);
  }

  private relationStatement(): Statement {
    if (!this.check(TokenType.RELATION)) {
      return this.permissionStatement();
    }

    this.consume(TokenType.RELATION, 'relation');
    const identifierToken = this.consume(TokenType.IDENTIFIER, 'identifier');
    this.consume(TokenType.COLON, ':');

    return new RelationStatement(
      identifierToken.lexeme,
      new RelationDefinitionExpression(this.relationDefinitionExpression()),
    );
  }

  private permissionStatement(): Statement {
    this.consume(TokenType.PERMISSION, 'permission');

    return new PermissionStatement(
      this.consume(TokenType.IDENTIFIER, 'identifier').lexeme,
      new PermissionDefinitionExpression(),
    );
  }

  private relationDefinitionExpression(): Expression {
    return this.relationOr();
  }

  private relationOr(): Expression {
    const lhs = this.relationIdentifier();

    if (this.match(TokenType.OR)) {
      const operator = this.previous();
      const rhs = this.relationDefinitionExpression();

      return new BinaryExpression(lhs, operator, rhs);
    }

    return lhs;
  }

  private relationIdentifier(): Expression {
    const symbol = this.consume(TokenType.IDENTIFIER, 'identifier');

    if (this.match(TokenType.MEMBER)) {
      const membership = this.consume(TokenType.IDENTIFIER, 'identifier');

      return new MembershipIdentifierExpression(symbol, membership);
    }

    return new IdentifierExpression(symbol);
  }

  private match(...tokenTypes: TokenType[]): boolean {
    for (const tokenType of tokenTypes) {
      if (this.check(tokenType)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private consume(tokenType: TokenType, expected: string): Token {
    if (!this.check(tokenType)) {
      throw new SyntaxError(
        this.peek().line,
        this.peek().col,
        `Expected "${expected}", received "${this.peek().lexeme}"`,
      );
    }

    return this.advance();
  }

  private check(tokenType: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().token === tokenType;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd() {
    return this.peek().token === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}

export { SpiceDBSchemaParser };

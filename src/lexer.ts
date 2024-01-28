/**
 * Note: Caveats will be implemented later.
 */

import { LexerError } from './error';

export enum TokenType {
  IDENTIFIER,
  DEFINITION,
  RELATION,
  PERMISSION,

  ASSIGN, // =
  EQUAL, // ==
  UNION, // +
  INTERSECTION, // &
  EXCLUDE, // -
  OR, // |
  ARROW, // ->
  MEMBER, // #

  COLON, // :
  LEFT_BRACE, // {
  RIGHT_BRACE, // }
  LEFT_PAREN, // (
  RIGHT_PAREN, // )

  EOF,
}

const spiceDBKeywordLexemes: Record<string, TokenType> = {
  definition: TokenType.DEFINITION,
  relation: TokenType.RELATION,
  permission: TokenType.PERMISSION,
};

export class Token {
  constructor(
    public readonly token: TokenType,
    public readonly lexeme: string,
    public readonly literal: string | null,
    public readonly line: number,
    public readonly col: number,
  ) {}
}

const validIdentifierChars = /[a-z\_][a-z\_\/]*/;

class SpiceDBSchemaLexer {
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(private readonly source: string) {}

  public scan(): Token {
    if (this.isAtEnd()) {
      return new Token(TokenType.EOF, '', null, this.line, this.current);
    }

    const c = this.advance();

    switch (c) {
      case '{':
        return this.emit(this.syntaxToken(TokenType.LEFT_BRACE));
      case '}':
        return this.emit(this.syntaxToken(TokenType.RIGHT_BRACE));
      case '(':
        return this.emit(this.syntaxToken(TokenType.LEFT_PAREN));
      case ')':
        return this.emit(this.syntaxToken(TokenType.RIGHT_PAREN));
      case ':':
        return this.emit(this.syntaxToken(TokenType.COLON));
      case '=':
        if (this.match('=')) {
          return this.emit(this.syntaxToken(TokenType.EQUAL));
        }

        return this.emit(this.syntaxToken(TokenType.ASSIGN));
      case '+':
        return this.emit(this.syntaxToken(TokenType.UNION));
      case '&':
        return this.emit(this.syntaxToken(TokenType.INTERSECTION));
      case '|':
        return this.emit(this.syntaxToken(TokenType.OR));
      case '-':
        if (this.match('>')) {
          return this.emit(this.syntaxToken(TokenType.ARROW));
        }

        return this.emit(this.syntaxToken(TokenType.EXCLUDE));
      case '#':
        return this.emit(this.syntaxToken(TokenType.MEMBER));
      case ' ':
      case '\r':
      case '\t':
        return this.dive();
      case '\n':
        this.line++;
        return this.dive();
      case '/':
        if (this.match('*')) {
          while (
            !(this.advance() === '*' && this.peek() === '/') &&
            !this.isAtEnd()
          ) {
            let a = this.peek();
          }
          this.advance();
          return this.dive();
        }

        if (this.match('/')) {
          while (this.advance() !== '\n' && !this.isAtEnd()) {}
          return this.dive();
        }
      default:
        if (validIdentifierChars.test(c)) {
          return this.emit(this.identifier());
        }
    }

    throw new LexerError(this.line, this.start, `Unrecognized token "${c}".`);
  }

  public scanAll(): Token[] {
    const tokens = [];
    for (
      let token = this.scan();
      token.token !== TokenType.EOF;
      token = this.scan()
    ) {
      tokens.push(token);
    }
    return tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private peek(): string {
    return this.source.charAt(this.current);
  }

  private match(c: string): boolean {
    if (this.peek() === c) {
      this.advance();

      return true;
    }

    return false;
  }

  private identifier(): Token {
    while (validIdentifierChars.test(this.peek())) {
      this.advance();
    }

    const value = this.source.slice(this.start, this.current);
    const tokenType = spiceDBKeywordLexemes[value] ?? TokenType.IDENTIFIER;

    return new Token(tokenType, value, value, this.line, this.current);
  }

  private emit(token: Token): Token {
    this.start = this.current;

    return token;
  }

  private dive(): Token {
    this.start = this.current;

    return this.scan();
  }

  private syntaxToken(type: TokenType): Token {
    return new Token(
      type,
      this.source.slice(this.start, this.current),
      null,
      this.line,
      this.current,
    );
  }
}

export { SpiceDBSchemaLexer };

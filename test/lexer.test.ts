import { SpiceDBSchemaLexer, Token, TokenType } from '../src/lexer';

describe('SpiceDBSchemaLexer', () => {
  test('should return tokens for a simple schema', () => {
    const schema = `
    /** user represents a user */
    definition user {}
    
    /** group represents a group **/
    definition group {
        /** member is a member of a group, which can be a user or the membership of another group */
        relation member: user | group#member
    }
    
    /** document represents a document */
    definition document {
        /** writer is a writer of the document */
        relation writer: user | group#member
    
        /** reader is a reader of the document */
        relation reader: user | group#member
    
        /** write indicates which user can write to the document */
        permission write = writer
    
        /** read indicates which user can read the document */
        permission read = reader + write

        permission nested = reader->foo & (write + read)
    }
    `;

    const lexer = new SpiceDBSchemaLexer(schema);
    const tokens: Token[] = [];

    for (let token = lexer.scan(); token.token !== TokenType.EOF; token = lexer.scan()) {
      tokens.push(token);
    }

    expect(tokens).toMatchSnapshot();
  });

  test('comment parsing', () => {
    const schema = `
    // Single line comment
    /* Normal block comment */
    /** Semantic 
      * multiline
      */
    /* Block * comment with ** lots of asterisks **/
    `;

    const lexer = new SpiceDBSchemaLexer(schema);
    expect(lexer.scan().token).toEqual(TokenType.EOF);
  });
});

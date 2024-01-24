import { SpiceDBSchemaLexer } from '../src/lexer';
import { SpiceDBSchemaParser } from '../src/parser';

describe('SpiceDBSchemaParser', () => {
  describe('parse', () => {
    const schema = `
    /** user represents a user */
    definition user {}

    definition document {
      relation foo:
    }
    `;

    test('should match snapshot', () => {
      const tokens = new SpiceDBSchemaLexer(schema).scanAll();

      expect(new SpiceDBSchemaParser(tokens).parse()).toMatchSnapshot();
    });
  });
});

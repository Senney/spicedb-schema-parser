import { SpiceDBSchemaLexer } from '../src/lexer';
import { SpiceDBSchemaParser } from '../src/parser';

describe('SpiceDBSchemaParser', () => {
  describe('parse', () => {
    const schema = `
    /** user represents a user */
    definition user {}

    definition group {
      relation member: user
    }

    definition document {
      relation foo: user | group#member
    }
    `;

    test('should match snapshot', () => {
      const tokens = new SpiceDBSchemaLexer(schema).scanAll();

      expect(new SpiceDBSchemaParser(tokens).parse()).toMatchSnapshot();
    });
  });
});

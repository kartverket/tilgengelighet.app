import { SosiSchema } from '../schema';
import { getSchema } from '../schema_impl';

describe('SOSI', function() {
  describe('SOSI Schema', function() {

    let schema: SosiSchema;

    beforeAll(function() {
      schema = getSchema();
    });

    // Create schema object
    // Get object type -

    it('TettstedInngangBygg is correct', function() {
      const name = 'TettstedInngangBygg';

      expect(schema.objectTypeNames).toContain(name);
      const objectType = schema.getObjectTypeByName(name);


      // expect(objectType.documentation).

    });


  });
});

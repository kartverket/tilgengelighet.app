import { SosiObjectType, SosiSchema } from './schema';
import schemaFile from './schema.json';
import { keyBy } from 'lodash';
import { XsdSchema } from './xsd';
import { parseJsonXsdFile } from './xsd_impl';

let schema: SosiSchema;

export function getSchema(): SosiSchema {
  if (schema === undefined) {
    // @ts-ignore
    schema = parseSchema(parseJsonXsdFile(schemaFile));
  }

  return schema;
}

function parseSchema(xsdFile: XsdSchema): SosiSchema {
  return new SosiSchemaImpl(xsdFile);
}

class SosiSchemaImpl implements SosiSchema {
  readonly objectTypeNames: ReadonlyArray<string>;
  readonly objectTypes: ReadonlyArray<SosiObjectType>;
  private readonly objectTypeMap: { readonly [name: string]: SosiObjectType };

  constructor(xsdSchema: XsdSchema) {
    this.objectTypes = xsdSchema.element;
    this.objectTypeNames = this.objectTypes.map(o => o.name);
    this.objectTypeMap = keyBy(this.objectTypes, o => o.name.toLowerCase());
  }

  getObjectTypeByName(name: string): SosiObjectType | null {
    return this.objectTypeMap[name.toLowerCase()] || null;
  }
}

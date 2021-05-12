import {
  JsonXsdComplexType,
  JsonXsdComplexTypeElement,
  JsonXsdElement,
  JsonXsdFile,
  JsonXsdSimpleType,
} from './xsd_json';
import {
  XsdAnnotation,
  XsdComplexType,
  XsdComplexTypeElement,
  XsdElement,
  XsdPrimitiveType,
  XsdRestriction,
  XsdSchema,
  XsdSimpleType,
} from './xsd';
import { find, keyBy } from 'lodash';
import { GmlSupportedTypes } from './gml';
import { SosiObject } from './sosi';
import {
  defaultObjectTypeConfiguration,
  ElementExtension,
  objectTypeConfiguration,
  ObjectTypeConfiguration,
} from './form_config';

function trimReference(type: string) {
  if (type.startsWith('app:')) return type.substr(4);

  if (type.startsWith('xs:')) return type.substr(3);

  return type;
}

class XsdSchemaImpl implements XsdSchema {
  readonly file: JsonXsdFile;

  readonly simpleTypeMap: { [name: string]: XsdSimpleTypeImpl };
  readonly complexTypeMap: { [name: string]: XsdComplexTypeImpl };
  readonly elementMap: { [name: string]: XsdElementImpl };

  readonly annotation: XsdAnnotation;
  readonly complexType: ReadonlyArray<XsdComplexType>;
  readonly element: ReadonlyArray<XsdElement>;
  readonly simpleType: ReadonlyArray<XsdSimpleTypeImpl>;

  constructor(file: JsonXsdFile) {
    this.file = file;
    this.annotation = file.schema.annotation;

    this.simpleType = file.schema.simpleType.map(
      type => new XsdSimpleTypeImpl(this, type),
    );
    this.simpleTypeMap = keyBy(this.simpleType, 'name');
    this.complexType = file.schema.complexType.map(
      element => new XsdComplexTypeImpl(this, element),
    );
    this.complexTypeMap = keyBy(this.complexType, 'name') as {
      [name: string]: XsdComplexTypeImpl;
    };
    this.element = file.schema.element.map(
      element => new XsdElementImpl(this, element),
    );
    this.elementMap = keyBy(this.element, 'name') as {
      [name: string]: XsdElementImpl;
    };
  }

  resolveType(
    type: string,
  ):
    | XsdSimpleTypeImpl
    | XsdComplexTypeImpl
    | XsdPrimitiveType
    | GmlSupportedTypes
    | XsdElementImpl {
    type = trimReference(type);

    // TODO: Must be able to resolve gml:

    if (Object.values(XsdPrimitiveType).includes(type as XsdPrimitiveType)) {
      return type as XsdPrimitiveType;
    }

    if (Object.values(GmlSupportedTypes).includes(type as GmlSupportedTypes)) {
      return type as GmlSupportedTypes;
    }

    const simpleType = this.simpleTypeMap[type];
    if (simpleType) return simpleType;

    const complexType = this.complexTypeMap && this.complexTypeMap[type];
    if (complexType) return complexType;

    const element = this.elementMap && this.elementMap[type];
    if (element) return element;

    // throw 'Could not resolve type: ' + type;
    return type as GmlSupportedTypes;
  }
}

class XsdComplexTypeImpl implements XsdComplexType {
  readonly sequence: { element: ReadonlyArray<XsdComplexTypeElement> };
  readonly annotation: XsdAnnotation;
  readonly name: string;

  constructor(schema: XsdSchemaImpl, json: JsonXsdComplexType) {
    const element = (
      json.complexContent?.extension.sequence || json.sequence
    )?.element.map(
      element => new XsdComplexTypeElementImpl(schema, element, this),
    );

    this.sequence = { element: element || [] };
    this.annotation = json.annotation;
    this.name = json._name;
  }

  get configuration(): ObjectTypeConfiguration {
    return objectTypeConfiguration[this.name] || defaultObjectTypeConfiguration;
  }
}

class XsdComplexTypeElementImpl implements XsdComplexTypeElement {
  private readonly schema: XsdSchemaImpl;
  private readonly json: JsonXsdComplexTypeElement;
  private readonly complexType: XsdComplexTypeImpl;

  readonly annotation!: XsdAnnotation;
  readonly minOccurs: number;
  readonly name: string;

  constructor(
    schema: XsdSchemaImpl,
    json: JsonXsdComplexTypeElement,
    complexType: XsdComplexTypeImpl,
  ) {
    this.schema = schema;
    this.json = json;
    this.complexType = complexType;

    if (json.annotation !== undefined) this.annotation = json.annotation;
    this.name = json._name;
    this.minOccurs = parseInt(json._minOccurs || '1');
  }
  unit!: string;
  substitutionGroup?: XsdElement | undefined;
  elements!: readonly XsdComplexTypeElement[];
  getElement(name: string): XsdComplexTypeElement | undefined {
    throw new Error('Method not implemented.');
  }
  formConfiguration!: ObjectTypeConfiguration;
  hasMunicipalityFields!: boolean;
  hasImageFields!: boolean;
  hasStairFields!: boolean;
  hasRampFields!: boolean;

  get type():
    | XsdSimpleType
    | XsdComplexType
    | XsdPrimitiveType
    | GmlSupportedTypes {
    return this.schema.resolveType(this.json._type) as
      | XsdSimpleType
      | XsdComplexType
      | XsdPrimitiveType
      | GmlSupportedTypes;
  }

  get displayName(): string {
    const text = this.name;
    const result = text.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  get sosiName(): string {
    const taggedValue = this.json.annotation?.appinfo?.taggedValue;

    if (taggedValue) {
      for (let tag of taggedValue) {
        if (tag._tag === 'SOSI_navn') {
          return tag.__text;
        }
      }
    }

    return '';

    // throw 'No sosi name for complextype';
  }

  get formGroup(): string {
    if (this.name.startsWith('tilgjengvurdering')) {
      return 'Tilgjengelighetsvurdering';
    }

    const formGroup = find(
      this.complexType.configuration.formGroups,
      formGroup => formGroup.fields.includes(this.name),
    );
    if (formGroup) return formGroup.name;

    return 'Objekt';
  }

  get configuration(): ElementExtension {
    return this.complexType.configuration.elementExtension?.[this.name] || {};
  }

  visible(object: SosiObject): boolean {
    const configuration = this.configuration;

    if (configuration.visible) return configuration.visible(object);

    return true;
  }
}

class XsdSimpleTypeImpl implements XsdSimpleType {
  readonly schema: XsdSchemaImpl;
  readonly json: JsonXsdSimpleType;

  readonly annotation: XsdAnnotation;
  readonly name: string;
  readonly restriction: XsdRestriction;

  constructor(schema: XsdSchemaImpl, json: JsonXsdSimpleType) {
    this.schema = schema;
    this.json = json;

    this.name = json._name;
    this.annotation = json.annotation;

    const pattern = json.restriction?.pattern;

    this.restriction = {
      enumeration: json.restriction?.enumeration?.map(e => ({
        annotation: e.annotation,
        value: e._value,
      })),
      base: json.restriction?._base as XsdPrimitiveType,
      pattern: pattern ? { value: pattern._value } : undefined,
    };
  }

  get unionMemberTypes(): ReadonlyArray<XsdSimpleType> | undefined {
    const memberTypes = this.json.union?._memberTypes?.split(' ');

    if (memberTypes) {
      return memberTypes.map(t => this.schema.resolveType(t) as XsdSimpleType);
    }

    return undefined;
  }
}

class XsdElementImpl implements XsdElement {
  readonly formConfiguration: ObjectTypeConfiguration;
  readonly schema: XsdSchemaImpl;
  readonly json: JsonXsdElement;

  readonly annotation: XsdAnnotation;
  readonly name: string;
  readonly type: XsdComplexTypeImpl;

  _substitutionGroup: XsdElementImpl | undefined | false = false;

  constructor(schema: XsdSchemaImpl, json: JsonXsdElement) {
    this.schema = schema;
    this.json = json;

    this.annotation = json.annotation;
    this.name = json._name;
    this.type = schema.resolveType(json._type) as XsdComplexTypeImpl;
    this.formConfiguration = this.type.configuration;
  }

  get substitutionGroup(): XsdElementImpl | undefined {
    if (this._substitutionGroup === false) {
      const substitutionGroup = this.json._substitutionGroup;
      this._substitutionGroup = substitutionGroup
        ? (this.schema.resolveType(substitutionGroup) as XsdElementImpl)
        : undefined;
    }

    return this._substitutionGroup as XsdElementImpl | undefined;
  }

  readonly formGroup: string = 'Noe';

  visible(object: SosiObject): boolean {
    return true;
  }

  get elements(): ReadonlyArray<XsdComplexTypeElement> {
    return [
      ...(this.substitutionGroup?.elements || []),
      ...this.type.sequence.element,
    ];
  }

  get hasImageFields(): boolean {
    return (
      find(this.elements, e => e.name.startsWith('bildefil')) !== undefined
    );
  }

  get hasMunicipalityFields(): boolean {
    return find(this.elements, e => e.name.startsWith('komm')) !== undefined;
  }

  get hasStairFields(): boolean {
    return find(this.elements, e => e.name.startsWith('trapp')) !== undefined;
  }

  get hasRampFields(): boolean {
    return find(this.elements, e => e.name.startsWith('rampe')) !== undefined;
  }

  getElement(name: string): XsdComplexTypeElement | undefined {
    return find(this.elements, e => e.name === name);
  }
}

export function parseJsonXsdFile(file: JsonXsdFile): XsdSchema {
  return new XsdSchemaImpl(file);
}

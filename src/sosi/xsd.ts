import { SosiObject } from './sosi';
import { GmlSupportedTypes } from './gml';
import { ObjectTypeConfiguration } from './form_config';

// TODO: Merge XSD and Sosi

export interface XsdSchema {
  readonly annotation: XsdAnnotation;
  readonly element: ReadonlyArray<XsdElement>;
  readonly simpleType: ReadonlyArray<XsdSimpleType>;
  readonly complexType: ReadonlyArray<XsdComplexType>;
}

// TODO: Not export XsdElement. Instead export SosiObjectType, and SosiObjectField etc.
export interface XsdElement {
  readonly annotation: XsdAnnotation;
  readonly name: string;
  readonly type:
    | XsdSimpleType
    | XsdComplexType
    | XsdPrimitiveType
    | GmlSupportedTypes;
  readonly substitutionGroup?: XsdElement;

  readonly elements: ReadonlyArray<XsdComplexTypeElement>;

  getElement(name: string): XsdComplexTypeElement | undefined;

  readonly formConfiguration: ObjectTypeConfiguration;
  readonly hasMunicipalityFields: boolean;
  readonly hasImageFields: boolean;
  readonly hasStairFields: boolean;
  readonly hasRampFields: boolean;
}

export interface XsdComplexType {
  readonly name: string;
  readonly annotation?: XsdAnnotation;
  readonly sequence: { element: ReadonlyArray<XsdComplexTypeElement> };
}

export interface XsdComplexTypeElement extends XsdElement {
  readonly minOccurs: number;

  readonly displayName: string;
  readonly sosiName: string;

  // This is the unit of the value
  // For example: cm, degrees, km
  readonly unit: string;

  // This is what Paper the field should be in.
  // Examples: Pågår det bygging?, Finnes det rampe?
  readonly formGroup: string;

  // Should the field be visible
  visible(object: SosiObject): boolean;
}

interface XsdPattern {
  // Regex
  readonly value: string;
}

export interface XsdRestriction {
  readonly enumeration?: ReadonlyArray<XsdEnumeration>;
  readonly pattern?: XsdPattern;
  readonly base?: XsdPrimitiveType;
}

export interface XsdEnumeration {
  readonly annotation: XsdAnnotation;
  readonly value: string;
}

export interface XsdSimpleType {
  readonly annotation: XsdAnnotation;
  readonly unionMemberTypes?: ReadonlyArray<XsdSimpleType>;
  readonly name: string;
  readonly restriction: XsdRestriction;
}

export enum XsdPrimitiveType {
  string = 'string',
  // date = 'date',
  decimal = 'decimal',
  // boolean = 'boolean',
  integer = 'integer',
  double = 'double',
  dateTime = 'dateTime',
}

export interface XsdAnnotation {
  documentation: string;
}

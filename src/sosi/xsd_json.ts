// Ny XSD export interfaces som binder alt sammen
// Sugar XSD objects to reference each other

export interface JsonXsdFile {
  readonly schema: JsonXsdSchema
}

export interface JsonXsdSchema {
  readonly annotation: JsonXsdAnnotation
  readonly element: ReadonlyArray<JsonXsdElement>
  readonly simpleType: ReadonlyArray<JsonXsdSimpleType>
  readonly complexType: ReadonlyArray<JsonXsdComplexType>
}

export interface JsonXsdElement {
  readonly annotation: JsonXsdAnnotation
  readonly _name: string
  readonly _substitutionGroup: string
  readonly _type: string
}

export interface JsonXsdEnumeration {
  readonly annotation: JsonXsdAnnotation
  readonly _value: string;
}

export interface JsonXsdSimpleType {
  readonly annotation: JsonXsdAnnotation
  readonly _name: string;
  readonly union?: {
    _memberTypes: string
  }
  readonly restriction?: {
    readonly pattern?: {
      readonly _value: string
    }
    readonly _base: string
    readonly enumeration: ReadonlyArray<JsonXsdEnumeration>
  }
}

export interface JsonXsdComplexTypeElement {
  readonly annotation: JsonXsdAnnotation;
  readonly _minOccurs: string;
  readonly _name: string
  readonly _type: string;
}

export interface JsonXsdComplexType {
  readonly annotation: JsonXsdAnnotation
  readonly _name: string;

  readonly sequence?: {
    readonly element: ReadonlyArray<JsonXsdComplexTypeElement>
  }

  readonly complexContent?: {
    readonly extension: {
      readonly sequence: {
        readonly element: ReadonlyArray<JsonXsdComplexTypeElement>
      }
    }
  }
}

export interface JsonXsdAnnotation {
  readonly appinfo?: {
    taggedValue: ReadonlyArray<{
      _tag: string
      __text: string
    }>
  };
  readonly documentation: string
}

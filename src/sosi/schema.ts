import { XsdElement } from './xsd';

export interface SosiSchema {
  readonly objectTypeNames: ReadonlyArray<string>;
  readonly objectTypes: ReadonlyArray<SosiObjectType>;

  getObjectTypeByName(name: string | undefined): SosiObjectType | null;
}

// TODO: Remove SosiObjectType
export interface SosiObjectType extends XsdElement {}

import { SosiObject } from './sosi';

export interface FormGroup {
  name: string
  toggle?: string
  fields: ReadonlyArray<string>
}

export interface ElementExtension {
  visible?: (object: SosiObject) => boolean;
  unit?: string;
  displayName?: string;
}

export interface ObjectTypeConfiguration {
  formGroups: ReadonlyArray<FormGroup>
  elementExtension: { [elementName: string]: ElementExtension }
}

// TODO: Write unit test that validates the configuration

export const defaultObjectTypeConfiguration: ObjectTypeConfiguration = {
  formGroups: [],
  elementExtension: {},
};

export const objectTypeConfiguration: { [objectName: string]: ObjectTypeConfiguration } = {

  TettstedHCparkeringType: {
    formGroups: [
      {
        name: 'Merket',
        toggle: 'merket',
        fields: [
          'merket',
          'bredde',
          'lengde',
        ],
      },
      {
        name: 'Gatelangs parkering',
        toggle: 'gatelangsParkering',
        fields: [
          'gatelangsParkering',
          'brukbartBetjeningsareal',
          'tryggOvergang',
        ],
      },
      {
        name: 'Avgift',
        toggle: 'avgift',
        fields: [
          'avgift',
          'automatHøyde',
          'tilgjengeligAutomat',
        ],
      },
    ],

    elementExtension: {
      stigning: {
        unit: 'grader',
      },
      bredde: {
        visible: (object) => object.merket === 'Ja',
        unit: 'cm',
      },
      lengde: {
        visible: (object) => object.merket === 'Ja',
        unit: 'cm',
      },
      'automatHøyde': {
        visible: object => object.avgift === 'Ja',
        unit: 'cm',
      },
      tilgjengeligAutomat: {
        visible: object => object.avgift === 'Ja',
      },
      brukbartBetjeningsareal: {
        visible: object => object.gatelangsParkering === 'Ja',
      },
      tryggOvergang: {
        visible: object => object.gatelangsParkering === 'Ja',
      },
    },
  },

};

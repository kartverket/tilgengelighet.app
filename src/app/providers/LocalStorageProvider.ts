import { FavoriteFilter } from 'app/components/MapObjectFilter';
import {
  AvailabilityAssessmentNode,
  FeatureComplexNode,
  FeatureMember,
  FeatureNode,
  getPlausibilityValidation,
  RegistrationStatus,
} from 'app/model/FeatureMember';
import { getSchema } from 'sosi/schema_impl';
import { XsdPrimitiveType } from 'sosi/xsd';
import { set, get, del, clear } from 'idb-keyval';

const imageEndpoint =
  'http://data.kartverket.no/tilgjengelighet/tilgjengelighet/';

export class LocalStorageProvider {
  static clean() {
    /// TODO: Remove everything but tips
    del('featureMembers');
  }

  static setConnectionError(connectionError: boolean) {
    localStorage.setItem('connectionError', connectionError.toString());
  }

  static getConnectionError(): boolean {
    const error = localStorage.getItem('connectionError');

    if (error == 'false' || error == undefined) {
      return false;
    } else {
      return true;
    }
  }

  static setDemoMode(demoMode: boolean) {
    localStorage.setItem('demoMode', demoMode.toString());
  }

  static getDemoMode(): boolean {
    const error = localStorage.getItem('demoMode');

    if (error == 'false' || error == undefined) {
      return false;
    } else {
      return true;
    }
  }

  static async saveFeatureMembers(
    featureMembers: FeatureMember[],
  ): Promise<boolean> {
    if (featureMembers == undefined || featureMembers.length < 1) {
      await del('featureMembers');
    }

    const formattedMembers = featureMembers.map(feature => {
      return feature.toLocalStorageFormatted();
    });

    const stringifiedFeatures = JSON.stringify(formattedMembers);
    try {
      // localStorage.setItem('featureMembers', stringifiedFeatures);
      await set('featureMembers', stringifiedFeatures);
    } catch (error) {
      /// TODO: Implement error handling
      return true;
    }
    return false;
  }

  static async getFeatureMembers(): Promise<FeatureMember[]> {
    const featuresAsJson: any = await get('featureMembers');
    // localStorage.getItem('featureMembers');

    const featureMembers: FeatureMember[] = [];

    let parsedFeatures;
    if (featuresAsJson != undefined) {
      parsedFeatures = JSON.parse(featuresAsJson);

      for (const feature of parsedFeatures) {
        const parsedFeatureMember = getParsedFeatureMember(feature);
        featureMembers.push(parsedFeatureMember);
      }
    }

    return featureMembers;
  }

  static saveFavoriteFilters(favoriteFilters: FavoriteFilter[]): boolean {
    const stringifiedFilters: any = [];

    for (const fav of favoriteFilters) {
      const favValues: any[] = [];

      fav.filter.forEach((value: FeatureMember | undefined, key: string) => {
        let filterFeatureMember;
        if (value != undefined) {
          filterFeatureMember = value!.toLocalStorageFormatted(true);
        }
        favValues.push({ key: key, value: filterFeatureMember ?? value });
      });

      stringifiedFilters.push({
        name: fav.name,
        filter: favValues,
      });
    }

    const stringifiedObjectFilter = JSON.stringify(stringifiedFilters);

    try {
      localStorage.setItem('objectFilter', stringifiedObjectFilter);
    } catch (error) {
      /// TODO: Implement error handling
      return true;
    }
    return false;
  }

  static getFavoriteFilters(): FavoriteFilter[] {
    const favoriteFilters: FavoriteFilter[] = [];

    const favFiltersAsJson = localStorage.getItem('objectFilter');

    if (favFiltersAsJson != undefined) {
      const parsedFavFilters = JSON.parse(favFiltersAsJson);

      for (const parsedFilter of parsedFavFilters) {
        const filterItemMap = new Map<string, FeatureMember | undefined>();
        for (const filterItem of parsedFilter.filter) {
          let filterItemValue;

          if (filterItem.value != undefined) {
            filterItemValue = getParsedFilterFeatureMember(filterItem.value);
          }
          filterItemMap.set(filterItem.key, filterItemValue);
          console.log(filterItem);
        }
        favoriteFilters.push({
          name: parsedFilter.name,
          filter: filterItemMap,
        });
        console.log(parsedFilter);
      }
    }

    return favoriteFilters;
  }
}

function getParsedFilterFeatureMember(jsonFeature: any): FeatureMember {
  const featureMember = new FeatureMember();
  featureMember.nodes = [];
  featureMember.images = [];
  const nodes = featureMember.nodes;
  featureMember.availabilityNode = new AvailabilityAssessmentNode();
  featureMember.availabilityNode.complexNode = new FeatureComplexNode(
    'tilgjengelighet',
    [],
    false,
  );

  featureMember.availabilityNode.filterNode = {
    wheelchair: new Map(),
    electricWheelChair: new Map(),
    isApplied: false,
  };

  const sosiSchema = getSchema();

  let featureElementXsdElement;

  // Handle featureType

  const objectEntries = Object.entries(jsonFeature.properties);

  featureMember.type = objectEntries[0][1] as string;

  featureElementXsdElement = sosiSchema.getObjectTypeByName(featureMember.type);

  /// Handle geometry
  featureMember.geometry = {
    type: jsonFeature.geometry.type,
    coordinates: jsonFeature.geometry.coordinates,
  };

  /// Handle feature properties
  for (const [entryKey, entryValue] of Object.entries(jsonFeature.properties)) {
    const value = (entryValue as any).toString();

    if (
      value == undefined ||
      entryKey == 'featuretype' ||
      entryKey.toLowerCase() == 'dbaction'
    ) {
      continue;
    }

    const key = entryKey.toLowerCase();

    /// Handle xsdElement
    let nodeXsdElement;
    if (key != 'featuretype')
      try {
        nodeXsdElement = featureElementXsdElement.elements.find(
          e => e.name.toLowerCase() == key,
        );
      } catch (error) {
        console.log(error);
      }

    /// Plausiblitynode
    const plausibility =
      nodeXsdElement?.name != undefined
        ? getPlausibilityValidation(featureMember.type!, nodeXsdElement.name)
        : undefined;

    // /// Handle dates
    // if (key.includes('datafangstdato')) {
    //   nodes.push(
    //     new FeatureNode(
    //       key,
    //       new Date(value),
    //       true,
    //       nodeXsdElement?.type,
    //       nodeXsdElement,
    //     ),
    //   );
    //   continue;
    // }

    // // Handle id complex node
    // if (key == 'identifikasjon') {
    //   const idNodes: FeatureNode[] = [];
    //   for (const [idKey, idValue] of Object.entries(value)) {
    //     const idNode = new FeatureNode(
    //       idKey,
    //       idValue,
    //       true,
    //       nodeXsdElement?.type,
    //       nodeXsdElement,
    //     );
    //     idNodes.push(idNode);

    //     if (idKey.toLowerCase() == 'lokalid') {
    //       featureMember.localId = idValue as string;
    //     }
    //   }

    //   const idComplexNode = new FeatureComplexNode(
    //     'identifikasjon',
    //     idNodes,
    //     true,
    //   );

    //   featureMember.id = idComplexNode;

    //   continue;
    // }

    // handle ramp node
    if (key == 'rampe') {
      const rampNodes: FeatureNode[] = [];
      for (const [rampKey, rampValue] of Object.entries(value)) {
        const rampNode = new FeatureNode(
          rampKey,
          rampValue,
          true,
          nodeXsdElement?.type,
          nodeXsdElement,
          plausibility,
        );
        rampNodes.push(rampNode);
      }

      const rampComplexNode = new FeatureComplexNode('rampe', rampNodes, false);

      featureMember.rampNode = rampComplexNode;

      continue;
    }

    // handle stair node
    if (key == 'trapp') {
      const stairNodes: FeatureNode[] = [];
      for (const [stairKey, stairValue] of Object.entries(value)) {
        const stairNode = new FeatureNode(
          stairKey,
          stairValue,
          true,
          nodeXsdElement?.type,
          nodeXsdElement,
          plausibility,
        );
        stairNodes.push(stairNode);
      }

      const stairComplexNode = new FeatureComplexNode(
        'trapp',
        stairNodes,
        false,
      );

      featureMember.stairNode = stairComplexNode;

      continue;
    }

    /// Handle images
    if (key.includes('bildefil')) {
      featureMember.images.push({
        id: value,
        url: imageEndpoint + value,
        isUploaded: false,
      });
      continue;
    }

    /// Handle availabilityNode
    if (
      key == 'tilgjengvurderingrulleman' ||
      key == 'tilgjengvurderingrulleauto'
    ) {
      featureMember.availabilityNode.complexNode?.nodes.push(
        new FeatureNode(
          entryKey,
          value,
          true,
          nodeXsdElement?.type,
          nodeXsdElement,
        ),
      );
    }

    if (key == 'availabilityfilterisapplied') {
      featureMember.availabilityNode!.filterNode!.isApplied = entryValue as boolean;
      continue;
    }

    if (
      key.includes('ikke valgt') ||
      key.includes('ikke vurdert') ||
      key.includes('ikke tilgjengelig') ||
      key.includes('tilgjengelig') ||
      key.includes('delvis tilgjengelig')
    ) {
      if (key.includes('electric')) {
        featureMember.availabilityNode.filterNode?.electricWheelChair.set(
          entryKey.replace('electric', ''),
          entryValue as boolean,
        );
      }
      if (key.includes('primitive')) {
        featureMember.availabilityNode.filterNode?.wheelchair.set(
          entryKey.replace('primitive', ''),
          entryValue as boolean,
        );
      }
      continue;
    }
    /// Handle rest of prop values

    const node = new FeatureNode(
      key,
      value,
      true,
      nodeXsdElement?.type,
      nodeXsdElement,
      plausibility,
    );

    nodes.push(node);

    if (plausibility != undefined && value != undefined) {
      let values;

      const validationType = node.validationType as XsdPrimitiveType;

      const valueList = (node.value as string).split(',');
      if (validationType == XsdPrimitiveType.integer) {
        values = [Number.parseInt(valueList[0]), Number.parseInt(valueList[1])];
      } else if (validationType == XsdPrimitiveType.double) {
        values = [
          Number.parseFloat(valueList[0]),
          Number.parseFloat(valueList[1]),
        ];
      } else throw 'VALUE CAN NOT BE NUMBER';

      node.filterMinMaxAllowance = {
        min: values[0],
        max: values[1],
      };
    }
  }

  return featureMember;
}

export function getParsedFeatureMember(jsonFeature: any): FeatureMember {
  const featureMember = new FeatureMember();
  featureMember.nodes = [];
  featureMember.images = [];
  const nodes = featureMember.nodes;
  featureMember.availabilityNode = new AvailabilityAssessmentNode();
  featureMember.availabilityNode.complexNode = new FeatureComplexNode(
    'tilgjengelighet',
    [],
    false,
  );

  const sosiSchema = getSchema();

  let featureElementXsdElement;

  // Handle featureType

  const objectEntries = Object.entries(jsonFeature.properties);

  featureMember.type = objectEntries[0][1] as string;

  featureElementXsdElement = sosiSchema.getObjectTypeByName(featureMember.type);

  featureMember.sosiElement = featureElementXsdElement;

  /// Handle geometry
  featureMember.geometry = {
    type: jsonFeature.geometry.type,
    coordinates: jsonFeature.geometry.coordinates,
    representationPoint: jsonFeature.geometry?.representationPoint,
  };

  /// Handle feature properties
  for (const [entryKey, entryValue] of Object.entries(jsonFeature.properties)) {
    let value = (entryValue as any)?.toString();

    if (value == undefined || entryKey == 'featuretype') continue;

    const key = entryKey.toLowerCase();

    if (key == 'registrationstatus') {
      featureMember.registrationStatus = value;
      continue;
    }

    if (key == 'editedbyuser') {
      featureMember.editedByUser = entryValue as boolean;
      continue;
    }

    if (key == 'isduplicate') {
      featureMember.isDuplicate = entryValue as boolean;
      continue;
    }

    if (key == 'dbaction') {
      featureMember.dbAction = value;
      continue;
    }

    if (key == 'isdemo') {
      featureMember.isDemo = value;
      continue;
    }

    /// Handle xsdElement
    let nodeXsdElement;

    try {
      nodeXsdElement = featureElementXsdElement.elements.find(
        e => e.name?.toLowerCase() == key,
      );
    } catch (error) {
      console.log(error);
    }

    /// Plausiblitynode
    const plausibility =
      nodeXsdElement?.name != undefined
        ? getPlausibilityValidation(featureMember.type!, nodeXsdElement.name)
        : undefined;

    /// Handle dates
    if (key.includes('datafangstdato')) {
      nodes.push(
        new FeatureNode(
          entryKey,
          new Date(value),
          true,
          nodeXsdElement?.type,
          nodeXsdElement,
        ),
      );
      continue;
    }

    // Handle id complex node
    if (key == 'identifikasjon') {
      const idNodes: FeatureNode[] = [];
      for (const [idKey, idValue] of Object.entries(entryValue as Object)) {
        const idNode = new FeatureNode(
          idKey,
          idValue,
          true,
          nodeXsdElement?.type,
          nodeXsdElement,
        );
        idNodes.push(idNode);

        if (idKey.toLowerCase() == 'lokalid') {
          featureMember.localId = idValue as string;
        }
      }

      const idComplexNode = new FeatureComplexNode(
        'identifikasjon',
        idNodes,
        true,
      );

      featureMember.id = idComplexNode;

      continue;
    }

    // handle ramp node
    if (key == 'rampe') {
      const rampNodes: FeatureNode[] = [];
      for (const [rampKey, rampValue] of Object.entries(entryValue as Object)) {
        const xsdParentElement = sosiSchema.getObjectTypeByName('rampe');

        const xsdChildElement = xsdParentElement?.elements.find(
          e => e.name.toLowerCase() == rampKey.toLowerCase(),
        )!;

        const rampNode = new FeatureNode(
          rampKey,
          rampValue?.toString(),
          true,
          xsdChildElement?.type as any,
          xsdChildElement,
          plausibility,
        );
        rampNodes.push(rampNode);
      }

      const rampComplexNode = new FeatureComplexNode('rampe', rampNodes, false);

      featureMember.rampNode = rampComplexNode;

      continue;
    }

    // handle stair node
    if (key == 'trapp') {
      const stairNodes: FeatureNode[] = [];
      for (const [stairKey, stairValue] of Object.entries(
        entryValue as Object,
      )) {
        const xsdParentElement = sosiSchema.getObjectTypeByName('trapp');

        const xsdChildElement = xsdParentElement?.elements.find(
          e => e.name.toLowerCase() == stairKey.toLowerCase(),
        );

        const stairNode = new FeatureNode(
          stairKey,
          stairValue?.toString(),
          true,
          xsdChildElement?.type as any,
          xsdChildElement,
          plausibility,
        );
        stairNodes.push(stairNode);
      }

      const stairComplexNode = new FeatureComplexNode(
        'trapp',
        stairNodes,
        false,
      );

      featureMember.stairNode = stairComplexNode;

      continue;
    }

    if (key.includes('bildefil')) {
      const imageAsObject = entryValue as any;
      featureMember.images.push({
        id: imageAsObject.id,
        url: imageEndpoint + imageAsObject.id,
        isUploaded: imageAsObject.isUploaded,
      });
      continue;
    }

    /// Handle availabilityNode
    if (
      key == 'tilgjengvurderingrulleman' ||
      key == 'tilgjengvurderingrulleauto'
    ) {
      featureMember.availabilityNode.complexNode?.nodes.push(
        new FeatureNode(
          entryKey,
          value,
          true,
          nodeXsdElement?.type,
          nodeXsdElement,
        ),
      );
    }

    /// Handle rest of prop values
    nodes.push(
      new FeatureNode(
        entryKey,
        value,
        true,
        nodeXsdElement?.type,
        nodeXsdElement,
        plausibility,
      ),
    );
  }

  if (
    featureMember.registrationStatus != RegistrationStatus.serverError &&
    featureMember.registrationStatus != RegistrationStatus.clientError
  ) {
    featureMember.setRegistrationStatus();
  }

  return featureMember;
}

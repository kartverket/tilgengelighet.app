import {
  XsdPrimitiveType,
  XsdComplexTypeElement,
  XsdSimpleType,
  XsdComplexType,
} from '../../sosi/xsd';
import { getSchema } from '../../sosi/schema_impl';
import { SosiObjectType, SosiSchema } from '../../sosi/schema';
import {
  EPSGGeometry,
  GeoType,
  PolygonLayerCoordinates,
} from 'app/containers/MapActions';
import { UpdateAction } from 'app/providers/DataProvider';
import proj4 from 'proj4';
import plausibility from './Plausibilities.json';
import dependecies from './Dependencies.json';
import requiries from './Requiries.json';
import { GmlSupportedTypes } from 'sosi/gml';
import {
  genId,
  getPointInsideOfPolygon,
  pointIsInPoly,
} from 'app/components/ActualMap';
import { verifyFieldInput } from 'app/containers/ObjectEditor/ObjectFieldValidation';

const imageEndpoint =
  'http://data.kartverket.no/tilgjengelighet/tilgjengelighet/';

type LatLng = [number, number];

export type ImageElement = {
  id: string;
  url?: string;
  imageFile?: any;
  isUploaded: boolean;
};

export enum RegistrationStatus {
  imported = 'Imported',
  importedYTD = 'ImportedYTD',
  clientError = 'ClientError',
  serverError = 'ServerError',
}

export class FeatureMember {
  type?: string;
  localId?: string;
  geometry?: EPSGGeometry;
  dbAction?: UpdateAction;
  images: ImageElement[] = [];
  nodes: FeatureNode[] = [];
  stairNode: FeatureComplexNode | undefined;
  rampNode: FeatureComplexNode | undefined;
  availabilityNode?: AvailabilityAssessmentNode;
  id?: FeatureComplexNode;
  sosiElement: SosiObjectType | undefined;
  editedByUser?: boolean;
  isDuplicate?: boolean;
  registrationStatus?: RegistrationStatus;
  isDemo?: boolean;

  constructor(doc?: XMLDocument, schema?: SosiSchema, dbAction?: UpdateAction) {
    if (doc && schema) {
      this.dbAction = dbAction ?? UpdateAction.replace;
      this.type = this.getType(doc, schema);
      this.sosiElement = this.getSosiElement(schema);
      this.id = this.getId(doc, schema);
      this.geometry = this.getGeometry(doc, schema);
      this.nodes = this.getNodes(doc, schema);
      this.stairNode = this.getStairNode(doc, schema);
      this.rampNode = this.getRampNode(doc, schema);
      this.availabilityNode = this.getAvailabilityNode(doc, schema);
      this.localId = this.id.nodes[0].value;
      this.images = this.getImageElements(doc);
      this.setRegistrationStatus();
    } else {
      this.dbAction = dbAction ?? UpdateAction.create;
    }
  }

  getNodeInstance(name: string): FeatureNode | undefined {
    return this.nodes.find(n => n.name?.toLowerCase() == name?.toLowerCase());
  }

  getSosiElement(schema: SosiSchema): SosiObjectType {
    if (!schema) throw 'Schema is undefined';

    return schema.getObjectTypeByName(this.type)!;
  }

  setRegistrationStatus() {
    const dateNow = new Date(Date.now());

    /// Check if originated in current year
    const updateAtDate = this.nodes.find(n => n?.name == 'datafangstdato')
      ?.value;

    if (updateAtDate != undefined && updateAtDate instanceof Date) {
      if (updateAtDate.getFullYear() == dateNow.getFullYear()) {
        this.registrationStatus = RegistrationStatus.importedYTD;
        return;
      }
    }

    /// TODO: Remove assertion to highlight errors below, should not be necessary in production
    const dateOfOrigin = this.nodes.find(
      n => n?.name?.toLowerCase() == 'førstedatafangstdato',
    )?.value;

    if (dateOfOrigin != undefined && dateOfOrigin instanceof Date) {
      if (dateOfOrigin.getFullYear() == dateNow.getFullYear()) {
        this.registrationStatus = RegistrationStatus.importedYTD;
      } else {
        this.registrationStatus = RegistrationStatus.imported;
      }
    } else {
      this.registrationStatus = RegistrationStatus.imported;

      // throw 'DATE OF ORIGIN CAN NOT BE UNDEFINED HERE';
    }
  }

  validate(): boolean {
    /// TODO, include fields that are required for validation
    let inputIsValid: boolean = true;

    this.nodes = this.nodes.filter(node => node.name != undefined);

    let fields = this.nodes;

    if (this.rampNode) {
      if (this.rampNode.nodes[0]?.value == 'Ja')
        fields = fields.concat(this.rampNode.nodes);
    }

    if (this.stairNode) {
      if (this.stairNode.nodes[0]?.value == 'Ja')
        fields = fields.concat(this.stairNode.nodes);
    }

    const underConstruction =
      fields.find(n => n.name?.toLowerCase() == 'byggingpågår')?.value == 'Ja';

    if (this.sosiElement)
      for (const element of this.sosiElement?.elements) {
        if (
          element.name.startsWith('objektNr') ||
          element.name.startsWith('bilde') ||
          element.name.startsWith('identifikasjon') ||
          element.name.startsWith('opphav') ||
          element.name.startsWith('geometri') ||
          element.name.startsWith('kommReel') ||
          element.name.startsWith('kommune') ||
          element.name.startsWith('rampe') ||
          element.name.startsWith('grense') ||
          element.name.startsWith('trapp') ||
          element.name.startsWith('grense') ||
          element.name.startsWith('posisjon') ||
          element.name.startsWith('segmentLengde') ||
          element.name.startsWith('datafangst')
        ) {
          continue;
        }

        const exists = fields.find(
          n => n.name?.toLowerCase() == element.name?.toLowerCase(),
        );

        if (!exists) {
          fields.push(
            new FeatureNode(
              element.name,
              undefined,
              true,
              element.type as XsdPrimitiveType,
              element,
            ),
          );
        }
      }

    for (let node of fields) {
      if (!underConstruction) {
        node.required = getRequiredForFeatureNode(
          this.type!,
          node.xsdElement?.name ?? node.name,
        );
      }

      try {
        if (
          node.name?.toLowerCase() == 'tilgjengvurderingrulleman' ||
          node.name?.toLowerCase() == 'tilgjengvurderingrulleauto' ||
          node.name?.toLowerCase() == 'gatetype' ||
          node.name?.toLowerCase() == 'tilgjengvurderingsyn' ||
          node.name?.toLowerCase() == 'byggningsfunksjon'
        ) {
          node.required = true;
        }
      } catch (e) {
        console.log(e);
      }

      node.plausibilityValidation = getPlausibilityValidation(
        this.type!,
        node.xsdElement?.name ?? node.name,
      );

      node.dependency = getDependencyForFeatureNode(
        this.type!,
        node.xsdElement?.name ?? node.name,
      );

      const dependsOnNode =
        node.dependency == undefined
          ? undefined
          : fields.find(n => n.name == node.dependency!.dependsOnNodeName);

      const conditionOne =
        (node.xsdElement?.minOccurs != undefined &&
          node.xsdElement?.minOccurs > 0) ||
        (node.required == true && dependsOnNode == undefined);

      const conditionTwo =
        dependsOnNode != undefined &&
        dependsOnNode.value == node.dependency!.dependsOnValue;

      if ((conditionOne || conditionTwo) && node.value == undefined) {
        inputIsValid = false;
        break;
      } else if (node.value != undefined) {
        const valueIsValid = verifyFieldInput(node, node.value, true).valid;

        if (valueIsValid == false) {
          inputIsValid = false;
          break;
        }
      }
    }

    return inputIsValid;
  }

  getImageElements(doc: XMLDocument): ImageElement[] {
    const ids: ImageElement[] = [];

    for (var i = 0; i < doc.all.length; i++) {
      let element = doc.all[i];
      if (element.tagName?.toLowerCase()?.includes('bildefil')) {
        const imgId = element.textContent;

        if (imgId) {
          ids.push({ id: imgId, url: imageEndpoint + imgId, isUploaded: true });
        }
      }
    }

    return ids;
  }

  getCreatedAtDate = (getLatestEditDate?: boolean): string => {
    const date = (getLatestEditDate == true
      ? this.getNodeInstance('datafangstdato')?.value ??
        this.getNodeInstance('førstedatafangstdato')?.value
      : this.getNodeInstance('førstedatafangstdato')?.value) as Date;

    if (date) {
      const day = date.toString().substring(8, 10).trim();
      const year = date.getFullYear().toString().substring(2);
      let month = (date.getMonth() + 1).toString();

      if (month.length == 1) month = '0' + month;

      return day + '.' + month + '.' + year;
    } else {
      return 'N/A';
    }
  };

  getDate = (dateType): string | undefined => {
    let date;
    if (date == undefined)
      date = this.nodes.find(
        e => e?.name?.toLowerCase() == dateType?.toLowerCase(),
      )?.value;

    if (date == undefined) return undefined;

    if (date instanceof Date) {
      const day = date.toString().substring(8, 10).trim();
      const year = date.getFullYear().toString().substring(2);
      const monthDate = new Date(date);
      let month = new Date(monthDate.setMonth(monthDate.getMonth()))
        .getMonth()
        .toString();

      month = (Number.parseInt(month) + 1).toString();

      if (month.length == 1) month = '0' + month;

      return day + '.' + month + '.' + year;
    } else {
      return 'N/A';
    }
  };

  getStairNode(
    doc: XMLDocument,
    schema: SosiSchema,
  ): FeatureComplexNode | undefined {
    if (doc.getElementsByTagName('app:trapp')[0]) {
      return new FeatureComplexNode(
        'trapp',
        getComplexNodes(doc, 'trapp', schema),
        schema
          .getObjectTypeByName(this.type!)
          ?.elements.find(element => element.name == 'trapp')?.minOccurs! > 0,
      );
    } else return undefined;
  }

  getRampNode(
    doc: XMLDocument,
    schema: SosiSchema,
  ): FeatureComplexNode | undefined {
    if (doc.getElementsByTagName('app:rampe')[0]) {
      return new FeatureComplexNode(
        'rampe',
        getComplexNodes(doc, 'rampe', schema),
        schema
          .getObjectTypeByName(this.type!)
          ?.elements.find(element => element.name == 'rampe')?.minOccurs! > 0,
      );
    } else return undefined;
  }

  getAvailabilityNode(
    doc?: XMLDocument,
    schema?: SosiSchema,
  ): AvailabilityAssessmentNode | undefined {
    if (this.type?.toLocaleLowerCase() == 'tettstedinngangbygg') {
      console.log();
    }

    if (doc && schema) {
      const wheelchairValue = doc.getElementsByTagName(
        'app:tilgjengvurderingrulleman',
      )[0]?.textContent;
      const wheelChairAutoValue = doc.getElementsByTagName(
        'app:tilgjengvurderingrulleauto',
      )[0]?.textContent;
      /// Certain Objects differs in the naming of this property
      const electricWheelChairValue =
        doc.getElementsByTagName('app:tilgjengvurderingelrullestol')[0]
          ?.textContent ??
        doc.getElementsByTagName('app:tilgjengvurderingelrull')[0]?.textContent;
      const visionValue = doc.getElementsByTagName(
        'app:tilgjengvurderingrulleman',
      )[0]?.textContent;

      const wheelchairXsdElement = schema
        .getObjectTypeByName(this.type!)
        ?.elements.find(e => e.name == 'tilgjengvurderingRulleMan');
      const wheelChairAutoXsdElement = schema
        .getObjectTypeByName(this.type!)
        ?.elements.find(e => e.name == 'tilgjengvurderingRulleAuto');
      const electricWheelchairXsdElement =
        schema
          .getObjectTypeByName(this.type!)
          ?.elements.find(e => e.name == 'tilgjengvurderingElRullestol') ??
        schema
          .getObjectTypeByName(this.type!)
          ?.elements.find(e => e.name == 'tilgjengvurderingElRull');
      const visionXsdElement = schema
        .getObjectTypeByName(this.type!)
        ?.elements.find(e => e.name == 'tilgjengvurderingSyn');

      const wheelchairNode = new FeatureNode(
        wheelchairXsdElement?.name!,
        wheelchairValue,
        true,
        undefined,
        wheelchairXsdElement,
      );

      const wheelchairAutoNode = new FeatureNode(
        wheelChairAutoXsdElement?.name!,
        wheelChairAutoValue,
        true,
        undefined,
        wheelChairAutoXsdElement,
      );

      this.nodes.push(wheelchairNode);

      this.nodes.push(wheelchairAutoNode);

      const assessmentNode = new AvailabilityAssessmentNode(
        new FeatureComplexNode(
          'Tilgjengelighetsvurdering',
          [wheelchairNode, wheelchairAutoNode],
          false,
        ),
      );

      if (electricWheelchairXsdElement) {
        const electricWheelChairNode = new FeatureNode(
          electricWheelchairXsdElement?.name!,
          electricWheelChairValue,
          true,
          undefined,
          electricWheelchairXsdElement,
        );

        this.nodes.push(electricWheelChairNode);

        assessmentNode.complexNode?.nodes.push(electricWheelChairNode);
      }

      if (visionXsdElement) {
        const visionNode = new FeatureNode(
          visionXsdElement?.name!,
          visionValue,
          true,
          undefined,
          visionXsdElement,
        );

        this.nodes.push(visionNode);

        assessmentNode.complexNode?.nodes.push(visionNode);
      }

      return assessmentNode;
    }
    return undefined;
  }

  getType(doc: XMLDocument, schema: SosiSchema): string {
    try {
      const featureType = doc
        .getElementsByTagName('gml:featuremember')[0]
        .children[0].localName.substring(4);

      const featureTypeWithCasing = schema.objectTypeNames.find(
        element => element?.toLowerCase() == featureType.toLowerCase(),
      )!;

      if (!featureTypeWithCasing) throw 'Could not match featureType';
      else return featureTypeWithCasing;
    } catch (error) {
      throw 'could not fetch featureTypeName';
    }
  }

  getId(doc: XMLDocument, schema: SosiSchema): FeatureComplexNode {
    return new FeatureComplexNode(
      'identifikasjon',
      getComplexNodes(doc, 'identifikasjon', schema),
      false,
    );
  }

  getGeometry(doc: XMLDocument, schema: SosiSchema): EPSGGeometry {
    const geoType = getObjectGeometryType(schema, this.type);

    switch (geoType?.toLowerCase()) {
      case 'point': {
        const geo = doc.getElementsByTagName('app:geometri')[0].children[0]
          .children[0].textContent;

        const parsedCoords = textContentToEPSG4326Position(geo!);

        return {
          type: GeoType.point,
          coordinates: parsedCoords,
        };
      }

      case 'linestring':
        return {
          type: GeoType.lineString,
          coordinates: getLatLngList(doc),
        };

      case 'polygon': {
        const polygonPositionTextContent = doc.getElementsByTagName(
          'app:posisjon',
        )[0].children[0].children[0].textContent;

        const polygonPosition = textContentToEPSG4326Position(
          polygonPositionTextContent!,
        );

        return {
          type: GeoType.polygon,
          coordinates: getLatLngList(doc),
          representationPoint: polygonPosition,
        };
      }
    }
    throw 'GEOTYPE is undefined';
  }

  getNodes(doc: XMLDocument, schema: SosiSchema): FeatureNode[] {
    /// Create a new modifiable XMLDocument
    var newDocument = doc.implementation.createDocument(
      doc.namespaceURI, //namespace to use
      null, //name of the root element (or for empty document)
      null, //doctype (null for XML)G
    );
    var newNode = newDocument.importNode(
      doc.all[5], //node to import
      true, //clone its descendants
    );

    newDocument.appendChild(newNode);

    const nodes: FeatureNode[] = [];

    if (this.geometry?.type == GeoType.polygon) {
      var lineStringSegment = doc.getElementsByTagName('gml:linestring')[0]
        .outerHTML;

      const indexOfStart = lineStringSegment.lastIndexOf('_') + 1;
      const indexOfEnd = lineStringSegment.lastIndexOf('"');

      const correspondingBorderObjectId = lineStringSegment.substring(
        indexOfStart,
        indexOfEnd,
      );

      nodes.push(
        new FeatureNode('borderObjectId', correspondingBorderObjectId, true),
      );
    }

    /// Remove fields that have been processed elsewhere
    for (var i = 0; i < newDocument.all.length; i++) {
      if (i == 0) continue;

      let element = newDocument.all[i];

      const name = element.tagName.substring(4).toLowerCase();

      if (!name || name.includes(':')) {
        throw 'Error getting elementname';
      }

      if (
        name == 'geometri' ||
        name == 'rampe' ||
        name == 'trapp' ||
        name == 'identifikasjon' ||
        element.tagName?.toLowerCase()?.includes('bildefil') ||
        element.tagName?.toLowerCase()?.includes('tilgjengvurdering')
      ) {
        newDocument.all[i].remove();
        i--;
      }
    }

    for (var i = 0; i < newDocument.all.length; i++) {
      if (i == 0) continue;
      if (newDocument.all[i].children.length < 1) {
        let field = newDocument.all[i];

        var value;

        const fieldName = field.localName?.substring(4)?.toLowerCase();

        const correspondingElement = this.sosiElement!.elements.find(
          element => element.name?.toLowerCase() == fieldName,
        );

        if (correspondingElement) {
          if (
            correspondingElement.name?.toLowerCase().includes('datafangstdato')
          ) {
            value = new Date(field.textContent!);
          } else value = field.textContent;

          nodes.push(
            new FeatureNode(
              correspondingElement?.name!,
              value,
              true,
              correspondingElement.type as XsdPrimitiveType,
              correspondingElement,
              getPlausibilityValidation(this.type!, correspondingElement.name),
            ),
          );
        } else {
          if (
            fieldName != 'pos' &&
            fieldName != 'geometri' &&
            fieldName != 'poslist' &&
            fieldName != 'featuremember'
          ) {
            throw 'Could not locate corresponding element';
          }
        }
      }
    }

    ///TODO:
    for (var node of nodes) {
      if (node.name == undefined) {
        throw ' NODE NAME CAN NOT BE UNDEFINED';
      }
    }

    if (nodes.find(n => n.name.includes('bildefil'))) {
      console.log();
    }

    return nodes;
  }

  toUploadFormatted(): any[] | object {
    this.onApproveForPublishing();

    const properties = new Map();

    properties.set('featuretype', this.type);

    for (let node of this.nodes) {
      if (node.name?.toLowerCase() == 'borderobjectid') continue;

      if (node.name?.toLowerCase() == 'førstedatafangstdato') {
        properties.set(
          'førsteDatafangstdato',
          this.getDateUploadFormatted(node.value, 2),
        );
        continue;
      } else if (node.name?.toLowerCase() == 'datafangstdato') {
        properties.set(
          'datafangstdato',
          this.getDateUploadFormatted(node.value, 2),
        );
        continue;
      }
      properties.set(
        node.name,
        getFeatureNodeValueWithDataType(node, this.sosiElement),
      );
    }

    // TODO: legg til oppdateringsdato-felt

    if (this.stairNode) {
      const values = new Map();

      let hasValues = false;

      for (let node of this.stairNode.nodes) {
        const deciderNode = this.stairNode.nodes.find(
          n => n.name?.toLowerCase() == 'trapp',
        );

        if (
          deciderNode == undefined ||
          deciderNode.name?.toLowerCase() != 'trapp' ||
          deciderNode.value == undefined ||
          deciderNode.value == 'Nei'
        ) {
          values.set('trapp', 'Nei');
          hasValues = true;
          break;
        }

        if (node.value !== undefined) {
          hasValues = true;
          values.set(
            node.name,
            getFeatureNodeValueWithDataType(node, this.sosiElement),
          );
        }
      }
      
      if (hasValues || this.stairNode.required) properties.set('trapp', values);
    }

    if (this.rampNode) {
      const values = new Map();

      let hasValues = false;

      for (let node of this.rampNode.nodes) {
        const deciderNode = this.rampNode.nodes.find(
          n => n.name?.toLowerCase() == 'rampe',
        );

        if (
          deciderNode == undefined ||
          deciderNode.name?.toLowerCase() != 'rampe' ||
          deciderNode.value == undefined ||
          deciderNode.value == 'Nei'
        ) {
          values.set('rampe', 'Nei');
          hasValues = true;
          break;
        }

        if (node.value !== undefined) {
          hasValues = true;
          values.set(
            node.name,
            getFeatureNodeValueWithDataType(node, this.sosiElement),
          );
        }
      }
      if (hasValues || this.rampNode.required) properties.set('rampe', values);
    }

    if (this.images != undefined && this.images.length > 0) {
      for (const element of this.images) {
        const indexOfElement = this.images.indexOf(element);

        if (
          !element.url?.includes('data.kartverket.no') &&
          element.isUploaded == false
        )
          element.id = getImageId(this, indexOfElement);

        properties.set(
          'bildefil' + (indexOfElement + 1).toString(),
          element.id,
        );
      }
    }

    if (this.id == undefined) {
      this.setId();
    }

    if (this.id) {
      const values = new Map();

      for (let node of this.id.nodes) {
        values.set(
          node.name,
          getFeatureNodeValueWithDataType(node, this.sosiElement),
        );
      }
      properties.set('identifikasjon', values);
    } else throw 'Featuremember id can not be undefined';

    const mapToObj = (m): any => {
      return Array.from(m).reduce((obj: any, [key, value]) => {
        if (value instanceof Map) {
          value = mapToObj(value);
        }
        obj[key] = value;
        return obj;
      }, {});
    };

    let coordinates: any = [];
    const geoType = this.geometry?.type;

    switch (geoType) {
      case 'Point': {
        coordinates = [
          this.geometry?.coordinates[1],
          this.geometry?.coordinates[0],
        ];
        break;
      }
      case 'LineString': {
        for (let coords of this.geometry?.coordinates) {
          coordinates.push([coords[1], coords[0]]);
        }
        break;
      }

      case 'Polygon': {
        const polyCoords =
          this.geometry?.coordinates.coordinates ?? this.geometry?.coordinates;
        for (let coords of polyCoords) {
          coordinates.push([coords[1], coords[0]]);
        }
        break;
      }
    }

    const formattedProperties: Object = mapToObj(properties);

    /// Handle polygon border duality
    if (this.geometry?.type?.toLowerCase() == 'polygon') {
      let borderObject;

      // if (this.dbAction != UpdateAction.erase)
      borderObject = this.formatBorderType(coordinates);

      const borderValues = new Map();

      let repPoint = (this.geometry.coordinates as PolygonLayerCoordinates)
        .representationPoint;

      const point = getPointInsideOfPolygon(coordinates, false);

      repPoint = [point[1], point[0]];
      // if (
      //   repPoint == undefined ||
      //   pointIsInPoly([repPoint[1], repPoint[0]], coordinates) == false
      // ) {
      //   repPoint = getPointInsideOfPolygon([coordinates, false]);
      // } else {
      //   repPoint = (this.geometry.coordinates as PolygonLayerCoordinates)
      //     .representationPoint;
      // }

      borderValues.set('position', [repPoint[1], repPoint[0]]);

      borderValues.set('exterior', [borderObject.id]);

      const formattedPolygon = {
        type: 'FeatureMember',
        geometry: {
          type: this.geometry?.type,
          coordinates: coordinates,
        },
        properties: formattedProperties,
        geometry_properties: mapToObj(borderValues),
        update: {
          action: this.dbAction,
        },
      };

      return [borderObject.object, formattedPolygon];
    }

    return {
      type: 'FeatureMember',
      geometry: {
        type: geoType,
        coordinates: coordinates,
      },
      properties: formattedProperties,
      update: {
        action: this.dbAction,
      },
    };
  }

  formatBorderType(coordinates: Array<number>[]): any {
    const borderFeatureMember = new FeatureMember();

    const coordinatesReversed: Array<number>[] = [];

    const arrayLength = coordinates.length - 1;

    let isClockWise = false;

    /// Do clockwise check
    var signedArea: number = 0;

    for (var i = 0; i < arrayLength; i++) {
      const latLng = coordinates[i];

      var x1 = latLng[0];
      var y1 = latLng[1];

      var x2;
      var y2;

      if (latLng == coordinates[arrayLength]) {
        const firstPoint: number[] = coordinates[0];
        x2 = firstPoint[0];
        y2 = firstPoint[1];
      } else {
        const firstPoint: number[] = coordinates[i + 1];
        x2 = firstPoint[0];
        y2 = firstPoint[1];
      }

      signedArea += x1 * y2 - x2 * y1;
    }

    for (var i = 0; i < arrayLength + 1; i++) {
      const index = arrayLength - i;

      coordinatesReversed.push(coordinates[index]);
    }

    borderFeatureMember.geometry = {
      type: GeoType.lineString,
      coordinates: this.geometry!.coordinates as PolygonLayerCoordinates,
    };

    const idNodes: FeatureNode[] = [];

    this.id?.nodes.map(node =>
      idNodes.push(new FeatureNode(node.name, node.value, node.valid)),
    );

    borderFeatureMember.id = new FeatureComplexNode(
      this.id!.name,
      idNodes,
      true,
    );

    borderFeatureMember.localId =
      this.dbAction == UpdateAction.create
        ? genId()
        : this.getNodeInstance('borderObjectId')?.value;

    if (this.dbAction == UpdateAction.create) {
      this.nodes.push(
        new FeatureNode('borderObjectId', borderFeatureMember.localId, true),
      );
    }

    borderFeatureMember.id!.nodes.find(
      e => e.name?.toLowerCase() == 'lokalid',
    )!.value = borderFeatureMember.localId;

    borderFeatureMember.dbAction = this.dbAction;

    if (this.type == 'FriluftFriluftsområde') {
      borderFeatureMember.type = 'FriluftFriluftomrGr';
    } else {
      borderFeatureMember.type = this.type + 'Gr';
    }

    const mapToObj = m => {
      return Array.from(m).reduce((obj: any, [key, value]) => {
        if (value instanceof Map) {
          value = mapToObj(value);
        }
        obj[key] = value;
        return obj;
      }, {});
    };

    const properties = new Map();

    properties.set('featuretype', borderFeatureMember.type);

    const values = new Map();

    for (let node of borderFeatureMember.id.nodes) {
      values.set(
        node.name,
        getFeatureNodeValueWithDataType(node, this.sosiElement),
      );
    }
    properties.set('identifikasjon', values);

    return {
      id: borderFeatureMember.localId,
      object: {
        type: 'FeatureMember',
        geometry: {
          type: borderFeatureMember.geometry?.type,
          coordinates: signedArea > 0 ? coordinatesReversed : coordinates,
        },
        properties: mapToObj(properties),
        update: {
          action: borderFeatureMember.dbAction,
        },
      },
    };
  }

  toLocalStorageFormatted(asFilter?: boolean) {
    const properties = new Map();

    properties.set('featuretype', this.type);

    properties.set('registrationStatus', this.registrationStatus);

    for (let node of this.nodes) {
      properties.set(
        node.name,
        asFilter == true
          ? node.value
          : getFeatureNodeValueWithDataType(node, this.sosiElement),
      );
    }

    if (this.editedByUser == true) {
      properties.set('editedByUser', true);
    }

    if (this.isDuplicate == true) {
      properties.set('isDuplicate', true);
    }

    if (this.isDemo == true) {
      properties.set('isDemo', true);
    }

    properties.set('dbAction', this.dbAction);

    const availabilityFilterNode = this.availabilityNode?.filterNode;

    if (availabilityFilterNode != undefined) {
      console.log(this.availabilityNode?.filterNode);
      availabilityFilterNode.electricWheelChair.forEach(
        (value: boolean, key: string) => {
          properties.set('electric' + key, value);
        },
      );
      availabilityFilterNode.wheelchair.forEach(
        (value: boolean, key: string) => {
          properties.set('primitive' + key, value);
        },
      );
      properties.set(
        'availabilityFilterIsApplied',
        availabilityFilterNode.isApplied,
      );
    }

    if (this.stairNode) {
      const values = new Map();

      let hasValues = false;

      for (let node of this.stairNode.nodes) {
        if (node.value !== undefined) hasValues = true;
        values.set(
          node.name,
          getFeatureNodeValueWithDataType(node, this.sosiElement),
        );
      }
      if (hasValues || this.stairNode.required) properties.set('trapp', values);
    }

    if (this.rampNode) {
      const values = new Map();

      let hasValues = false;

      for (let node of this.rampNode.nodes) {
        if (node.value !== undefined) hasValues = true;
        values.set(
          node.name,
          getFeatureNodeValueWithDataType(node, this.sosiElement),
        );
      }
      if (hasValues || this.rampNode.required) properties.set('rampe', values);
    }

    if (this.images != undefined) {
      for (const element of this.images) {
        const indexOfElement = this.images.indexOf(element);

        properties.set('bildefil' + (indexOfElement + 1).toString(), {
          id: element.id,
          isUploaded: element.isUploaded,
        });
      }
    }

    if (asFilter != true) {
      const createdAtDate = this.nodes.find(
        e => e?.name?.toLowerCase() == 'førstedatafangstdato',
      )?.value;

      if (createdAtDate != undefined)
        properties.set(
          'førsteDatafangstdato',
          createdAtDate instanceof Date
            ? this.getDateUploadFormatted(createdAtDate)
            : createdAtDate,
        );
    }
    if (this.id || this.localId != undefined) {
      if (this.id == undefined) this.setId();

      const values = new Map();

      for (let node of this.id!.nodes) {
        values.set(
          node.name,
          getFeatureNodeValueWithDataType(node, this.sosiElement),
        );
      }
      properties.set('identifikasjon', values);
    } else if (asFilter != true) {
      throw 'Featuremember id can not be undefined';
    }

    const mapToObj = m => {
      return Array.from(m).reduce((obj: any, [key, value]) => {
        if (value instanceof Map) {
          value = mapToObj(value);
        }
        obj[key] = value;
        return obj;
      }, {});
    };

    const formatted = {
      type: 'FeatureMember',
      geometry: {
        type: this.geometry?.type,
        coordinates: this.geometry?.coordinates,
        representationPoint: this.geometry?.representationPoint,
      },
      properties: mapToObj(properties),
      update: {
        action: this.dbAction,
      },
    };

    return formatted;
  }

  setId() {
    const idNodes = [
      { name: 'navnerom', value: 'data.geonorge.no', valid: true },
      { name: 'lokalId', value: this.localId, valid: true },
      {
        name: 'versjonId',
        value: this.getDateUploadFormatted(
          this.nodes.find(n => n.name?.toLowerCase() == 'førstdatafangstdato')
            ?.value,
        ),
        valid: true,
      },
    ];
    this.id = new FeatureComplexNode('identifikasjon', idNodes, false);
  }

  getDateUploadFormatted(
    date?: Date,
    hourIncrement?: number,
    addSeconds?: number,
  ): string {
    let t = date ?? new Date(Date.now());

    let iso;

    const addZeroIfMissing = (num: number): string => {
      const numberString = num.toString();

      if (numberString.length == 1) {
        return '0' + numberString;
      } else {
        return numberString;
      }
    };

    if (date == undefined) {
      if (addSeconds) {
        t = new Date(t.getTime() + addSeconds * 1000);
      }
      const offsetMs = t.getTimezoneOffset() * 60 * 1000;
      const msLocal = t.getTime() - offsetMs;
      const dateLocal = new Date(msLocal);
      iso = dateLocal.toISOString();
      const isoLocal = iso.slice(0, 19);
      return isoLocal;
    } else {
      const customISOString =
        date.getFullYear().toString() +
        '-' +
        addZeroIfMissing(date.getMonth() + 1) +
        '-' +
        addZeroIfMissing(date.getDate()) +
        'T' +
        addZeroIfMissing(date.getHours()) +
        ':' +
        addZeroIfMissing(date.getMinutes()) +
        ':' +
        addZeroIfMissing(date.getSeconds());
      return customISOString;
    }
  }

  onApproveForPublishing() {
    /// Do dependency check, disable nodes that depends on a value which is not present

    if (this.dbAction != UpdateAction.erase)
      for (const node of this.nodes) {
        if (node.dependency != undefined) {
          if (node.dependency?.dependsOnNodeName == 'ledelinje') {
            if (
              node.dependency?.dependsOnNode?.value == undefined ||
              node.dependency?.dependsOnNode?.value?.toLowerCase() == 'ingen'
            )
              node.value = undefined;
          } else if (node?.dependency?.dependsOnValue?.includes(',')) {
            const values = node.dependency?.dependsOnValue?.split(',');

            let hasMatch = false;
            for (const val of values) {
              if (val?.trim() == node.dependency?.dependsOnNode?.value) {
                hasMatch = true;
              }
            }
            if (hasMatch == false) {
              node.value = undefined;
            }
          }
          /// This is where the dependency? value comparison takes place.
          else if (
            node.dependency?.dependsOnNode!.value?.toLowerCase() !=
            node.dependency?.dependsOnValue?.toLowerCase()
          ) {
            node.value = undefined;
          }
        }
      }

    // Remove unused properties
    this.nodes = this.nodes.filter(node => node.value != undefined);

    /// Add missing properties
    if (!this.nodes.find(e => e.name == 'kommune'))
      this.nodes.push(
        new FeatureNode(
          'kommune',
          this.nodes.find(element => element.name == 'kommReel')?.value,
          true,
        ),
      );

    if (!this.nodes.find(e => e.name == 'opphav'))
      this.nodes.push(
        new FeatureNode(
          'opphav',
          'nåværende_bruker',

          true,
        ),
      );

    const dateNow = new Date(this.getDateUploadFormatted());

    if (this.dbAction == UpdateAction.create) {
      if (!this.nodes.find(e => e.name == 'førsteDatafangstdato')) {
        this.nodes.push(new FeatureNode('førsteDatafangstdato', dateNow, true));
      }
    } else {
      const alteredAtDateNode = this.nodes.find(
        e => e.name?.toLowerCase() == 'datafangstdato',
      );

      if (alteredAtDateNode != undefined) {
        alteredAtDateNode!.value = dateNow;
      } else {
        const alteredAtNode = new FeatureNode('datafangstdato', dateNow, true);

        this.nodes.push(alteredAtNode);
      }
    }
  }
}

type PlausibilityValidation =
  | {
      min: number;
      max: number;
      type: string;
    }
  | undefined;

export type FeatureNodeDependency = {
  dependsOnNode?: FeatureNode;
  dependsOnNodeName: string;
  dependsOnValue: string;
};

export class FeatureNode {
  name: string;
  value: any;
  valid: boolean;
  validationType?:
    | XsdSimpleType
    | XsdComplexType
    | XsdPrimitiveType
    | GmlSupportedTypes;
  xsdElement?: XsdComplexTypeElement;
  plausibilityValidation?: PlausibilityValidation;
  dependency?: FeatureNodeDependency;
  required?: boolean;
  filterMinMaxAllowance?: {
    min: number;
    max: number;
  };

  constructor(
    name: string,
    value: any,
    valid: boolean,
    validationType?: XsdPrimitiveType,
    xsdElement?: XsdComplexTypeElement,
    plausibilityValidation?: PlausibilityValidation,
    dependency?: FeatureNodeDependency,
    required?: boolean,
  ) {
    this.name = name;
    this.value = value;
    this.valid = valid;
    this.validationType = validationType;
    this.xsdElement = xsdElement;
    this.plausibilityValidation = plausibilityValidation;
    this.dependency = dependency;
    this.required = required;
  }
}

type AvailabilityFilterNode = {
  wheelchair: Map<string, boolean>;
  electricWheelChair: Map<string, boolean>;
  isApplied: boolean;
};

export class AvailabilityAssessmentNode {
  complexNode?: FeatureComplexNode;
  filterNode?: AvailabilityFilterNode;

  constructor(
    complexNode?: FeatureComplexNode,
    filterNode?: AvailabilityFilterNode,
  ) {
    this.complexNode = complexNode;
    this.filterNode = filterNode;
  }
}

export class FeatureComplexNode {
  name: string;
  nodes: FeatureNode[];
  required: boolean;

  constructor(name: string, nodes: FeatureNode[], required: boolean) {
    this.name = name;
    this.nodes = nodes;
    this.required = required;
  }
}

const getComplexNodes = (
  doc: XMLDocument,
  objectTypeName: string,
  schema: SosiSchema,
): FeatureNode[] => {
  const objectType = schema.getObjectTypeByName(objectTypeName)!!;

  const fields: FeatureNode[] = [];

  // TODO: Improve and handle ramp and stair childnodes

  let docElement = doc.getElementsByTagName('app:' + objectTypeName)[0]
    .children[0];

  if (docElement)
    for (var i = 0; i < docElement.children.length; i++) {
      const element = docElement.children[i];

      const elementName = element.tagName.substring(4);

      const correspondingXSDElement = objectType.elements.find(
        e => e.name?.toLowerCase() == elementName?.toLowerCase(),
      )!;

      fields.push(
        new FeatureNode(
          correspondingXSDElement.name,
          element.textContent,
          true,
          correspondingXSDElement.type as XsdPrimitiveType,
          correspondingXSDElement,
          getPlausibilityValidation(
            objectTypeName,
            correspondingXSDElement.name,
          ),
        ),
      );
    }

  return fields;
};

const getLatLngList = (doc: XMLDocument): LatLng[] => {
  const pos = doc.getElementsByTagName('GML:POSLIST')[0];
  let latLngAsString;
  if (pos.textContent !== null) latLngAsString = pos.textContent.split(' ');

  const coords: LatLng[] = [];

  for (var i = latLngAsString.length + 1; i >= 2; i--) {
    if (i % 2 == 0) {
      const lat = Number(latLngAsString[i - 2]);
      const long = Number(latLngAsString[i - 1]);

      const formattedPoint: LatLng = proj4('EPSG:25832', 'EPSG:4326', [
        lat,
        long,
      ]);

      coords.push(formattedPoint);
    }
  }
  return coords;
};

export const getObjectGeometryType = (
  schema?: SosiSchema,

  objectTypeName?: string,

  type?: string,
): GeoType => {
  if (type) {
    switch (type?.toLowerCase()) {
      case 'point':
        return GeoType.point;

      case 'linestring':
        return GeoType.lineString;

      case 'polygon':
        return GeoType.polygon;
    }
  }

  if (objectTypeName) {
    if (!schema) schema = getSchema();

    const objectType = schema.getObjectTypeByName(objectTypeName)!!;

    let geoType = objectType.getElement('geometri')?.type.toString();

    if (!geoType) {
      geoType = objectType.getElement('grense')?.type.toString();
    }

    if (!geoType) {
      throw 'GeoType undefined at getGeoType';
    } else if (geoType.includes('Point')) return GeoType.point;
    else if (geoType.includes('Curve')) return GeoType.lineString;
    else if (geoType.includes('Surface')) return GeoType.polygon;
  }
  throw 'GeoType could not be set';
};

export function getPlausibilityValidation(
  objectType: string,
  elementName: string,
): PlausibilityValidation {
  let plausibilityElement;
  try {
    plausibilityElement = plausibility[objectType][elementName];
  } catch (error) {}

  let plausibilityValidation: PlausibilityValidation;
  if (plausibilityElement) {
    if (
      plausibilityElement.min == undefined ||
      plausibilityElement.max == undefined ||
      plausibilityElement.type == undefined
    ) {
      throw 'min or max plausiblity undefined';
    }
    return (plausibilityValidation = {
      min: plausibilityElement.min,
      max: plausibilityElement.max,
      type: plausibilityElement.type,
    });
  }
}

export function getDependencyForFeatureNode(
  objectType: string,
  elementName: string,
): FeatureNodeDependency | undefined {
  let dependencyElement;

  try {
    dependencyElement = dependecies[objectType][elementName];
  } catch (e) {}

  if (dependencyElement != undefined) {
    return {
      dependsOnNodeName: dependencyElement.dependsOn,
      dependsOnValue: dependencyElement.dependsOnValue,
    };
  }

  return undefined;
}

export function getRequiredForFeatureNode(
  objectType: string,
  elementName: string,
): boolean {
  try {
    return requiries[objectType][elementName];
  } catch (e) {}

  return false;
}

function getImageId(feature: FeatureMember, addSeconds?: number): string {
  const dateString = feature
    .getDateUploadFormatted(undefined, undefined, addSeconds)
    .replaceAll('-', '')
    .replaceAll('T', '')
    .replaceAll(':', '');

  const municipality = feature.getNodeInstance('kommune')!.value;

  if (!municipality) throw 'Municipality cant be undefined';

  const imageUploadId = municipality + '_' + feature.type! + '_' + dateString;

  return imageUploadId;
}

function formatSingleChar(value: String): String {
  if (value.length == 1) return '0' + value;
  else return value;
}

function textContentToEPSG4326Position(text: string): LatLng {
  proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs');

  proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs ');

  const coords = text.split(' ');

  let parsedCoords: number[] = [];
  if (coords)
    for (let coord of coords) {
      parsedCoords.push(Number(coord));
    }

  return proj4('EPSG:25832', 'EPSG:4326', [parsedCoords[0], parsedCoords[1]]);
}

export function getFeatureNodeValueWithDataType(
  node: FeatureNode,
  sosiElement,
): any {
  let nodeValue: any = node?.value;

  if (!nodeValue || nodeValue == '') {
    return undefined;
  }

  if (!node.validationType) {
    node.validationType = sosiElement?.elements.find(
      element => element.name == node.name,
    )?.type as XsdPrimitiveType;
  }

  switch (node.validationType as XsdPrimitiveType) {
    case 'string': {
      break;
    }
    case 'double': {
      const val: number = Number(nodeValue);

      nodeValue = val;

      break;
    }
    case 'integer': {
      nodeValue = Number(nodeValue);
      break;
    }
  }
  return nodeValue;
}

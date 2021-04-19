import { FeatureMember } from './FeatureMember';
import { getSchema } from '../../sosi/schema_impl';
import { SosiSchema } from '../../sosi/schema';

type LatLng = [number, number];

type MapBounds = {
  lowerRightCorner: LatLng;
  upperLeftCorner: LatLng;
};

export class FeatureCollection {
  featureBounds?: MapBounds;
  crs_EPSG?: Number;
  featureMembers: FeatureMember[];
  schema?: SosiSchema;
  constructor(xmlAsText?: string) {
    if (xmlAsText && this.assertNotEmpty(xmlAsText)) {
      let parser = new DOMParser();

      let xmlDoc = parser.parseFromString(
        xmlAsText,
        'text/html',
      ) as XMLDocument;

      this.schema = getSchema();

      // this.featureBounds = this.getFeatureBounds(xmlDoc);
      this.crs_EPSG = this.getCrsEPSG(xmlDoc);
      this.featureMembers = this.getFeatureMembers(xmlDoc);
    } else {
      this.featureMembers = [];
    }
  }

  assertNotEmpty(xmlAsText: string): boolean {
    if (!xmlAsText.toLowerCase().includes('featuremember')) return false;
    else return true;
  }

  getFeatureBounds(doc: XMLDocument): MapBounds {
    const lowerCorner = doc.getElementsByTagName('GML:LOWERCORNER');
    const upperCorner = doc.getElementsByTagName('GML:UPPERCORNER');

    return {
      lowerRightCorner: parseCorner(lowerCorner),
      upperLeftCorner: parseCorner(upperCorner),
    };
  }

  getCrsEPSG(doc: XMLDocument): number {
    const envelope = doc.getElementsByTagName('GML:Envelope');

    const envelopeValue = envelope[0].outerHTML;

    const startIndex = envelopeValue.indexOf('::');

    const crs_EPSG = envelopeValue.substring(
      startIndex + 2,
      envelopeValue.indexOf('"', startIndex + 1),
    );
    return parseInt(crs_EPSG);
  }

  getFeatureMembers(doc: XMLDocument): FeatureMember[] {
    let parser = new DOMParser();

    const lines = doc.all;

    var xmlFeatureCollectionWrapper;

    const xmlFeatureCollectionClosure: string = '</gml:FeatureCollection>';

    const xmlDocs: XMLDocument[] = [];

    for (let i = 0; i < lines.length; i++) {
      let doc: XMLDocument | null = null;

      const line = lines[i];

      if (!xmlFeatureCollectionWrapper)
        if (line.tagName === 'GML:FEATURECOLLECTION') {
          xmlFeatureCollectionWrapper = line.outerHTML.substring(
            0,
            line.outerHTML.indexOf('>') + 1,
          );

          console.log(xmlFeatureCollectionWrapper);
        }

      if (line.tagName === 'GML:FEATUREMEMBER') {
        const wrappedFeatureMember =
          xmlFeatureCollectionWrapper +
          line.outerHTML +
          xmlFeatureCollectionClosure;
        doc = parser.parseFromString(
          wrappedFeatureMember,
          'text/html',
        ) as XMLDocument;
        xmlDocs.push(doc);
      }
    }

    const members: FeatureMember[] = [];

    for (let doc of xmlDocs) {
      const friluftGrense = doc.getElementsByTagName(
        'app:FriluftParkeringsområdeGr',
      );
      const tettstedGrense = doc.getElementsByTagName(
        'app:TettstedParkeringsområdeGr',
      );
      const friluftFriluftGrense = doc.getElementsByTagName(
        'app:FriluftFriluftomrGr',
      );
      const friluftStSikrFriluftGrense = doc.getElementsByTagName(
        'app:FriluftStSikrFriluftomrGr',
      );
      if (
        friluftGrense.length > 0 ||
        tettstedGrense.length > 0 ||
        friluftFriluftGrense.length > 0 ||
        friluftStSikrFriluftGrense.length > 0
      ) {
        continue;
      }

      members.push(new FeatureMember(doc, this.schema));
    }

    return members;
  }
}

const parseCorner = (element: any): LatLng => {
  const latLngText = element[0].innerText.split(' ');
  const lat = parseFloat(latLngText[0]);
  const long = parseFloat(latLngText[1]);
  return <LatLng>[lat, long];
};

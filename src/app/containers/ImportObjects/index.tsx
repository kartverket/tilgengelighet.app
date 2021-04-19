import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, Card, createStyles } from '@material-ui/core';
import CardContent from '@material-ui/core/CardContent';
import CustomButton from '../../components/ImportObjects/CustomButton';
import CustomSwitch from '../../components/ImportObjects/Switch';
import proj4 from 'proj4';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import CircularProgress from '@material-ui/core/CircularProgress';
import { LatLngBounds, LatLng } from 'leaflet';
import { DataContext } from '../HomePage';
import { FeatureCollection } from 'app/model/FeatureCollection';
import { FeatureMember } from 'app/model/FeatureMember';
import ObjectSelector, {
  ObjectCategory,
  ObjectSelectorType,
} from 'app/components/ObjectSelector';
import {
  FeatureQuery,
  getFeatureCollection,
  UpdateAction,
} from 'app/providers/DataProvider';
import Container from 'app/components/H1/Container';
import { ImportArea } from 'app/components/ImportArea';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { random } from 'lodash';
import { TopBar } from 'app/components/ImportObjects/TopBar';

const useStyles = makeStyles(() =>
  createStyles({
    infoText: {
      padding: '15px 20px 0 15px',
      fontFamily: 'Arial',
      fontSize: '14px',
      lineHeight: '20px',
    },
    cardContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: '16px',
      lineHeight: '24px',
      marginTop: '6px',
    },
    cardText: {
      fontFamily: 'Arial',
      fontSize: '14px',
      lineHeight: '20px',
      color: 'rgba(0, 0, 0, 0.6)',
      width: '80%',
    },
    cardButton: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: '14px',
      lineHeight: '16px',
      color: '#fff',
      backgroundColor: 'rgb(26, 88, 159)',
      padding: '12px 17px',
      '&:hover': {
        color: 'rgb(26, 88, 159)',
      },
    },
    card: {
      marginBottom: '16px',
    },
    cardContent: {
      paddingBottom: '0 !important',
    },
    checkboxH3: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: '16px',
      lineHeight: '24px',
      color: 'rgba(0, 0, 0, 0.87)',
      margin: 0,
    },
    flexCheckbox: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingRight: '10px',
    },
  }),
);

interface ImportObjectProps {
  onPop: () => void;
}

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs');

proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs ');

export function ImportObjects(props: ImportObjectProps) {
  const { t } = useTranslation();

  const classes = useStyles();

  const [includePhotos, setIncludePhotos] = React.useState<boolean>(false);

  const [errorMessage, setErrorMessage] = React.useState<string>();

  const { importStandbyObjects } = useContext(DataContext);

  const [showImportArea, setImportArea] = React.useState<boolean>(false);

  const [isLoading, setLoading] = React.useState<boolean>(false);

  const [featureCollection, setFeatureCollection] = React.useState<
    FeatureCollection
  >();

  const [importedObjectList, setImportedObjectList] = React.useState<
    FeatureMember[]
  >([]);

  const onCategoryCheckChanged = (categories: ObjectCategory[]) => {
    console.log(categories);

    if (featureCollection?.featureMembers) {
      const objectsToExcludeByName: String[] = [];

      for (let category of categories) {
        if (category.name === 'Sittegruppe' && category.checked === false) {
          objectsToExcludeByName.push('sittegruppe');
        } else {
          for (let subCat of category.subCategories) {
            if (subCat.checked === false)
              objectsToExcludeByName.push(subCat.type.toLowerCase());
          }
        }
      }

      console.log(objectsToExcludeByName);

      const proxyObjectList: FeatureMember[] = [];

      for (let member of featureCollection.featureMembers) {
        const objectName = member.type;

        if (!objectsToExcludeByName.includes(objectName!.toLowerCase())) {
          proxyObjectList.push(member);
        }
      }

      setImportedObjectList(proxyObjectList);
    }
  };

  const onSelectImportArea = (bounds: LatLngBounds) => {
    if (!bounds) throw 'Bounds are undefined';

    setLoading(true);

    const northWest: LatLng = bounds.getNorthWest();
    const southEast: LatLng = bounds.getSouthEast();

    const upperLeftCorner = proj4('EPSG:25832', [northWest.lng, northWest.lat]);
    const lowerRightCorner = proj4('EPSG:25832', [
      southEast.lng,
      southEast.lat,
    ]);

    const bbox = [
      lowerRightCorner[0],
      lowerRightCorner[1],
      upperLeftCorner[0],
      upperLeftCorner[1],
    ];

    setQuery({ ...query, bbox: bbox });
    query.bbox = bbox;
    fetchData();
  };

  const [query, setQuery] = React.useState<FeatureQuery>({
    // The current dimensions the featureQuery will be bounded by
    bbox: [],
    datasetId: '4fe98cda-09cb-483d-bbe0-7d9f229fb5d7',
    includeImages: includePhotos,
  });

  const fetchData = async () => {
    var collection: any = await getFeatureCollection(query);

    setLoading(false);

    if (collection instanceof FeatureCollection) {
      setFeatureCollection(collection);
      setImportedObjectList(collection.featureMembers);
    } else if (collection?.length) {
      console.log(collection);
      setErrorMessage(collection);
    }
  };

  if (showImportArea)
    return (
      <ImportArea
        onPop={() => setImportArea(false)}
        onSelect={bounds => onSelectImportArea(bounds)}></ImportArea>
    );
  else
    return (
      <Container>
        <TopBar
          onPop={props.onPop}
          title={t(translations.importObjects.importObjectsButton)}
        />
        <p className={classes.infoText}>
          {' '}
          {t(translations.importObjects.infoText)}
        </p>
        <Card className={classes.card}>
          <CardContent style={{ marginTop: '4px', padding: '10px 15px' }}>
            <span className={classes.cardContainer}>
              <h2 className={classes.cardTitle}>
                {'1. '}
                {t(translations.importObjects.importAreaTitle)}
              </h2>
              {isLoading ? (
                <CircularProgress style={{ color: 'rgb(26, 88, 159)' }} />
              ) : (
                <Button
                  onClick={() => {
                    setErrorMessage(undefined);
                    setImportArea(true);
                  }}
                  classes={{ root: classes.cardButton }}>
                  {featureCollection?.featureMembers.length
                    ? t(translations.importObjects.changeImportArea)
                    : t(translations.importObjects.chooseImportArea)}
                </Button>
              )}
            </span>
            {importedObjectList?.length ||
            featureCollection?.featureMembers.length ? (
              <div
                style={{
                  color: '#1A589F',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                <InfoIcon />

                <a
                  style={{
                    fontSize: '12.23px',
                    letterSpacing: '0.4px',
                    fontFamily: 'Arial',
                    paddingLeft: '10px',
                  }}>
                  {importedObjectList.length.toString()}
                  {'  '}
                  {t(translations.importObjects.objectChoosenText)}
                </a>
              </div>
            ) : null}
            {errorMessage ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}>
                <a
                  style={{
                    color: '#B00020',
                    fontSize: '12.23px',
                    letterSpacing: '0.4px',
                    fontFamily: 'Arial',
                  }}>
                  {errorMessage}
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2 className={classes.cardTitle}>
                {'2. '}
                {t(translations.importObjects.includeImagesTitle)}
              </h2>
              <span style={{ padding: '0 15px' }}>
                <CustomSwitch
                  checked={includePhotos}
                  onChange={val => {
                    query.includeImages = val;
                    setIncludePhotos(val);
                  }}
                />
              </span>
            </span>
            <p className={classes.cardText}>
              {' '}
              {t(translations.importObjects.includeImagesContent)}
            </p>
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <h2 className={classes.cardTitle}>
              {'3. '}
              {t(translations.importObjects.chooseObjects)}
            </h2>
            <ObjectSelector
              type={ObjectSelectorType.import}
              onCheckChanged={(categories: ObjectCategory[]) =>
                onCategoryCheckChanged(categories)
              }></ObjectSelector>
            <div style={{ height: 16 }}></div>
          </CardContent>
        </Card>
        <div
          id="buttonWrapper"
          style={{
            padding: '20px 16px 16px 16px',
            position: 'relative',
            bottom: '10px',
            width: '100%',
            backgroundColor: '#F5F5F5',
          }}>
          <label htmlFor="icon-button-file-mobile" style={{ width: '100%' }}>
            <CustomButton
              style={{
                backgroundColor:
                  importedObjectList.length > 0 ? ' ' : 'lightgrey',
              }}
              onClick={() => {
                if (
                  importStandbyObjects &&
                  importedObjectList.length > 0 &&
                  featureCollection
                ) {
                  featureCollection.featureMembers = importedObjectList;
                  importStandbyObjects(featureCollection, query.includeImages);
                  props.onPop();
                }
              }}
              label={t(translations.importObjects.importObjectsButton)}
              component="span"
            />
          </label>
        </div>
      </Container>
    );
}

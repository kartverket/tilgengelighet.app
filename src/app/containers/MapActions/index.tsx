import React, { useContext, useState } from 'react';
import Search from '../../components/Map/Search';
import { Map as LeafletMap } from 'react-leaflet';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';
import ContentContainer from '../../components/Map/ContentContainer';
import ObjectButton from '../../components/Map/ObjectButton';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
// import messages from '../messages';
// import {FormattedMessage} from 'react-intl';
import ObjectViewCard from '../../components/Map/ObjectViewCard';
import { Sidebar } from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { useMediaQuery, IconButton, Tooltip } from '@material-ui/core';
import SideBarDesktop from '../../components/Map/SideBarDesktop';
import { mapLayers } from '../../constants/layer.url.constants';
import RightButtonPanel from '../../components/Map/RightButtonPanel';
import { mapDefaultCenter } from '../../constants/map.constants';
import { ImportObjects } from '../../containers/ImportObjects/Loadable';
import {
  DataContext,
  ContextProps,
  ShowObjectsByColorType,
} from '../../containers/HomePage';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import { FeatureMember, getObjectGeometryType } from 'app/model/FeatureMember';
import ActualMap, {
  LatLng,
  notCreating,
  restoreLayer,
  restoreLatLng,
  selectedLayer,
  genId,
} from 'app/components/ActualMap';
import ObjectSelector, {
  ObjectSelectorType,
} from 'app/components/ObjectSelector';
import ObjectEditor from '../ObjectEditor';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import L from 'leaflet';

import { XsdPrimitiveType } from '../../../sosi/xsd';
import TooltipCard from '../../components/TooltipCard';
//import IconTextCard from "../../components/IconTextCard";
import { DrawUtil } from '../../utils/DrawUtil';
import { MapObjectFilter } from 'app/components/MapObjectFilter';
import 'leaflet.restoreview';
import { DarkToolTip } from '../../components/CustomToolTip';
import { LatLngBounds, LayerGroup } from 'leaflet';
import proj4 from 'proj4';
import { getFeatureCollection, UpdateAction } from 'app/providers/DataProvider';
import { FeatureCollection } from 'app/model/FeatureCollection';
import { getParsedFeatureMember } from 'app/providers/LocalStorageProvider';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    objectButtons: {
      display: 'flex',
    },
    sideButtons: {
      position: 'absolute',
      right: '15px',
      display: 'flex',
      flexDirection: 'column',
      [theme.breakpoints.up('md')]: {
        top: 'calc(100vh - 200px)',
      },
      [theme.breakpoints.down('sm')]: {
        top: '130px',
      },
    },
    bottomCard: {
      position: 'fixed',
      bottom: 0,
      width: '100%',
      zIndex: 1000,
    },
    hide: {
      display: 'none',
      visibility: 'hidden',
    },
    layerPreview: {
      '& .MuiIconButton-label': {
        border: '3px solid white',
        borderRadius: '6px',
      },
    },

    menuWrapper: {
      '& .MuiPaper-rounded': {
        borderRadius: '8px',
      },
    },
    menuList: {},
    fab: {
      position: 'fixed',
      zIndex: 300,
      height: '56px',
      width: '56px',
      bottom: '20px',
      right: '16px',
      backgroundColor: '#1A589F',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      '&:hover': {
        backgroundColor: '#e4e4e4',
      },
      '& .MuiIconButton-label': { height: '15px' },
    },
  }),
);

export enum GeoType {
  point = 'Point',
  lineString = 'LineString',
  polygon = 'Polygon',
}

export type ObjectProps = {
  type: string;
  name: string;
  id?: string;
  geoType?: GeoType;
  coordinates?: any;
  copy?: FeatureMember;
};

export type EPSGGeometry = {
  type: GeoType;
  coordinates: any;
  representationPoint?: LatLng;
};

export type PolygonLayerCoordinates = {
  coordinates: LatLng[];
  representationPoint: LatLng;
};

export enum RegistrationStep {
  initial,
  selectObjectType,
  drawObject,
  editObjectProperties,
  editObjectGeometry,
  selectEditMode,
}

interface Props {
  initRegistration?: boolean;
  showObjectsByColorType: ShowObjectsByColorType;
  setShowObjectsByColorType: (type: ShowObjectsByColorType) => void;
}

let stepVar = RegistrationStep.initial;

export function MapActions(props: Props) {
  const { t } = useTranslation();

  const classes = useStyles();
  const theme = useTheme();

  const {
    onImportClicked,
    onInitReg,
    importStandbyObjects,
    saveData,
  } = useContext(DataContext);

  const [open, setOpen] = useState(false);
  const [showObjectOpened, setShowObjectStatus] = useState<boolean>(false);

  const [registerChosen, setRegisterStatus] = useState<boolean>(() =>
    props.showObjectsByColorType == ShowObjectsByColorType.registration
      ? true
      : false,
  );

  const handleOnClickRegistrationStatus = () => {
    if (registerChosen != true) {
      props.setShowObjectsByColorType!(ShowObjectsByColorType.registration);
      setRegisterStatus(true);
    } else {
      props.setShowObjectsByColorType!(ShowObjectsByColorType.accessibility);
      setRegisterStatus(false);
    }
  };

  const [showFilter, setShowFilter] = useState<boolean>(false);

  const [step, setStep] = useState<RegistrationStep>(
    props.initRegistration
      ? RegistrationStep.selectObjectType
      : RegistrationStep.initial,
  );

  // Indicates wether a new registration is on going
  const [newRegActive, setNewRegActive] = useState<boolean>(
    props.initRegistration ?? false,
  );

  const [objectProps, setObjectProps] = useState<ObjectProps>({
    name: '',
    type: '',
  });

  const [featureMember, setFeatureMember] = useState<FeatureMember>();

  const [showInfoOpened, setShowInfoStatus] = useState<boolean>(false);

  const [positionLoadingState, setPositionLoadingState] = useState<boolean>(
    false,
  );

  const [importObjectErrorMsg, setImportObjectErrorMsg] = useState<string>();

  const [loadingObjectImport, setLoadingObjectImport] = useState<boolean>(
    false,
  );
  const [chosenLayer, setMapLayer] = useState(mapLayers[0]);

  const [position, setPosition] = useState<[number, number]>([
    63.430515,
    10.395053,
  ]);

  const [myPosition, setMyPosition] = useState<[number, number] | null>(null);

  const [searchPosition, setSearchPosition] = useState<any>(null);

  const [, updateState] = useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  //Helper function to set registration step to State AND variable (State does not update when needed)

  const setRegStep = (step: RegistrationStep) => {
    if (step === RegistrationStep.initial) {
      if (newRegActive) setNewRegActive(false);
    }
    stepVar = step;
    setStep(stepVar);
  };

  const toggle = () => setOpen(!open);

  const mapRef = React.createRef<LeafletMap>();

  const onObjectSelected = (props: ObjectProps) => {
    props.geoType = getObjectGeometryType(undefined, props.type, undefined);

    /// Duplicate copied feature
    if (props.copy != undefined) {
      const parsedFeature = props.copy.toLocalStorageFormatted(false);

      const duplicate = getParsedFeatureMember(parsedFeature);

      duplicate.id = undefined;
      duplicate.images = [];
      duplicate.localId = genId();
      duplicate.isDuplicate = true;
      duplicate.editedByUser = true;
      duplicate.dbAction = UpdateAction.create;
      duplicate.geometry = undefined;

      duplicate.nodes.find(
        n => n.name?.toLowerCase() == 'førstedatafangstdato',
      )!.value = new Date(Date.now());

      /// Handle objectNumber removal
      duplicate.nodes = duplicate.nodes.filter(n => {
        if (n.name?.toLowerCase() == 'objektnr') return false;
        else return true;
      });

      props.copy = duplicate;
    }

    setObjectProps(props);
    setNewRegActive(true);
    setRegStep(RegistrationStep.drawObject);
  };

  const onObjectDrawnConfirm = (
    coordinates: LatLng | LatLng[] | PolygonLayerCoordinates,
    id: string,
  ) => {
    if (objectProps) {
      objectProps.coordinates = coordinates;
      objectProps.id = id;
    }
    setRegStep(RegistrationStep.editObjectProperties);
  };

  const zoomIn = () => {
    mapRef.current?.leafletElement.zoomIn();
  };
  const zoomOut = () => {
    mapRef.current?.leafletElement.zoomOut();
    console.log(mapRef.current);
  };
  const setRegistrationStepInitial = () => {
    if (newRegActive) setNewRegActive(false);
    setRegStep(RegistrationStep.initial);
    //DrawUtil.deleteLayer(mapRef, selectedLayer, features)
  };

  React.useEffect(() => {
    if (myPosition) {
      mapRef?.current?.leafletElement.setView(myPosition, 16);
    }
  }, [myPosition]);

  const centerToLocation = () => {
    if (navigator.geolocation) {
      setPositionLoadingState(true);
      navigator.geolocation.getCurrentPosition(
        currentLocation => {
          setMyPosition([
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
          ]);
          setPositionLoadingState(false);
        },
        error => {
          console.log(error);
          setPositionLoadingState(false);
        },
      );
    }
  };

  React.useEffect(() => {
    setNewRegActive(newRegActive);

    if (props.initRegistration) {
      setRegStep(RegistrationStep.selectObjectType);
      setNewRegActive(true);
    }
  }, [newRegActive]);

  //Center to location if no stored position
  React.useEffect(() => {
    //@ts-ignore
    if (!mapRef.current?.leafletElement.restoreView()) {
      centerToLocation();
    }
  }, []);

  const onLayerSelected = () => {
    console.log('on layer selected');
    console.log('step is:');
    console.log(step);
    console.log(stepVar);
    // stepVar !== RegistrationStep.selectEditMode &&
    if (
      step !== RegistrationStep.drawObject &&
      stepVar !== RegistrationStep.editObjectGeometry &&
      newRegActive == false
    ) {
      //TODO: prevent edititing to enable if in dreate mode or editing mode (edit card pops up for no reason)
      // New reg canceled
      if (newRegActive) setNewRegActive(false);
    }
  };

  const onEditFeatureProps = (featureMember: FeatureMember) => {
    setFeatureMember(featureMember);

    setRegStep(RegistrationStep.editObjectProperties);
  };

  const handleObjectImport = async () => {
    setLoadingObjectImport(true);
    setImportObjectErrorMsg(undefined);

    const map = mapRef?.current;
    if (map != null) {
      const bounds: LatLngBounds = map.leafletElement.getBounds();
      console.log(bounds);

      if (!bounds) throw 'Bounds could not be selected';

      const northWest = bounds.getNorthWest();
      const southEast = bounds.getSouthEast();

      const upperLeftCorner = proj4('EPSG:25832', [
        northWest.lng,
        northWest.lat,
      ]);
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
      var collection: any = await getFeatureCollection({
        bbox: bbox,
        datasetId: '4fe98cda-09cb-483d-bbe0-7d9f229fb5d7',
        includeImages: false,
      });

      setLoadingObjectImport(false);

      if (collection instanceof FeatureCollection) {
        importStandbyObjects!(collection, false);
        forceUpdate();
      } else if (collection?.length) {
        console.log(collection);
        setImportObjectErrorMsg(collection);
      }
    }
  };

  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  let objectEditor;

  let objectSelector;

  let objectFilter;

  if (step === RegistrationStep.selectObjectType || props.initRegistration) {
    objectSelector = (
      <ObjectSelector
        type={ObjectSelectorType.select}
        onPop={() => {
          setRegistrationStepInitial();
          if (props.initRegistration) onInitReg!(false);
        }}
        onSelect={objectProps => {
          onObjectSelected(objectProps);
          if (props.initRegistration) onInitReg!(false);
        }}></ObjectSelector>
    );

    // if (smallScreen) return objectSelector;
  } else if (step === RegistrationStep.editObjectProperties) {
    objectEditor = (
      <ObjectEditor
        onConfirm={() => {
          if (!newRegActive) {
            setRegStep(RegistrationStep.selectEditMode);
          } else {
            mapRef.current?.leafletElement.removeLayer(selectedLayer);
            setRegStep(RegistrationStep.initial);
          }

          setNewRegActive(false);
          setFeatureMember(undefined);
          notCreating();
          // if (!isCreating) {
          //   setRegStep(RegistrationStep.selectEditMode)
          // }
        }}
        onPop={() => {
          if (!newRegActive) {
            if (restoreLayer) {
              if (!(restoreLayer instanceof L.Polyline)) {
                restoreLayer.setLatLng(restoreLatLng);
                notCreating();
              } else {
                restoreLayer.setLatLngs(restoreLatLng);
                notCreating();
              }
            }
            setRegStep(RegistrationStep.selectEditMode);
          } else {
            setRegStep(RegistrationStep.initial);
            DrawUtil.deleteLayer(mapRef, selectedLayer);
            //DrawUtil.editLayer(selectedLayer, snapping);
            //selectedLayer.pm.enable()
            notCreating(true);
            setFeatureMember(undefined);
          }
          setFeatureMember(undefined);
        }}
        objectProps={objectProps}
        featureMember={featureMember}
        getFeatureMember={member => setFeatureMember(member)}
        isNewReg={newRegActive ?? false}
      />
    );

    //if (smallScreen) return objectEditor;
  }

  if (showFilter && smallScreen == false) {
    objectFilter = (
      <MapObjectFilter onPop={() => setShowFilter(false)}></MapObjectFilter>
    );
  }

  // @ts-ignore
  return (
    <article>
      <div
        style={{
          position: 'fixed',
          zIndex: 300,
          right: '0px',
          padding: '24px',
        }}>
        {step === RegistrationStep.editObjectProperties ? objectEditor : null}
      </div>

      <div
        style={{
          position: 'fixed',
          zIndex: 300,
          left: '-8px',
          top: '-4px',
          padding: '24px',
        }}>
        {step === RegistrationStep.selectObjectType || props.initRegistration
          ? objectSelector
          : null}
      </div>

      <div
        style={{
          position: 'fixed',
          zIndex: 300,
          left: '-8px',
          top: '-4px',
          padding: '24px',
        }}>
        {showFilter ? objectFilter : null}
      </div>

      {open ? <Sidebar onBackdropPressed={toggle} menuIndex={1} /> : null}
      <div onClick={open ? toggle : () => null}>
        <ContentContainer>
          <Search
            menuOnClick={toggle}
            clearPosition={() => setSearchPosition(null)}
            onOptionClick={(e, value) => {
              if (typeof value === 'object' && value !== null) {
                setSearchPosition([value.nord, value.aust]);
                mapRef.current?.leafletElement.setView(
                  [value.nord, value.aust],
                  16,
                );
              }
            }}
          />

          {!smallScreen && (
            <SideBarDesktop
              registerChosen={registerChosen}
              setRegisterStatus={handleOnClickRegistrationStatus}
              showObjectOpened={showObjectOpened}
              setShowInfoStatus={setShowInfoStatus}
              showInfoOpened={showInfoOpened}
              setShowObjectStatus={setShowObjectStatus}
              openFilter={() => setShowFilter(true)}
              loadingObjectImport={loadingObjectImport}
              onObjectImport={() => handleObjectImport()}
              importObjectErrorMsg={importObjectErrorMsg}
            />
          )}

          {smallScreen && (
            <div
              onClick={() => setShowObjectStatus(!showObjectOpened)}
              className={classes.objectButtons}>
              <ObjectButton
                linkTo="#"
                text={t(translations.mapPage.showObjectsText)}
                icon={<ArrowDropDownIcon />}
              />
              <div onClick={() => onImportClicked!()}>
                <ObjectButton text="Importer objekter" />
              </div>
            </div>
          )}
        </ContentContainer>

        <RightButtonPanel
          setMapLayer={setMapLayer}
          chosenLayer={chosenLayer}
          smallScreen={smallScreen}
          loadingState={positionLoadingState}
          centerToLocation={centerToLocation}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
        />
        {showObjectOpened == true && smallScreen ? (
          <span className={classes.bottomCard}>
            <ObjectViewCard
              leftButtonContent={t(translations.mapPage.registerStatus)}
              rightButtonContent={t(translations.mapPage.currentStatus)}
              registerChosen={registerChosen}
              onChange={handleOnClickRegistrationStatus}
            />
          </span>
        ) : null}
        {step === RegistrationStep.initial || !step ? (
          <TooltipCard
            title="Tips"
            content="Bruk to fingre for å navigere, zoome og panorere i kartet."
          />
        ) : null}

        {step === RegistrationStep.initial || !step ? (
          <DarkToolTip
            arrow
            title={t(translations.sidebar.registration).toString()}
            placement="left">
            <IconButton
              style={!smallScreen ? { right: '27px' } : {}}
              id="init-new-registration"
              onClick={() => {
                setRegStep(RegistrationStep.selectObjectType);
                if (showFilter) setShowFilter(false);
              }}
              className={classes.fab}>
              <AddIcon
                style={{
                  color: 'white',
                }}></AddIcon>
            </IconButton>
          </DarkToolTip>
        ) : null}
        {step === RegistrationStep.drawObject &&
        objectProps.geoType === 'LineString' ? (
          <TooltipCard
            title="Tegning av linjer"
            content="Trykk for å legge til et punkt. Trykk på neste ønskede område for å legge til neste punkt. Du vil se at det blir strukket opp en linje mellom dem."
          />
        ) : null}
        {step === RegistrationStep.drawObject &&
        objectProps.geoType === 'LineString' ? (
          <TooltipCard
            title="Tegning av linjer"
            content="Trykk for å legge til et punkt. Trykk på neste ønskede område for å legge til neste punkt. Du vil se at det blir strukket opp en linje mellom dem."
          />
        ) : null}
        {step === RegistrationStep.drawObject &&
        objectProps.geoType === 'Polygon' ? (
          <TooltipCard
            title="Tegning av flater"
            content="Trykk for å legge til et punkt. Trykk på neste ønskede område for å legge til neste punkt. Du vil se at det blir strukket opp en linje mellom dem. Når du har en sluttet form kan du klikke blå sirkel for bekreft."
          />
        ) : null}
        {step === RegistrationStep.drawObject &&
        objectProps.geoType === 'Point' ? (
          <TooltipCard
            title="Tegning av punkt"
            content="Trykk og dra markøren til det ønskede punktet på kartet. Dermed trykk bekreft for å gå videre i registreringen."
          />
        ) : null}
        <ActualMap
          chosenLayer={chosenLayer}
          showObjectsByColorType={props.showObjectsByColorType}
          position={position}
          myPosition={myPosition}
          searchPosition={searchPosition}
          ref={mapRef}
          step={step}
          registrationProps={objectProps}
          onObjectDrawnConfirm={(coordinates, id) =>
            onObjectDrawnConfirm(coordinates, id)
          }
          onEditLayerProperties={doc => onEditFeatureProps(doc)}
          onLayerSelected={() => onLayerSelected()}
          setRegistrationStep={(step: RegistrationStep) => {
            setRegStep(step);
          }}
          setRegistrationStepInitial={() => setRegistrationStepInitial()}
          setPosition={position => setMyPosition(position)}
        />
      </div>
    </article>
  );
}

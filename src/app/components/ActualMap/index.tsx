import { Map as LeafletMap, Marker } from 'react-leaflet';
import React, { useContext, useState } from 'react';
import L, { LatLngExpression } from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '../../utils/leaflet.offline';
import myPositionImage from './myposition.png';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import proj4 from 'proj4';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster.freezable';
import { useMediaQuery } from '@material-ui/core';
import EditToolbar from '../EditToolbar';
import EditCard from '../EditCard';
import { DrawUtil } from '../../utils/DrawUtil';
import useWindowDimensions from 'app/utils/windowDimensions';
import { v4 as uuidv4 } from 'uuid';
import {
  ObjectProps,
  PolygonLayerCoordinates,
  RegistrationStep,
} from 'app/containers/MapActions';
import { mapLayers as MapTileLayer } from 'app/constants/layer.url.constants';
import { DataContext, ShowObjectsByColorType } from 'app/containers/HomePage';
import {
  FeatureMember,
  FeatureNode,
  RegistrationStatus,
} from 'app/model/FeatureMember';
import { GeoJsonTypes } from 'geojson';
import drawTranslation from '../../../locales/no/drawTranslation.json';
import { random } from 'lodash';
import DownloadProgress from '../DownloadProgress';
import { useTheme } from '@material-ui/core/styles';
import ConfirmDownloadCard from '../../ConfirmDownloadCard';
import searchPositionImage from './searchposition.png';
import { XsdPrimitiveType } from 'sosi/xsd';
import '../../utils/leaflet-canvas-markers';
import { LocalStorageProvider } from 'app/providers/LocalStorageProvider';
import './geoman-addon.scss';
import { deleteFeatureMember, UpdateAction } from 'app/providers/DataProvider';
import { Update } from '@material-ui/icons';

export type LatLng = [number, number];

interface Props {
  position?: LatLngExpression;
  searchPosition?: LatLngExpression;
  myPosition?: LatLngExpression | null;
  zoom?: number;
  height?: number;
  chosenLayer?: any;
  onObjectDrawnConfirm: (
    coordinates: LatLng | LatLng[] | PolygonLayerCoordinates,
    id: string,
  ) => void;
  step: RegistrationStep;
  onEditLayerProperties: (feature: FeatureMember) => void;
  registrationProps?: ObjectProps;
  onLayerSelected: () => void;
  setRegistrationStepInitial: () => void;
  setRegistrationStep: (step: RegistrationStep) => void;
  setPosition: (position: [number, number] | null) => void;
  showObjectsByColorType: ShowObjectsByColorType;
}

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs');

proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs ');

const defaultLayer = MapTileLayer[0];

export const MyPositionIcon = new L.Icon({
  iconUrl: myPositionImage,
  iconRetinaUrl: myPositionImage,
  iconSize: [28, 28],
});

export const searchMarkerIcon = new L.Icon({
  iconUrl: searchPositionImage,
  iconRetinaUrl: searchPositionImage,
  iconSize: [50, 50],
});

export let selectedLayer;
let selectedEditMarker;
let workingLayer;
export let restoreLayer;
let currentZoom;
let restoreVertex;
export let restoreLatLng;
let isCreating;
let features: L.GeoJSON;
let tileLayerOffline: null | any = null;
export let controlSaveTiles: null | any = null;
export let snapping;
export const downloadMap = () => {
  controlSaveTiles._saveTiles();
};
let layerWidth = 8;
let iconSize = [26, 26];
let marker;

export const notCreating = (clearSelected?) => {
  if (clearSelected) {
    selectedLayer = null;
  }
  isCreating = false;
  //restoreLayer = null;
  //restoreLatLng = null;
  restoreVertex = null;
  selectedEditMarker = undefined;
};

export default React.forwardRef((props: Props, mapRef: any) => {
  const { height } = useWindowDimensions();

  const mapHeight = props.height ?? height;

  const {
    featureCollection,
    objectFilter,
    mapLayerGroup,
    editObjectId,
    resetEditObjectId,
    rebuildObjectLayerData,
    onDeleteObject,
  } = useContext(DataContext);

  let curves: FeatureMember[] = [];

  let polygons: FeatureMember[] = [];

  let points: FeatureMember[] = [];

  const [selectedLayerState, setSelectedLayerState] = React.useState<any>(null);
  const [isDrawing, setDrawingStatus] = React.useState<boolean>(false);
  const [snapping, setSnapping] = React.useState<boolean>(true);
  const [tooltipState, setTooltipState] = React.useState<boolean>(true);
  const [downloadedTiles, setDownloadedTiles] = React.useState<number>(0);
  const [totalTilesToDownload, setTotalTilesToDownload] = React.useState<
    number
  >(0);
  const [confirmDownloadPopup, setConfirmDownloadPopup] = React.useState(false);

  const [rebuildLayer, setRebuildLayer] = useState<any>();

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [rebuildObjects, setRebuildObjects] = useState<boolean>(true);

  const cancelDownloadMap = () => {
    controlSaveTiles.cancelDownload();
    setTotalTilesToDownload(0);
  };

  let categorizeObjects = () => {
    if (featureCollection?.featureMembers) {
      curves = [];
      polygons = [];
      points = [];

      for (var member of featureCollection?.featureMembers) {
        switch (member.geometry?.type.toLowerCase()) {
          case 'point':
            points.push(member);

            break;
          case 'polygon':
            polygons.push(member);

            break;
          case 'linestring':
            curves.push(member);

            break;
        }
      }
    }
  };

  const filterFeatureMember = (featureMember: FeatureMember): boolean => {
    if (objectFilter!.objects!.size == 0) return true;
    let remove = false;
    if (featureMember == undefined)
      throw 'MEMBER OF LAYER CAN NOT BE UNDEFINED';
    if (objectFilter != undefined) {
      const objectsMap = objectFilter.objects;
      if (objectFilter.apply && objectsMap.size > 0) {
        const filterFeatureMember = objectsMap.get(featureMember.type!);
        /// Handle filter availabilityAssessment
        const availabilityFilterNode =
          filterFeatureMember?.availabilityNode?.filterNode;
        if (
          availabilityFilterNode != undefined &&
          availabilityFilterNode?.isApplied == true
        ) {
          /// Handle wheelchair
          const wheelLayerNode = featureMember.nodes.find(
            e => e.name == 'tilgjengvurderingRulleMan',
          );
          /// Checks if value is allowed
          const filterNodeWheelChairvalue = availabilityFilterNode.wheelchair.get(
            wheelLayerNode?.value ?? 'Ikke valgt',
          );
          if (filterNodeWheelChairvalue == false) {
            return false;
          }
          if (!remove) {
            /// Handle wheelchair
            const elWheelLayerNode = featureMember.nodes.find(
              e => e.name == 'tilgjengvurderingRulleAuto',
            );
            /// Checks if value is allowed
            const value = availabilityFilterNode.electricWheelChair.get(
              elWheelLayerNode?.value ?? 'Ikke valgt',
            );
            if (value == false) {
              return false;
            }
          }
        }
        if (filterFeatureMember != undefined && !remove) {
          /// If filterFeatureMember is applied sort by nodes

          const getFeatureNodesIncludingRampAndStair = (
            feature: FeatureMember,
          ): FeatureNode[] => {
            let nodes = feature.nodes;

            if (feature.rampNode) {
              nodes = nodes.concat(feature.rampNode.nodes);
            }
            if (feature.stairNode) {
              nodes = nodes.concat(feature.stairNode.nodes);
            }
            return nodes;
          };

          for (const filterNode of getFeatureNodesIncludingRampAndStair(
            filterFeatureMember,
          )) {
            if (filterNode.value == undefined) continue;
            const layerNode = getFeatureNodesIncludingRampAndStair(
              featureMember,
            ).find(e => e.name.toLowerCase() == filterNode.name.toLowerCase());
            /// Applied filterNode is not present => remove
            if (layerNode == undefined) {
              return false;
            }
            /// Applied filterNode present => filter on node value
            else {
              /// Filter on min/max if present. If present value will always be a number.
              if (filterNode.filterMinMaxAllowance != undefined) {
                /// Convert value to number for min/max comparison
                let layerNodeValue;
                if (
                  (layerNode.validationType as XsdPrimitiveType) ==
                  XsdPrimitiveType.double
                ) {
                  layerNodeValue = Number.parseFloat(layerNode.value);
                } else if (
                  (layerNode.validationType as XsdPrimitiveType) ==
                  XsdPrimitiveType.integer
                ) {
                  layerNodeValue = Number.parseInt(layerNode.value);
                } else {
                  throw 'NODE VALIDATION TYPE NOT ALLOWED';
                }
                if (
                  layerNodeValue >= filterNode.filterMinMaxAllowance.min &&
                  layerNodeValue <= filterNode.filterMinMaxAllowance.max
                ) {
                } else {
                  return false;
                  break;
                }
              }
              /// Compare string values
              else {
                if (layerNode.value?.length && filterNode.value?.length) {
                  if (
                    layerNode.value.toLowerCase() !=
                    filterNode.value.toLowerCase()
                  ) {
                    return false;
                    break;
                  } else {
                    continue;
                  }
                } else {
                  return false;
                }
              }
            }
          }
        } else if (!objectFilter.objects.has(featureMember.type!)) {
          return false;
        }
      }
    }
    return true;
  };

  const handleEditCard = () => {
    if (selectedLayer && selectedLayer.pm.enabled()) {
      DrawUtil.cancelEditOnLayer(
        mapRef,
        selectedLayer,
        restoreLayer,
        restoreLatLng,
      );
    }
    if (selectedLayer instanceof L.Polyline) {
      selectedLayer.bringToBack();
    }
    removeHiglightFromLayer(selectedLayer);
    selectedLayer = undefined;
    restoreLayer = null;
    props.setRegistrationStep(RegistrationStep.initial);
  };

  const EditObjectProperties = () => {
    const layerId = selectedLayer?.feature?.id;
    //TODO: Generate layerid for new layers
    if (layerId) {
      const member = featureCollection?.featureMembers.find(
        element => element.localId == layerId,
      )!;
      if (member) props.onEditLayerProperties(member);
    }
  };

  const handleClick = () => {
    const map = mapRef.current?.current;
    if (map != null) {
      const bounds = map.leafletElement.getBounds();
    }
  };

  const toggleSnapping = () => {
    if (snapping) {
      setSnapping(false);
      if (selectedLayer?.pm?.enabled()) {
        DrawUtil.editLayer(selectedLayer, false);
      }
    } else {
      setSnapping(true);
      if (selectedLayer?.pm?.enabled()) {
        DrawUtil.editLayer(selectedLayer, true);
      }
    }
  };

  const getLayerCoordinates = ():
    | LatLng
    | LatLng[]
    | PolygonLayerCoordinates => {
    switch (selectedLayer.pm._shape) {
      case 'Marker':
        return [selectedLayer.getLatLng().lng, selectedLayer.getLatLng().lat];
      case 'CircleMarker':
        return [selectedLayer.getLatLng().lng, selectedLayer.getLatLng().lat];
      case 'Line': {
        return selectedLayer
          .getLatLngs()
          .map(latLng => [latLng.lng, latLng.lat]);
      }
      case 'Polygon': {
        const latLngs = selectedLayer
          .getLatLngs()[0]
          .map(latLng => [latLng.lng, latLng.lat]);

        const firstLatLngOfList = latLngs[0];

        latLngs.push(firstLatLngOfList);

        const insideOfPolygon = getPointInsideOfPolygon(latLngs)!;

        return {
          coordinates: latLngs,
          representationPoint: [insideOfPolygon[0], insideOfPolygon[1]],
        };
      }
    }
    throw 'Could not match coordinateType';
  };

  React.useEffect(() => {
    let storedtooltipState = JSON.parse(
      localStorage.getItem('all_tooltips') as string,
    );
    if (storedtooltipState?.hidden === true) {
      setTooltipState(false);
    }
  }, []);

  const initRegistrationDraw = () => {
    if (props.registrationProps && props.step === RegistrationStep.drawObject) {
      if (selectedLayer) {
        DrawUtil.deleteLayer(mapRef, selectedLayer.layer);
        selectedLayer = undefined;
      }
      switch (props.registrationProps.geoType) {
        case 'Point':
          DrawUtil.addMarker(mapRef, snapping, tooltipState);

          break;

        case 'LineString':
          DrawUtil.addLine(mapRef, snapping, tooltipState);

          break;

        case 'Polygon':
          DrawUtil.addPolygon(mapRef, snapping, tooltipState);

          break;
      }
      setDrawingStatus(true);
    }
  };

  const handleOnEditLayerGeo = (layer: any) => {
    console.log('a layer was edited and the position was changed!');
    const coordinates = getLayerCoordinates();

    const correspondingFeatureMember = featureCollection?.featureMembers.find(
      f => f.localId == layer.feature.id,
    );

    if (correspondingFeatureMember != undefined && coordinates != undefined) {
      correspondingFeatureMember!.editedByUser = true;
      correspondingFeatureMember.geometry!.coordinates = coordinates;

      LocalStorageProvider.saveFeatureMembers(
        featureCollection?.featureMembers!,
      );
    }
  };

  const onFinishDrawObject = () => {
    DrawUtil.disableEditOnLayer(selectedLayer);

    const localId = genId();

    //selectedLayer.feature = {id: localId};

    //setDrawingStatus(false);
    setRebuildObjects(false);
    props.onObjectDrawnConfirm(getLayerCoordinates(), localId);
  };

  const onCreateObject = (layer: any) => {
    //selectedLayer = layer;
    setDrawingStatus(false);
  };

  React.useEffect(() => {
    if (tileLayerOffline != null) {
      tileLayerOffline.removeFrom(mapRef.current?.leafletElement);
    }
    // @ts-ignore
    tileLayerOffline = L.tileLayer.offline(
      props.chosenLayer ? props.chosenLayer.url : defaultLayer.url,
      {
        attribution:
          '&copy; <a href="http://www.kartverket.no/">Kartverket</a>',
        subdomains: ['opencache', 'opencache2', 'opencache3'],
        maxZoom: 25,
        maxNativeZoom: 19,
      },
    );

    tileLayerOffline.addTo(mapRef.current?.leafletElement);
    //@ts-ignore
    controlSaveTiles = L.control.savetiles(tileLayerOffline, {
        zoomlevels: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], // optional zoomlevels to save, default current zoomlevel
        queueLimit: 800,
        //INIT: false
        //saveWhatYouSee: true,
        confirm(layer, succescallback) {
          if (layer._tilesforSave.length <= 100000) {
            setTotalTilesToDownload(layer._tilesforSave.length);
            succescallback();
            console.log(layer._tilesforSave.length);
          } else {
            setConfirmDownloadPopup(true);
            setTotalTilesToDownload(layer._tilesforSave.length);
            console.log(layer._tilesforSave.length);
          }
        },
        confirmRemoval(layer, successCallback) {
          if (window.confirm('Remove all the tiles?')) {
            successCallback();
          }
        },
        saveText: 'save',
        rmText: 'delete',
      })
      .addTo(mapRef.current?.leafletElement);
  }, [props.chosenLayer]);

  const getLayerColor = (feature: any): string | undefined => {
    if (props.showObjectsByColorType == ShowObjectsByColorType.registration) {
      let registrationStatus: RegistrationStatus | undefined = undefined;

      const featureMember: FeatureMember = featureCollection!.featureMembers.find(
        f => f.localId == feature.id,
      )!;

      registrationStatus = featureMember?.registrationStatus;

      if (
        featureMember != undefined &&
        featureMember.registrationStatus == undefined
      ) {
        featureMember.setRegistrationStatus();
        registrationStatus = featureMember.registrationStatus;
      }

      if (registrationStatus == undefined) {
        try {
          registrationStatus = feature.properties['registrationStatus'];
        } catch (e) {}
      }

      if (registrationStatus != undefined) {
        switch (registrationStatus) {
          case RegistrationStatus.imported: {
            return '#0F3C64';
          }

          case RegistrationStatus.importedYTD: {
            return '#2189D6';
          }

          case RegistrationStatus.clientError: {
            return '#005824';
          }

          case RegistrationStatus.serverError: {
            return '#BE0000';
          }
        }
      }
    } else if (
      props.showObjectsByColorType == ShowObjectsByColorType.accessibility
    ) {
      const accessibilityValue: string = feature.properties['accessibility'];

      if (accessibilityValue != undefined) {
        switch (accessibilityValue.toLowerCase()) {
          case 'tilgjengelig': {
            return '#00CC00';
          }
          case 'delvis tilgjengelig': {
            return '#FFC800';
          }
          case 'ikke tilgjengelig': {
            return '#FF3201';
          }
          case 'ikke vurdert': {
            return '#33FFFF';
          }
        }
      }
    }
    return undefined;
  };

  function PoIstile(feature, latlng) {
    let color = getLayerColor(feature) ?? '#33FFFF';
    let regexp = /#(\S)/g;
    let colorWithoutHash = color.toString().replace(regexp, '$1');

    switch (feature.properties['objectType']) {
      case 'FriluftHCparkering':
        //@ts-ignore
        return L.canvasMarker(latlng, {
          radius: 13,
          img: {
            url: require(`./Icons/TilgjengelighetIkon/HcParkering/hc-parkeringsplass-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
            }.png`),
            size: iconSize,
          },
          weight: 1,
          color: '#000',
        });

      case 'TettstedInngangBygg':
        return L.circleMarker(latlng, {
          color: '#000',
          fill: true,
          stroke: true,
          fillColor: getLayerColor(feature) ?? '#0FF00F',
          fillOpacity: 1,
          weight: 1,
          radius: 13,
        });

      case 'FriluftBaderampe':
        //@ts-ignore
        return L.canvasMarker(latlng, {
          radius: 13,
          img: {
            url: require(`./Icons/TilgjengelighetIkon/Baderampe/baderampe-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
            }.png`),
            size: iconSize,
          },
          weight: 1,
          color: '#000',
        });
      case 'FriluftFiskeplassBrygge':
        //@ts-ignore
        return L.canvasMarker(latlng, {
          radius: 13,
          img: {
            url: require(`./Icons/TilgjengelighetIkon/Fiskeplass/fiskeplass-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
            }.png`),
            size: iconSize,
          },
          weight: 1,
          color: '#000',
        });

      case 'FriluftGapahuk':
        //@ts-ignore
        return L.canvasMarker(latlng, {
          radius: 13,
          img: {
            url: require(`./Icons/TilgjengelighetIkon/Gapahuk/gapahuk-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
            }.png`),
            size: iconSize,
          },
          weight: 1,
          color: '#000',
        });

      case 'FriluftGrillBålplass':
        //@ts-ignore
        return L.canvasMarker(latlng, {
          radius: 13,
          img: {
            url: require(`./Icons/TilgjengelighetIkon/Grill/grill-baalplass-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
            }.png`),
            size: iconSize,
          },
          weight: 1,
          color: '#000',
        });

      case 'FriluftHytterTilrettelagt':
        //@ts-ignore
        return L.canvasMarker(latlng, {
          radius: 13,
          img: {
            url: require(`./Icons/TilgjengelighetIkon/Hytte/hytte-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
            }.png`),
            size: iconSize,
          },
          weight: 1,
          color: '#000',
        });

      case 'FriluftToalett':
        //@ts-ignore
        return L.canvasMarker(latlng, {
          radius: 13,
          img: {
            url: require(`./Icons/TilgjengelighetIkon/Toalett/toalett-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
            }.png`),
            size: iconSize,
          },
          weight: 1,
          color: '#000',
        });

      case 'Sittegruppe':
        //@ts-ignore
        return L.canvasMarker(latlng, {
          radius: 13,
          img: {
            url: require(`./Icons/TilgjengelighetIkon/Sittegruppe/sittegruppe-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
            }.png`),
            size: iconSize,
          },
          weight: 1,
          color: '#000',
        });
      case 'TettstedHCparkering':
        //@ts-ignore
        return L.canvasMarker(latlng, {
          radius: 13,
          img: {
            url: require(`./Icons/TilgjengelighetIkon/HcParkering/hc-parkeringsplass-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
            }.png`), //${colorWithoutHash ? colorWithoutHash : "33FFFF"}
            size: iconSize,
          },
          weight: 1,
          color: '#000',
        });
    }
  }

  React.useEffect(() => {
    if (rebuildObjects == false) {
      setRebuildObjects(true);
      return;
    }

    if (props.step === RegistrationStep.initial) {
      selectedLayer = undefined;
    }
    // On draw new registration
    initRegistrationDraw();
    mapLayerGroup?.clearLayers();
    mapLayerGroup?.remove();

    features = new L.GeoJSON(getGeoJson(), {
      // @ts-ignore
      pointToLayer: PoIstile,
      filter: feature => {
        if (objectFilter?.apply) {
          if (objectFilter.objects.size == 0) {
            return false;
          }
          let include = true;

          const correspondingFeatureMember = featureCollection?.featureMembers.find(
            f => f.localId == feature.id,
          );

          /// If undefined should not be included, else TBD in filterFeatureMember
          if (correspondingFeatureMember != undefined) {
            include = filterFeatureMember(correspondingFeatureMember);
          } else {
            include = false;
          }

          return include;
        } else {
          return true;
        }
      },
      onEachFeature: function (feature, layer) {
        if (editObjectId != undefined && feature.id == editObjectId) {
          setSelectedLayerState(layer);
        }
        layer.on('click', onLayerClick);
        layer.on('pm:vertexclick', onVertexClick);
        layer.on('pm:enable', onLayerEditingStart);
        layer.on('pm:disable', onLayerEditingDisable);
        layer.on('pm:update', onLayerEdited);
        layer.on('pm:markerdragstart', onVertexDragStart);
        layer.on('pm:markerdragend', onVertexDragEnd);
        if (layer instanceof L.Polyline) {
          layer.setStyle({
            color: getLayerColor(feature),
            weight: layerWidth,
          });
          setTimeout(() => {
            layer.bringToBack();
          }, 0);
        }
      },
    }).addTo(mapLayerGroup!);
    mapLayerGroup!.addTo(mapRef.current.leafletElement);
    mapRef.current.leafletElement.on('pm:drawstart', onDrawStart);
    mapRef.current.leafletElement.on('moveend', onMapMoveEnd);
    mapRef.current.leafletElement.pm.setLang('no', drawTranslation, 'en');
    mapRef.current.leafletElement.pm.setGlobalOptions({
      markerEditable: false,
    });
    props.setRegistrationStep(RegistrationStep.initial);
    selectedLayer = null;
  }, [
    objectFilter,
    objectFilter?.objects.size,
    objectFilter?.mapValueNotifier.length,
    featureCollection,
    featureCollection?.featureMembers?.length,
    props.showObjectsByColorType,
  ]);

  /// Rebuilds a recently edited object to ensure it has
  /// the right display based on its [RegistrationStatus]
  React.useEffect(() => {
    if (rebuildObjectLayerData?.id) {
      let newLayer;

      const featureAsGeoJsonType = getGeoJson(rebuildObjectLayerData.id);

      new L.GeoJSON(featureAsGeoJsonType, {
        // @ts-ignore
        pointToLayer: PoIstile,
        filter: feature => {
          if (objectFilter?.apply) {
            let include = true;

            const correspondingFeatureMember = featureCollection?.featureMembers.find(
              f => f.localId == feature.id,
            );

            /// If undefined should not be included, else TBD in filterFeatureMember
            if (correspondingFeatureMember != undefined) {
              include = filterFeatureMember(correspondingFeatureMember);
            } else {
              include = false;
            }

            return include;
          } else {
            return true;
          }
        },
        onEachFeature: function (feature, layer) {
          newLayer = layer;

          // onLayerClick(layer);

          if (editObjectId != undefined && feature.id == editObjectId) {
            setSelectedLayerState(layer);
          }

          layer.on('click', onLayerClick);
          layer.on('pm:vertexclick', onVertexClick);
          layer.on('pm:enable', onLayerEditingStart);
          layer.on('pm:disable', onLayerEditingDisable);
          layer.on('pm:update', onLayerEdited);
          layer.on('pm:markerdragstart', onVertexDragStart);
          layer.on('pm:markerdragend', onVertexDragEnd);

          if (layer instanceof L.Polyline) {
            layer.setStyle({
              color: getLayerColor(feature),
              weight: layerWidth,
            });
            setTimeout(() => {
              layer.bringToBack();
            }, 0);
          }
        },
      });

      // const oldLayerId = oldLayer?.feature?.id;

      // if (
      //   oldLayerId == selectedLayer?.feature?.id ||
      //   oldLayerId == 'substitute'
      // )

      if (
        rebuildObjectLayerData.callCount !== 2 ||
        selectedLayer?.feature?.id != rebuildObjectLayerData?.id
      ) {
        newLayer.addTo(features);
      }

      if (rebuildObjectLayerData.callCount !== 2) {
        props.setRegistrationStep(RegistrationStep.initial);
        DrawUtil.deleteLayer(mapRef, selectedLayer);
        selectedLayer = undefined;
        setRebuildLayer(newLayer);
      } else {
        DrawUtil.deleteLayer(mapRef, rebuildLayer);
        setRebuildLayer(undefined);
      }
      // else {
      //   addHighlightToLayer(selectedLayer);
      // }
    }
  }, [rebuildObjectLayerData]);

  React.useEffect(() => {
    mapRef.current.leafletElement.on('pm:create', onLayerCreated);
    mapRef.current.leafletElement.on('zoomend', onZoomEnd);
  }, [mapRef]);

  React.useEffect(() => {
    mapRef.current?.leafletElement.pm.setGlobalOptions({
      snappable: snapping,
    });
  }, [snapping]);

  React.useEffect(() => {
    // On draw new registration
    initRegistrationDraw();
  }, [props.step]);

  /// The purpose of this effect is to select and navigate to an object chosen in admin-section to be displayed/edited in map
  React.useEffect(() => {
    if (editObjectId != undefined && selectedLayerState != null) {
      onLayerClick(undefined, selectedLayerState);

      let position;
      /// Set map center position relative to selectedObject
      switch (selectedLayer.feature.geometry.type.toLowerCase()) {
        case 'point': {
          position = [
            selectedLayer.feature.geometry.coordinates[1],
            selectedLayer.feature.geometry.coordinates[0],
          ];
          break;
        }
        case 'linestring': {
          position = [
            selectedLayer.feature.geometry.coordinates[1][1],
            selectedLayer.feature.geometry.coordinates[1][0],
          ];
          break;
        }
        case 'polygon': {
          if (selectedLayer.feature.geometry.position != undefined) {
            position = [
              selectedLayer.feature.geometry.position[1],
              selectedLayer.feature.geometry.position[0],
            ];
          } else {
            position = [
              selectedLayer.feature.geometry.coordinates[1][1],
              selectedLayer.feature.geometry.coordinates[1][0],
            ];
          }
          break;
        }
      }
      mapRef?.current?.leafletElement.setView(position, 16);
      /// TODO: save featureMembers
      resetEditObjectId!();
    }
  }, [selectedLayerState]);

  React.useEffect(() => {
    L.control
      .scale({ metric: true, imperial: false, maxWidth: 150 })
      .addTo(mapRef.current?.leafletElement);
  }, []);

  // @ts-ignore
  React.useEffect(() => {
    //categorizeObjects();

    let progress;
    let tilesSave;
    tileLayerOffline.on('savestart', e => {
      progress = 0;
      tilesSave = e._tilesforSave.length;
      setTotalTilesToDownload(tilesSave);
    });
    tileLayerOffline.on('savetileend', () => {
      progress += 1;
      console.log('downloaded');

      setDownloadedTiles(progress);
    });
  }, [props.chosenLayer]);

  let onMapMoveEnd = (e: any) => {
    if (selectedLayer) {
      // selectedLayer.getContainer().setAttribute('tabindex', '0');
      // selectedLayer.getContainer().focus()
      //console.log(selectedLayer.getContainer())
    }
  };
  //when layer is created on mapLayer
  let onLayerCreated = (e: any) => {
    isCreating = true;

    e.layer.on('click', onLayerClick);
    e.layer.on('pm:enable', onLayerEditingStart);
    e.layer.on('pm:disable', onLayerEditingDisable);
    e.layer.on('pm:update', onLayerEdited);
    e.layer.on('pm:drawstart', onDrawStart);
    e.layer.on('pm:markerdragstart', onVertexDragStart);
    e.layer.on('pm:markerdragend', onVertexDragEnd);
    e.layer.on('pm:vertexclick', onVertexClick);
    //TODO: if type marker disableDraw marker (to prevent multiple markers being created when creating an object)

    if (e.layer instanceof L.Marker) {
      mapRef.current?.leafletElement.pm.disableDraw();
    }

    if (e.layer instanceof L.Polyline) {
      e.layer.setStyle({ weight: layerWidth });
    }
    //If we need this back use: map.pm.setGlobalOptions({markerEditable: false}) -- It is a bug in Leaflet-geoman
    //features.addLayer(e.layer); //THIS IS THE ISSUE WITH MARKER ENABLING ALL LAYERS on geoman 2.8.0
    onCreateObject(e);
    selectedLayer = e.layer;
    addHighlightToLayer(selectedLayer);
    //keep created layer in editing mode after geometry is complete
    if (props.step === RegistrationStep.drawObject) {
      if (selectedLayer instanceof L.Marker) {
        DrawUtil.editLayer(selectedLayer, false);
      } else {
        DrawUtil.editLayer(selectedLayer, snapping);
      }
    }
  };

  let onDrawStart = (e: any) => {
    restoreVertex = null;
    selectedLayer = e;
    workingLayer = e.workingLayer;
    setSelectedLayerState(null);
    isCreating = true;
  };

  const offsetMarker = (icon, offset) => {
    let iconMarginTop = parseInt(icon.style.marginTop, 10) - offset,
      iconMarginLeft = parseInt(icon.style.marginLeft, 10) - offset;

    icon.style.marginTop = iconMarginTop + 'px';
    icon.style.marginLeft = iconMarginLeft + 'px';
  };

  let onZoomEnd = (e: any) => {
    if (mapRef.current) {
      currentZoom = mapRef.current.leafletElement.getZoom();
      features.eachLayer(function (layer: any) {
        let radius = currentZoom - 8;
        layerWidth = currentZoom - 10;
        iconSize = [currentZoom + 8, currentZoom + 8];
        if (currentZoom < 13) {
          iconSize = [currentZoom + 3, currentZoom + 3];
        }
        if (currentZoom > 17) {
          iconSize = [currentZoom + 10, currentZoom + 10];
        }
        if (layer instanceof L.Polyline) {
          layer.setStyle({ weight: layerWidth });
        }
        if (!(layer instanceof L.Polyline)) {
          if (
            layer != undefined &&
            layer.options.img === undefined &&
            layer?.setStyle != undefined
          ) {
            layer.setStyle({ radius: radius });
          } else if (layer != undefined && layer.options.img != undefined) {
            layer.options.img.size = iconSize;
          }
          if (layer?.options.icon) {
            if (layer.feature.properties.objectType === 'TettstedInngangBygg') {
              let icon = layer.options.icon;
              icon.options.iconSize = [currentZoom + 3, currentZoom + 3];
              layer.setIcon(icon);
              if (layer === selectedLayer) {
                addHighlightToLayer(selectedLayer);
              }
            } else {
              //layer.feature.properties.objectType === "TettstedInngangBygg"
              let icon = layer.options.icon;
              icon.options.iconSize = iconSize;
              layer.setIcon(icon);
              if (layer === selectedLayer) {
                addHighlightToLayer(selectedLayer);
              }
            }
          }
        }
      });
    }
  };
  //on a feature click, add to a State to have access to edit and other functions from DrawUtils
  let onLayerClick = (e: any, openInMapLayer?: any) => {
    const layer = e?.target ?? openInMapLayer;

    if (!isCreating) {
      if (selectedLayer && selectedLayer.pm.enabled()) {
      } else {
        if (
          // props.step != RegistrationStep.selectEditMode &&
          props.step != RegistrationStep.drawObject
        ) {
          props.onLayerSelected();
          if (selectedLayer) {
            removeHiglightFromLayer(selectedLayer);
          }
          selectedLayer = layer;
          //Todo: Remove this when leaflet has fixed touch events
          if (selectedLayer instanceof L.CircleMarker) {
            //@ts-ignore
            marker = DrawUtil.convertToMarker(
              selectedLayer.getLatLng(),
              selectedLayer.feature,
              getLayerColor(selectedLayer.feature),
            ).addTo(features);
            marker.feature = selectedLayer.feature;
            // @ts-ignore
            selectedLayer.removeFrom(features);

            selectedLayer = marker;
            setTimeout(() => {
              onLayerClick({ target: selectedLayer });
            }, 1);
            //onLayerClick({target:marker}) <---- Too Slow uten Timout

            marker.on('click', onLayerClick);
          }
          props.setRegistrationStep(RegistrationStep.selectEditMode);
          addHighlightToLayer(layer);
          if (layer.feature) {
            setSelectedLayerState(layer);
          }
          if (selectedLayer && !selectedLayer.pm.enabled()) {
            if (e != undefined) {
              if (!(e?.target instanceof L.Polyline)) {
                restoreLatLng = e.target.getLatLng();
                restoreLayer = e.target;
              } else {
                restoreLatLng = JSON.parse(
                  JSON.stringify(e.target.getLatLngs()),
                );
                restoreLayer = e.target;
              }
            }
          }
        }
      }
    }
  };

  let onVertexClick = (e: any) => {
    if (
      selectedEditMarker &&
      selectedEditMarker.markerEvent.target._icon &&
      L.DomUtil.hasClass(
        selectedEditMarker.markerEvent.target._icon,
        'selected',
      )
    ) {
      L.DomUtil.removeClass(
        selectedEditMarker.markerEvent.target._icon,
        'selected',
      );
      L.DomUtil.addClass(
        selectedEditMarker.markerEvent.target._icon,
        'marker-icon',
      );
    }
    selectedEditMarker = e;
    if (selectedEditMarker.markerEvent.target) {
      L.DomUtil.addClass(
        selectedEditMarker.markerEvent.target._icon,
        'selected',
      );
      L.DomUtil.removeClass(
        selectedEditMarker.markerEvent.target._icon,
        'marker-icon',
      );
    }
  };

  //when layer starts editing
  let onLayerEditingStart = (e: any) => {
    if (!(e.target instanceof L.Marker)) {
      restoreVertex = JSON.parse(
        JSON.stringify(
          e.layer.getLatLngs != undefined
            ? e.layer.getLatLngs()
            : e.layer._latlng,
        ),
      );
    }
    selectedLayer = e.target;
    if (!(selectedLayer instanceof L.Marker)) {
      selectedLayer.bringToFront();
    }
  };

  let onLayerEditingDisable = (e: any) => {};

  //when a layer is edited and position has been changed
  let onLayerEdited = (e: any) => {
    if (!isCreating) {
      //handleOnEditLayerGeo(e.target);
    }
  };

  let onVertexDragStart = (e: any) => {
    restoreVertex = JSON.parse(JSON.stringify(e.layer?.getLatLngs()));

    if (
      selectedEditMarker &&
      selectedEditMarker.markerEvent.target._icon &&
      L.DomUtil.hasClass(
        selectedEditMarker.markerEvent.target._icon,
        'selected',
      )
    ) {
      L.DomUtil.removeClass(
        selectedEditMarker.markerEvent.target._icon,
        'selected',
      );
      L.DomUtil.addClass(
        selectedEditMarker.markerEvent.target._icon,
        'marker-icon',
      );
    }
    selectedEditMarker = e;
    if (selectedEditMarker.markerEvent.target) {
      L.DomUtil.addClass(
        selectedEditMarker.markerEvent.target._icon,
        'selected',
      );
      L.DomUtil.removeClass(
        selectedEditMarker.markerEvent.target._icon,
        'marker-icon',
      );
    }
  };

  let onVertexDragEnd = (e: any) => {
    if (
      !(selectedLayer instanceof L.Marker) &&
      !(selectedLayer instanceof L.CircleMarker)
    ) {
      if (
        selectedEditMarker &&
        selectedEditMarker.markerEvent.target._icon &&
        L.DomUtil.hasClass(
          selectedEditMarker.markerEvent.target._icon,
          'selected',
        )
      ) {
        L.DomUtil.removeClass(
          selectedEditMarker.markerEvent.target._icon,
          'selected',
        );
        L.DomUtil.addClass(
          selectedEditMarker.markerEvent.target._icon,
          'marker-icon',
        );
      }
      selectedEditMarker = e;
      if (selectedEditMarker.markerEvent.target) {
        L.DomUtil.addClass(
          selectedEditMarker.markerEvent.target._icon,
          'selected',
        );
        L.DomUtil.removeClass(
          selectedEditMarker.markerEvent.target._icon,
          'marker-icon',
        );
      }
    }
  };

  const addHighlightToLayer = layer => {
    const geoType = layer?.feature?.geometry?.type;

    if (!(layer instanceof L.Marker)) {
      layer.setStyle({
        color: '#00fff7',
        weight: geoType == 'Point' ? 2 : layerWidth,
      });
    } else if (
      layer.getIcon != undefined &&
      layer.getIcon() instanceof L.DivIcon
    ) {
      //@ts-ignore
      let icon = layer._icon;
      if (!L.DomUtil.hasClass(icon, 'leaflet-pm-divIcon-selected')) {
        offsetMarker(icon, 8);
        //@ts-ignore
        L.DomUtil.addClass(layer._icon, 'leaflet-pm-divIcon-selected');
      }
    } else if (layer instanceof L.Marker) {
      if (!isCreating) {
        if (layer.feature?.properties.objectType === 'TettstedInngangBygg') {
          //@ts-ignore
          let icon = layer._icon;
          if (!L.DomUtil.hasClass(icon, 'leaflet-pm-divmarker-selected')) {
            offsetMarker(icon, 8);
            //@ts-ignore
            L.DomUtil.addClass(layer._icon, 'leaflet-pm-divmarker-selected');
          }
        } else {
          //@ts-ignore
          let icon = layer._icon;
          if (!L.DomUtil.hasClass(icon, 'leaflet-pm-marker-selected')) {
            offsetMarker(icon, 8);
            //@ts-ignore
            L.DomUtil.addClass(layer._icon, 'leaflet-pm-marker-selected');
          }
        }
      }
    }
  };

  const removeHiglightFromLayer = layer => {
    if (layer == undefined) return;

    if (layer instanceof L.Polyline) {
      layer.setStyle({
        color: getLayerColor(layer.feature) ?? '#33FFFF',
        weight: layerWidth,
      });
    } else if (!(layer instanceof L.Marker)) {
      layer.setStyle({ color: '#000', weight: 1 });
    } else if (layer.getIcon() instanceof L.DivIcon) {
      //@ts-ignore
      let icon = layer._icon;
      //To remove border
      if (L.DomUtil.hasClass(icon, 'leaflet-pm-divIcon-selected')) {
        L.DomUtil.removeClass(icon, 'leaflet-pm-divIcon-selected');
        offsetMarker(icon, -8);
      }
    } else if (layer instanceof L.Marker) {
      if (layer.feature?.properties.objectType === 'TettstedInngangBygg') {
        //@ts-ignore
        let icon = layer._icon;
        //To remove border
        if (L.DomUtil.hasClass(icon, 'leaflet-pm-divmarker-selected')) {
          L.DomUtil.removeClass(icon, 'leaflet-pm-divmarker-selected');
          offsetMarker(icon, -8);
        }
      } else {
        //@ts-ignore
        let icon = layer._icon;

        if (!icon) return;
        //To remove border
        if (L.DomUtil.hasClass(icon, 'leaflet-pm-marker-selected')) {
          L.DomUtil.removeClass(icon, 'leaflet-pm-marker-selected');
          offsetMarker(icon, -8);
        }
      }
    }
  };

  // If id is present returns a single geoJsonObject
  function getGeoJson(id?: string) {
    categorizeObjects();

    const featurePoints = points.map(member => {
      return {
        type: 'Feature' as GeoJsonTypes,
        id: member.localId,
        properties: {
          objectType: member.type,
          createDate: member.getDate('førstedatafangstdato'),
          modifiedDate: member.getDate('datafangstdato'),
          objektNr: member.nodes.find(e => e.name == 'objektNr')?.value,
          registrationStatus: member.registrationStatus,
          accessibility: member.nodes.find(
            n => n.name?.toLowerCase() == 'tilgjengvurderingrulleauto',
          )?.value,
        },
        geometry: {
          type: 'Point' as GeoJsonTypes,
          coordinates: member.geometry?.coordinates,
        },
      };
    });

    const featureCurves = curves.map(member => {
      return {
        type: 'Feature' as GeoJsonTypes,
        id: member.localId,
        properties: {
          objectType: member.type,
          createDate: member.getDate('førstedatafangstdato'),
          modifiedDate: member.getDate('datafangstdato'),
          objektNr: member.nodes.find(e => e.name == 'objektNr')?.value,
          registrationStatus: member.registrationStatus,
          accessibility: member.nodes.find(
            n => n.name?.toLowerCase() == 'tilgjengvurderingrulleauto',
          )?.value,
        },
        geometry: {
          type: 'LineString' as GeoJsonTypes,
          coordinates: member.geometry?.coordinates,
        },
      };
    });

    const featurePolygons = polygons.map(member => {
      return {
        type: 'Feature' as GeoJsonTypes,
        id: member.localId,
        properties: {
          objectType: member.type,
          createDate: member.getDate('førstedatafangstdato'),
          modifiedDate: member.getDate('datafangstdato'),
          objektNr: member.nodes.find(e => e.name == 'objektNr')?.value,
          registrationStatus: member.registrationStatus,
          accessibility: member.nodes.find(
            n => n.name?.toLowerCase() == 'tilgjengvurderingrulleauto',
          )?.value,
        },
        geometry: {
          type: 'Polygon' as GeoJsonTypes,
          position:
            member.geometry?.representationPoint ??
            member.geometry?.coordinates.representationPoint,
          coordinates: [
            member.geometry?.coordinates.coordinates ??
              member.geometry?.coordinates,
          ],
        },
      };
    });
    const aggregatedFeatures = featurePoints.concat(
      featureCurves,
      featurePolygons,
    );

    // Return single object if id
    if (id) return aggregatedFeatures.find(obj => obj.id == id);
    else
      return {
        type: 'FeatureCollection' as GeoJsonTypes,
        features: aggregatedFeatures,
      };
  }

  return (
    <div>
      {/*Redigerings toolbar*/}
      {props.step === RegistrationStep.drawObject ? (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}>
          <EditToolbar
            mapRef={mapRef}
            step={props.step}
            selectedLayer={selectedLayer}
            hideSnapping={!(workingLayer instanceof L.Polyline)} //get workingLayer here
            snapping={snapping}
            toggleSnapping={() => toggleSnapping()}
            features={features}
            onRemoveSelectedVertex={() =>
              selectedLayer.pm !== undefined
                ? selectedEditMarker.layer.pm._removeMarker(
                    selectedEditMarker.markerEvent,
                  )
                : null
            }
            onCancel={() => {
              //cancel object registration and delete the layer
              if (
                mapRef.current.leafletElement.pm.Draw.getActiveShape() ===
                undefined
              ) {
                DrawUtil.deleteLayer(mapRef, selectedLayer);
              } else if (
                mapRef.current.leafletElement.pm.Draw.getActiveShape() !==
                undefined
              ) {
                DrawUtil.cancelObject(mapRef);
              }
              props.setRegistrationStep(RegistrationStep.initial);
              selectedLayer = undefined;
              selectedEditMarker = undefined;
              isCreating = false;
            }}
            onDelete={() => {
              if (
                mapRef.current.leafletElement.pm.Draw.getActiveShape() ===
                undefined
              ) {
                DrawUtil.deleteLayer(mapRef, selectedLayer);
              } else if (
                mapRef.current.leafletElement.pm.Draw.getActiveShape() !==
                undefined
              ) {
                DrawUtil.cancelObject(mapRef);
              }

              selectedLayer = undefined;
              initRegistrationDraw();
            }}
            hideRemoveLastVertex={workingLayer instanceof L.Marker}
            onRemoveLastVertex={() => {
              if (restoreVertex) {
                selectedLayer.setLatLngs(restoreVertex);
                DrawUtil.editLayer(selectedLayer, snapping);
              } else {
                DrawUtil.removeLastVertex(mapRef, selectedLayer);
              }
            }}
            isDrawing={isDrawing}
            onConfirm={() => {
              DrawUtil.finishShape(mapRef, selectedLayer);
              onFinishDrawObject();
            }}
          />
        </div>
      ) : null}

      {/* Kortet for å velge redigere objekt eller egenskaper */}
      {props.step === RegistrationStep.selectEditMode ? (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}>
          <EditCard
            onClose={handleEditCard}
            created={selectedLayerState}
            modified={selectedLayerState}
            moveLayerBack={() => {
              if (!(selectedLayer instanceof L.Marker)) {
                selectedLayer.bringToBack();
              }
            }}
            onClickProperties={() => {
              setRebuildObjects(false);
              EditObjectProperties();
            }}
            onClickGeometry={() => {
              props.setRegistrationStep(RegistrationStep.editObjectGeometry);
              if (!(selectedLayer instanceof L.Polyline)) {
                DrawUtil.editLayer(selectedLayer, false);
              } else {
                DrawUtil.editLayer(selectedLayer, snapping);
              }
            }} //TODO: Change this to Edit Step (user starts edit and edit toolbar should show)
          />
        </div>
      ) : null}

      {props.step === RegistrationStep.editObjectGeometry ? (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}>
          <EditToolbar
            mapRef={mapRef}
            step={props.step}
            selectedLayer={selectedLayer}
            hideSnapping={!(selectedLayer instanceof L.Polyline)}
            snapping={snapping}
            toggleSnapping={() => toggleSnapping()}
            features={features}
            onRemoveSelectedVertex={() =>
              selectedEditMarker.layer.pm._removeMarker(
                selectedEditMarker.markerEvent,
              )
            }
            onCancel={() => {
              //cancel object registration and delete the layer
              DrawUtil.cancelEditOnLayer(
                mapRef,
                selectedLayer,
                restoreLayer,
                restoreLatLng,
              );
              isCreating = false;
              props.setRegistrationStep(RegistrationStep.selectEditMode);
            }}
            onDelete={() => {
              if (selectedLayer == undefined) return;

              if (
                mapRef.current.leafletElement.pm.Draw.getActiveShape() ===
                undefined
              ) {
                DrawUtil.disableEditOnLayer(selectedLayer);

                LocalStorageProvider.saveFeatureMembers(
                  featureCollection!.featureMembers!,
                );
                DrawUtil.deleteLayer(mapRef, selectedLayer); //denne sletter geometrien og selectedLayer vil ikke være tilgjengelig etterpå
              } else if (
                mapRef.current.leafletElement.pm.Draw.getActiveShape() !==
                undefined
              ) {
                DrawUtil.cancelObject(mapRef);
              }

              const selectedLayerId = selectedLayer?.feature?.id;

              const featureMember = featureCollection!.featureMembers.find(
                feature => feature.localId == selectedLayerId,
              )!;

              if (featureMember == undefined) return;

              onDeleteObject!(featureMember);

              setRebuildObjects(false);

              // Delete from cache
              featureCollection!.featureMembers! = featureCollection!.featureMembers!.filter(
                feature => {
                  if (feature.localId == selectedLayerId) return false;
                  else return true;
                },
              );

              //selectedLayer = undefined;
              //initRegistrationDraw();
              props.setRegistrationStep(RegistrationStep.initial);
            }}
            hideRemoveLastVertex={!(selectedLayer instanceof L.Polyline)}
            onRemoveLastVertex={() => {
              if (restoreVertex) {
                selectedLayer.setLatLngs(restoreVertex);
                DrawUtil.editLayer(selectedLayer, snapping);
              }
            }}
            isDrawing={isDrawing}
            onConfirm={() => {
              DrawUtil.disableEditOnLayer(selectedLayer);
              handleOnEditLayerGeo(selectedLayer);
              setRebuildObjects(false);

              EditObjectProperties();
              // restoreLayer = null;
              // restoreLatLng = null;
              isCreating = true;
              restoreVertex = null;
            }}
          />
        </div>
      ) : null}
      {smallScreen &&
      !confirmDownloadPopup &&
      totalTilesToDownload > 0 &&
      totalTilesToDownload < 100000 &&
      downloadedTiles !== totalTilesToDownload ? (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 99999,
          }}>
          <DownloadProgress
            value={downloadedTiles}
            max={totalTilesToDownload}
            cancel={() => cancelDownloadMap()}
          />
        </div>
      ) : null}
      {!smallScreen &&
      !confirmDownloadPopup &&
      totalTilesToDownload > 0 &&
      downloadedTiles !== totalTilesToDownload ? (
        //need to check if it is more than 0 and less than 2000 and not finished
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
          }}>
          <DownloadProgress
            value={downloadedTiles}
            max={totalTilesToDownload}
            cancel={() => cancelDownloadMap()}
          />
        </div>
      ) : null}
      {confirmDownloadPopup ? (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 99999,
          }}>
          <ConfirmDownloadCard
            totalTiles={totalTilesToDownload}
            confirm={() => {
              setConfirmDownloadPopup(false);
              setTotalTilesToDownload(0);
            }}
          />
        </div>
      ) : null}
      <LeafletMap
        preferCanvas={true}
        onclick={handleClick}
        center={props.position}
        maxBounds={
          new L.LatLngBounds(
            new L.LatLng(54.622978, -22.763672),
            new L.LatLng(73.677264, 58.710938),
          )
        }
        zoom={6}
        maxZoom={25}
        minZoom={5}
        style={{ height: mapHeight, zIndex: 1 }}
        zoomControl={false}
        // ref={mapRef.current.current}
        ref={mapRef}>
        {props.myPosition ? (
          <Marker
            icon={MyPositionIcon}
            position={props.myPosition}
            pmIgnore={true}
            snapIgnore={true}>
            {/*<Popup>*/}
            {/*  A pretty CSS3 popup.*/}
            {/*  <br/>*/}
            {/*  Easily customizable.*/}
            {/*</Popup>*/}
          </Marker>
        ) : null}
        {props.searchPosition !== null ? (
          <Marker
            icon={searchMarkerIcon}
            position={props.searchPosition!}
            pmIgnore={true}
            snapIgnore={true}></Marker>
        ) : null}
      </LeafletMap>
    </div>
  );
});

export const genId = (): string => {
  let id = '';
  for (let i = 0; i < 32; i++) {
    if (i == 8 || i == 12 || i == 16 || i == 20) id = id + '-';

    id = id + random(9).toString();
  }

  return uuidv4();
};

export function pointIsInPoly(point, polygon) {
  var crossings = 0,
    path = polygon;

  // for each edge
  for (var i = 0; i < path.length; i++) {
    var a = path[i],
      j = i + 1;
    if (j >= path.length) {
      j = 0;
    }
    var b = path[j];
    if (rayCrossesSegment(point, a, b)) {
      crossings++;
    }
  }

  // odd number of crossings?
  const isOdd = crossings % 2 == 1;

  return isOdd;

  function rayCrossesSegment(point, a, b) {
    var px = point[1],
      py = point[0],
      ax = a[1],
      ay = a[0],
      bx = b[1],
      by = b[0];
    if (ay > by) {
      ax = b[1];
      ay = b[0];
      bx = a[1];
      by = a[0];
    }
    // alter longitude to cater for 180 degree crossings
    if (px < 0) {
      px += 360;
    }
    if (ax < 0) {
      ax += 360;
    }
    if (bx < 0) {
      bx += 360;
    }

    if (py == ay || py == by) py += 0.00000001;
    if (py > by || py < ay || px > Math.max(ax, bx)) return false;
    if (px < Math.min(ax, bx)) return true;

    var red = ax != bx ? (by - ay) / (bx - ax) : Infinity;
    var blue = ax != px ? (py - ay) / (px - ax) : Infinity;
    return blue >= red;
  }
}

export const getPointInsideOfPolygon = (
  coordinates: LatLng[],
  disableRetries?: boolean,
) => {
  var twoTimesSignedArea = 0;
  var cxTimes6SignedArea = 0;
  var cyTimes6SignedArea = 0;

  var length = coordinates.length;

  var x = function (i) {
    return coordinates[i % length][0];
  };
  var y = function (i) {
    return coordinates[i % length][1];
  };

  for (var i = 0; i < coordinates.length; i++) {
    var twoSA = x(i) * y(i + 1) - x(i + 1) * y(i);
    twoTimesSignedArea += twoSA;
    cxTimes6SignedArea += (x(i) + x(i + 1)) * twoSA;
    cyTimes6SignedArea += (y(i) + y(i + 1)) * twoSA;
  }
  var sixSignedArea = 3 * twoTimesSignedArea;
  const point: LatLng = [
    cxTimes6SignedArea / sixSignedArea,
    cyTimes6SignedArea / sixSignedArea,
  ];

  if (disableRetries != true)
    if (pointIsInPoly(point, coordinates)) {
      return point;
    } else {
      var tryCount = 0;

      for (var i = 0; i < coordinates.length - 3; i++) {
        const tryCoord = coordinates[i + 2];

        const initCoords = [coordinates[0], coordinates[1], tryCoord];

        const point = getPointInsideOfPolygon(initCoords, true);

        if (pointIsInPoly(point, coordinates)) {
          return point;
        }
      }
      return point;
    }
  else return point;
};

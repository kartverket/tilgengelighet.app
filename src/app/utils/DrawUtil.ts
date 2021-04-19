import L from "leaflet";
import 'leaflet.markercluster';
import '@geoman-io/leaflet-geoman-free';
import registrationIcon from '../components/ActualMap/registration-icon.png';

export class DrawUtil {
  static addMarker = (mapRef: any, isSnapping: boolean, tooltip: boolean) => {
    let RegistrationMarker = L.icon({
      iconUrl: registrationIcon,
      iconSize: [45, 45],
      iconAnchor: [22.5, 22.5],
    });

    mapRef.current.leafletElement.pm.enableDraw('Marker', {
      markerStyle: {
        icon: RegistrationMarker,
      },
      snappable: false,
      continueDrawing: false,
      tooltips: tooltip
    });

  }

  static addPolygon = (mapRef: any, isSnapping: boolean, tooltip: boolean) => {
    mapRef.current.leafletElement.pm.enableDraw('Polygon', {
      snappable: isSnapping,
      allowSelfIntersection: false,
      snapDistance: 20,
      tooltips: tooltip,
      templineStyle: {
        color: '#00fff7',
        weight: 8
      },
      hintlineStyle: {
        color: '#00fff7',
        weight: 8,
        dashArray: '10',
        dashOffset: '5'
      }
    });
  }

  static addLine = (mapRef: any, isSnapping: boolean, tooltip: boolean) => {
    mapRef.current.leafletElement.pm.enableDraw('Line', {
      snappable: isSnapping,
      allowSelfIntersection: false,
      snapDistance: 20,
      tooltips: tooltip,
      templineStyle: {
        color: '#00fff7',
        weight: 8
      },
      hintlineStyle: {
        color: '#00fff7',
        weight: 8,
        dashArray: '10',
        dashOffset: '5'
      }
    });
  }

  static removeLastVertex = (mapRef: any, currentLayer: any) => {
    if (currentLayer.shape === "Line") {
      mapRef.current.leafletElement.pm.Draw.Line._removeLastVertex();
    } else if (currentLayer.shape === "Polygon") {
      mapRef.current.leafletElement.pm.Draw.Polygon._removeLastVertex();
    }
  }

  static finishShape = (mapRef: any, currentLayer: any) => {
    if (currentLayer) {
      if (currentLayer.shape === "Line") {
        mapRef.current.leafletElement.pm.Draw.Line._finishShape()
      } else if (currentLayer.shape === "Polygon") {
        mapRef.current.leafletElement.pm.Draw.Polygon._finishShape()
      }
    }
  }

  static deleteLayer = (mapRef: any, currentLayer: any) => {
    if (currentLayer) {
      mapRef.current.leafletElement.removeLayer(currentLayer);
    }
  }

  static editLayer = (currentLayer: any, isSnapping: boolean) => {
    if (currentLayer) {
      console.log("edit error")
      console.log(currentLayer)
      currentLayer.pm.enable({
        snappable: isSnapping,
        allowSelfIntersection: false,
        snapDistance: 20,
        preventMarkerRemoval: true,
        removeLayerBelowMinVertexCount: false
      });
    }
  }

  static disableEditOnLayer = (currentLayer: any) => {
    if (currentLayer) {
      currentLayer.pm.disable();
    }
  }

  static cancelObject = (mapRef: any) => {
    mapRef.current.leafletElement.pm.disableDraw()
  }

  static cancelEditOnLayer = (mapRef: any, currentLayer: any, restoreLayer: any, restoreLatLng: any) => {
    if (!(restoreLayer instanceof L.Polyline)) {
      restoreLayer.setLatLng(restoreLatLng)
    } else {
      restoreLayer.setLatLngs(restoreLatLng)
    }
    currentLayer.pm.disable()
  }

  static convertToMarker = (latlng, feature, color) => {
    let icon;
    //color = '#33FFFF';
    let regexp = /#(\S)/g;
    let colorWithoutHash = color?.toString().replace(regexp, '$1');
    //console.log(color)
    switch (feature.properties['objectType']) {
      case 'FriluftHCparkering':
        icon = L.icon({
          iconUrl: require(`../components/ActualMap/Icons/TilgjengelighetIkon/HcParkering/hc-parkeringsplass-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
          }.png`),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return new L.Marker(latlng, {icon: icon})

      case 'TettstedInngangBygg':
        icon = L.icon({
          iconUrl: require(`../components/ActualMap/Icons/TilgjengelighetIkon/Inngangbygg/inngangbygg-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
          }.png`),
          iconSize: [24, 24],
          iconAnchor: [14, 14],
        });
        return new L.Marker(latlng, {icon: icon})

      case 'FriluftBaderampe':
        icon = L.icon({
          iconUrl: require(`../components/ActualMap/Icons/TilgjengelighetIkon/Baderampe/baderampe-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
          }.png`),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return new L.Marker(latlng, {icon: icon})
      case 'FriluftFiskeplassBrygge':
        icon = L.icon({
          iconUrl: require(`../components/ActualMap/Icons/TilgjengelighetIkon/Fiskeplass/fiskeplass-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
          }.png`),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return new L.Marker(latlng, {icon: icon})

      case 'FriluftGapahuk':
        icon = L.icon({
          iconUrl: require(`../components/ActualMap/Icons/TilgjengelighetIkon/Gapahuk/gapahuk-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
          }.png`),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        return new L.Marker(latlng, {icon: icon})

      case 'FriluftGrillBålplass':
        icon = L.icon({
          iconUrl: require(`../components/ActualMap/Icons/TilgjengelighetIkon/Grill/grill-baalplass-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
          }.png`),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return new L.Marker(latlng, {icon: icon})

      case 'FriluftHytterTilrettelagt':
        icon = L.icon({
          iconUrl: require(`../components/ActualMap/Icons/TilgjengelighetIkon/Hytte/hytte-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
          }.png`),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return new L.Marker(latlng, {icon: icon})
      case 'FriluftToalett':
        icon = L.icon({
          iconUrl: require(`../components/ActualMap/Icons/TilgjengelighetIkon/Toalett/toalett-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
          }.png`),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return new L.Marker(latlng, {icon: icon})
      case 'Sittegruppe':
        icon = L.icon({
          iconUrl: require(`../components/ActualMap/Icons/TilgjengelighetIkon/Sittegruppe/sittegruppe-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
          }.png`),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return new L.Marker(latlng, {icon: icon})
      case 'TettstedHCparkering':
        icon = L.icon({
          iconUrl: require(`../components/ActualMap/Icons/TilgjengelighetIkon/HcParkering/hc-parkeringsplass-${
              colorWithoutHash ? colorWithoutHash : '33FFFF'
          }.png`),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return new L.Marker(latlng, {icon: icon})
    }
  }
}

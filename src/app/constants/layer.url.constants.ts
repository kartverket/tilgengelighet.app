import topo4Layer from '../images/layer-topo4.png';
import topo4GrayLayer from '../images/layer-topo4gray.png';
import imageLayer from '../images/layer-image.png';

export const mapLayers = [
      {
            name: 'topo4',
            url:
                  'https://{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}',
            image: topo4Layer,
      },
      {
            name: 'topo4gray',
            url:
                  'https://{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4graatone&zoom={z}&x={x}&y={y}',
            image: topo4GrayLayer,
      },
      {
            name: 'imageLayer',
            url:
                  'https://{s}.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?&layer=Nibcache_UTM35_EUREF89&style=default&tilematrixset=default028mm&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}',
            image: imageLayer,
      },
];

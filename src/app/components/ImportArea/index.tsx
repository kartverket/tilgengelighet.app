import React from 'react';
import {Map as LeafletMap, Marker, Popup, TileLayer} from 'react-leaflet';
import {IconButton, makeStyles, createStyles, Theme} from '@material-ui/core';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import {LatLngBounds} from 'leaflet';
import useWindowDimensions from 'app/utils/windowDimensions';
import {mapLayers} from 'app/constants/layer.url.constants';
import {MyPositionIcon} from '../ActualMap';
import PrimaryButton from '../PrimaryButton';
import {useTranslation} from 'react-i18next';
import {translations} from 'locales/i18n';
import {TopBar} from '../ImportObjects/TopBar';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rightButton: {
      color: '#1D1D1D',
      backgroundColor: '#F5F5F5',
      borderRadius: '20px',
      position: 'fixed',
      bottom: '100px',
      right: '100px',
      zIndex: 300,
      width: '60px',
      height: '60px',
      boxShadow: '0px 4px 5px 0px rgba(0,0,0,0.2)',
      marginBottom: '20px',
      '&:hover': {
        backgroundColor: '#e4e4e4',
      },
      '& .MuiIconButton-label': {height: '30px'},
      [theme.breakpoints.down('sm')]: {
        width: '40px',
        height: '40px',
        bottom: '70px',
        right: '30px',
      },
    },
  }),
);

interface Props {
  onPop: () => void;
  onSelect: (bounds: LatLngBounds) => void;
}

export function ImportArea (props: Props) {
  const {t} = useTranslation();

  const {height, width} = useWindowDimensions();
  const mapRef = React.useRef<any>();
  const classes = useStyles();

  const handleClick = () => {
    const map = mapRef?.current;
    if (map != null) {
      const bounds: LatLngBounds = map.leafletElement.getBounds();
      console.log(bounds);

      if (bounds) props.onSelect(bounds);
      else throw 'Bounds could not be selected';
    }
    props.onPop();
  };

  const [position, setPosition] = React.useState<[number, number] | undefined>(
    [59.017594,6.049600],
  );

  React.useEffect(() => {
    //@ts-ignore
    if(!mapRef.current?.leafletElement.restoreView()) {
      centerToLocation();
    }
  }, [position])

  const centerToLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        currentLocation => {
          setPosition([
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
          ]);
          mapRef?.current?.leafletElement.setView([
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
          ], 16);
        },
        error => {
          console.log(error);
        },
      );
    }
  };

  let map;

  if (position)
    map = (
      <LeafletMap
        center={position}
        zoom={13}
        maxZoom={25}
        style={{height: height, zIndex: 1}}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          url={mapLayers[0].url}
          maxZoom={25}
          subdomains={['opencache', 'opencache2', 'opencache3']}
          maxNativeZoom={20}
          attribution='&copy;
  <a href="http://www.kartverket.no/">Kartverket</a>'
        />

        {/*<Marker icon={MyPositionIcon} position={position}>*/}
        {/*  <Popup>*/}
        {/*    A pretty CSS3 popup.*/}
        {/*    <br />*/}
        {/*    Easily customizable.*/}
        {/*  </Popup>*/}
        {/*</Marker>*/}
      </LeafletMap>
    );

  return (
    <div style={{height: height, overflow: 'hidden'}}>
      <TopBar
        onPop={props.onPop}
        title={t(translations.importArea.chooseArea)}
      />

      <div
        style={{
          position: 'fixed',
          zIndex: 200,
          height: '16px',
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '72px',
          zIndex: 200,
          height: height - 152,
          width: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '72px',
          right: '0px',
          zIndex: 200,
          height: height - 152,
          width: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
      />
      <IconButton
        className={classes.rightButton}
        onClick={() => centerToLocation()}
      >
        <MyLocationIcon />
      </IconButton>
      <div
        style={{
          position: 'fixed',
          bottom: '0px',
          zIndex: 200,
          height: '80px',
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '16px',
        }}
      >
        <PrimaryButton
          label={t(translations.importArea.confirmArea)}
          onClick={handleClick}
        ></PrimaryButton>
      </div>
      {map}
    </div>
  );
}

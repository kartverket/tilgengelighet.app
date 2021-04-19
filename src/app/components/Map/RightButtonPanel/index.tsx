import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import LayersOutlinedIcon from '@material-ui/icons/LayersOutlined';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import GetAppIcon from '@material-ui/icons/GetApp';
import Img from '../../../components/Img';
import {Menu, IconButton, CircularProgress, Tooltip} from '@material-ui/core';
import MapLayerSelectionWrapper from '../MapLayerSelectionWrapper';
import { mapLayers } from 'app/constants/layer.url.constants';
import {downloadMap} from "../../ActualMap";
import {RegistrationStep} from "../../../containers/MapActions";
import {DarkToolTip} from "../../CustomToolTip";
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    sideButtons: {
      position: 'absolute',
      right: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 200,
      [theme.breakpoints.up('md')]: {
        top: 'calc(100vh - 400px)',
      },
      [theme.breakpoints.down('sm')]: {
        top: '150px',
      },
    },
    zoomContainer: {
      display: 'flex',
      flexDirection: 'column',
      zIndex: 300,
      marginBottom: 10,
      alignItems: 'center',
      [theme.breakpoints.up('md')]: {
        top: 'calc(100vh - 210px)',
      },
      [theme.breakpoints.down('sm')]: {
        top: '130px',
      },
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
    rightButton: {
      color: '#1D1D1D',
      backgroundColor: '#F5F5F5',
      borderRadius: '20px',
      width: '40px',
      height: '40px',
      boxShadow: '0px 4px 5px 0px rgba(0,0,0,0.2)',
      marginBottom: '20px',
      '&:hover': {
        backgroundColor: '#e4e4e4',
      },
      '& .MuiIconButton-label': { height: '15px' },
    },
  }),
);

interface ComponentProps {
  setMapLayer: any;
  chosenLayer: any;
  smallScreen: any;
  centerToLocation: any;
  loadingState: any;
  zoomIn: any;
  zoomOut: any;
}

export default function RightButtonPanel(props: ComponentProps) {
    const { t } = useTranslation();
  const { setMapLayer, chosenLayer, smallScreen, centerToLocation, zoomIn, zoomOut } = props;
  const [
    mapLayerSelection,
    setMapLayerSelection,
  ] = React.useState<null | HTMLElement>(null);

  const handleOpenMapLayerSelection = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setMapLayerSelection(event.currentTarget);
  };

  const handleCloseMapLayerSelection = () => {
    setMapLayerSelection(null);
  };

  const classes = useStyles();

  return (
    <div className={classes.sideButtons}>
      {smallScreen && (
        <IconButton
          className={classes.rightButton}
          onClick={event => handleOpenMapLayerSelection(event)}
        >
          <LayersOutlinedIcon />
        </IconButton>
      )}
      {!smallScreen && (
        <div className={classes.zoomContainer}>
          <IconButton
            className={classes.rightButton}
            onClick={() => zoomIn()}
          >
            <AddIcon />
          </IconButton>
          <IconButton
            className={classes.rightButton}
            onClick={() => zoomOut()}
          >
            <RemoveIcon />
          </IconButton>
        </div>
      )}
      {!props.loadingState ? (
        <DarkToolTip arrow title={t(translations.mapPage.toolTip.currentPosition).toString()} placement="left">
        <IconButton
          className={classes.rightButton}
          onClick={() => centerToLocation()}
        >
          <MyLocationIcon />
        </IconButton>
        </DarkToolTip>
      ): (
        <CircularProgress className={classes.rightButton}/>
      )}
      <DarkToolTip arrow title={t(translations.mapPage.toolTip.downloadMap).toString()} placement="left">
      <IconButton
        style={{marginBottom: 10}}
        className={classes.rightButton}
        id="save_button"
        onClick={() => downloadMap()}
      >
        <GetAppIcon />
      </IconButton>
      </DarkToolTip>
      {!smallScreen && (

        <DarkToolTip arrow title={t(translations.mapPage.toolTip.chooseLayer).toString()} placement="left">
        <IconButton
          className={classes.layerPreview}
          onClick={event => handleOpenMapLayerSelection(event)}
        >
          <Img src={chosenLayer.image} />
        </IconButton>
        </DarkToolTip>
      )}
      <Menu
        id="simple-menu"
        anchorEl={mapLayerSelection}
        keepMounted
        open={Boolean(mapLayerSelection)}
        onClose={handleCloseMapLayerSelection}
        MenuListProps={{
          disablePadding: true,
          className: classes.menuList,
        }}
        className={classes.menuWrapper}
      >
        <MapLayerSelectionWrapper
          choices={mapLayers}
          setMapLayer={setMapLayer}
          handleCloseMapLayerSelection={handleCloseMapLayerSelection}
          chosenLayer={chosenLayer}
        />
      </Menu>
    </div>
  );
}

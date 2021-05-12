import React, {useContext} from 'react';
import {
  Button,
  Card,
  CardContent,
  IconButton,
  makeStyles, Tooltip,
} from '@material-ui/core';
import UndoIcon from '@material-ui/icons/Undo';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import SnappingDisabledIcon from './snapping-disabled-icon.png';
import CloseIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {RegistrationStep} from "../../containers/MapActions";
import {LightTooltip} from "../CustomToolTip";
import {selectedLayer} from "../ActualMap";
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';


const useStyles = makeStyles({
  container: {
    backgroundColor: 'rgba(0,0,0,0.87)',
    width: 320,
  },
  completeButton: {
    margin: '0 5px 0 0',
    borderRadius: 50,
    backgroundColor: 'transparent',
    border: '2px solid rgba(255,255,255,0.12)',
    color: '#55C4FC',
    fontWeight: 500,
    letterSpacing: '1.25px',
  },
  layerDownButton: {
    margin: '0 5px 0 0',
    padding: 5,
    borderRadius: 50,
    backgroundColor: 'transparent',
    border: '2px solid rgba(255,255,255,0.12)',
    color: '#55C4FC',
    '&&:hover': {
      backgroundColor: '#e0e0e0'
    }
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'left',
    justifyContent: 'left',
    marginTop: 10,
  },
  dates: {
    color: '#c1c1c1',
    '& p': {
      margin: 0,
      fontFamily: 'arial',
      fontSize: 15,
    }
  },
  date: {
    float: "right"
  }
});


interface Props {
  onClose: () => void;
  onClickProperties: () => void;
  onClickGeometry: any;
  moveLayerBack: () => void;
  created?: any | undefined;
  modified?: any;
}

export default function EditCard(props: Props) {
  const classes = useStyles();
  const { t } = useTranslation();
  console.log(props?.modified?.feature.properties)
  return (
    <Card className={classes.container}>
      <CardContent>
        <h1
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'Arial',
            lineHeight: 1.472,
            letterSpacing: 0.15,
            marginBottom: 4,
          }}
        >
          {t(translations.editCard.editObject).toString()} {(props.created && props.created.feature.properties ) ? props.created.feature.properties.objektNr : 'N/A'}
        </h1>
        <span className={classes.dates}>
        <p style={{width: '45%'}}>{t(translations.editCard.created).toString() + ':'} <span className={classes.date}>{(props.created && props.created.feature.properties ) ? props.created.feature.properties.createDate : 'N/A'}</span></p>
        <p style={{width: '45%'}}>{t(translations.editCard.changed).toString() + ':'} <span className={classes.date}>{props.modified && props.modified.feature.properties && props?.modified?.feature?.properties?.modifiedDate?.length > 1 ? props.modified.feature.properties.modifiedDate : 'N/A'}</span></p>
        </span>
        <IconButton
          aria-label="close"
          style={{ color: '#fff', position: 'fixed', top: 0, right: 0 }}
          onClick={() => props.onClose()}
        >
          <CloseIcon />
        </IconButton>
        <span className={classes.buttonContainer}>

          <LightTooltip arrow title={t(translations.editCard.toolTip.geometry).toString()} placement="top">
        <Button onClick={() => props.onClickGeometry()} classes={{ root: classes.completeButton }} variant="contained">
          {t(translations.editCard.geometry).toString()}
        </Button>
          </LightTooltip>
          <LightTooltip arrow title={t(translations.editCard.toolTip.properties).toString()} placement="top">
        <Button
          classes={{ root: classes.completeButton }}
          variant="contained"
          onClick={() => props.onClickProperties()}
        >
          {t(translations.editCard.properties).toString()}
        </Button>
          </LightTooltip>
          <LightTooltip arrow title={t(translations.editCard.toolTip.moveLayerBack).toString()} placement="top">
        <IconButton
          aria-label="flytt objektet lenger ned"
          classes={{root: classes.layerDownButton}}
          onClick={() => props.moveLayerBack()}
        >
          <ExpandMoreIcon />
        </IconButton>
          </LightTooltip>
        </span>
      </CardContent>
    </Card>
  );
}

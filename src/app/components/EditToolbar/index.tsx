import React from 'react';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import UndoIcon from '@material-ui/icons/Undo';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import SnappingDisabledIcon from './snapping-disabled-icon.svg';
import SnappingEnabledIcon from './snapping-enabled-icon.svg';
import deleteSelectedVertexIcon from './delete-vertex-icon.svg';
import { DrawUtil } from '../../utils/DrawUtil';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { Simulate } from 'react-dom/test-utils';
import { RegistrationStep } from 'app/containers/MapActions';
import { DarkToolTip } from '../CustomToolTip';
import {notCreating, selectedLayer} from "../ActualMap";

const useStyles = makeStyles({
  container: {
    backgroundColor: 'rgba(0,0,0,0.87)',
    borderRadius: 50,
    padding: '2px',
    height: 55,
  },
  exitContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 370
  },
  buttonContainer: {
    padding: 2,
  },
  iconButton: {
    color: '#9E9E9E',
    padding: '12px 10px',
    //margin: '0 4px',
  },
  iconButtonWithHiddenButtons: {
    color: '#9E9E9E',
    //margin: '0 16px 0 16px',
  },
  cancelButton: {
    color: '#9E9E9E',
    backgroundColor: 'rgba(0,0,0,0.87)',
    padding: 10,
    marginRight: 5,
    '&:hover': {
      backgroundColor: 'rgba(83,83,83,0.87)',
      color: '#c4c4c4',
    },
  },
  completeButton: {
    margin: '0 0px',
    borderRadius: 50,
    backgroundColor: '#1A589F',
    color: '#fff',
    fontWeight: 500,
    letterSpacing: '1.25px',
  },
  completeButtonWithHiddenButtons: {
    margin: '0 0px',
    borderRadius: 50,
    backgroundColor: '#1A589F',
    color: '#fff',
    fontWeight: 500,
    letterSpacing: '1.25px',
  },
  deleteConfirm: {
    '&:hover': {
      backgroundColor: '#a41919',
      color: '#fff',
    },
    backgroundColor: '#c30707',
    color: '#fff',
  },
  deleteCancel: {
    color: '#000',
    '&:hover': {
      backgroundColor: '#e5e5e5',
    },
  },
});

interface Props {
  selectedLayer: any;
  features: any;
  mapRef: any;
  hideSnapping?: boolean;
  snapping: boolean;
  toggleSnapping: () => void;
  onConfirm: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onRemoveLastVertex?: any;
  hideRemoveLastVertex?: boolean;
  isDrawing: boolean;
  step: any;
  onRemoveSelectedVertex?: any;
  hideRemoveSelectedVertex?: boolean;
}

export default function EditToolbar(props: Props) {
  const { t } = useTranslation();

  const classes = useStyles();
  const [deleteDialog, setdeleteDialog] = React.useState(false);

  const handleClickOpen = () => {
    if (props.isDrawing) {
      props.onDelete();
      setdeleteDialog(false);
    } else {
      setdeleteDialog(true);
    }
  };

  const handleClose = () => {
    setdeleteDialog(false);
  };

  const handleDelete = () => {
    props.onDelete();
    notCreating(true);
    setdeleteDialog(false);
  };

  // const [snapping, setSnapping] = React.useState<boolean>(true);

  console.log(props.selectedLayer);

  // const toggleSnapping = () => {
  //   if (snapping) {
  //     setSnapping(false);
  //     console.log('snapping false');
  //   } else {
  //     setSnapping(true);
  //     console.log('snapping true');
  //   }
  // };

  return (
    <div className={classes.exitContainer}>
      <DarkToolTip
        arrow
        title={
          props.step === RegistrationStep.editObjectGeometry
            ? (t(translations.editToolbar.toolTip.cancelChange).toString())
            : (t(translations.editToolbar.toolTip.cancelCreate).toString())
        }
        placement="top">
        <IconButton
          aria-label="delete"
          className={classes.cancelButton}
          classes={{ root: classes.iconButton }}
          onClick={() => {
            props.onCancel();
          }}>
          <CloseIcon />
        </IconButton>
      </DarkToolTip>
      <div className={classes.container} >
        <div className={classes.buttonContainer}>
          {props.hideRemoveLastVertex !== true ? (
            <DarkToolTip
              arrow
              title={
                props.step === RegistrationStep.editObjectGeometry
                  ? (t(translations.editToolbar.toolTip.revertToLastChange).toString())
                  : (t(translations.editToolbar.toolTip.removeLastVertex).toString())
              }
              placement="top">
              <IconButton
                aria-label="remove-last-vertex"
                classes={{ root: classes.iconButton }}
                onClick={() => props.onRemoveLastVertex()}>
                <UndoIcon />
              </IconButton>
            </DarkToolTip>
          ) : null}
          {!props.hideSnapping ? (
          <DarkToolTip arrow title={t(translations.editToolbar.toolTip.snapping).toString()} placement="top">
            <IconButton
              classes={
                props.hideRemoveLastVertex !== true
                  ? { root: classes.iconButton }
                  : { root: classes.iconButtonWithHiddenButtons }
              }
              onClick={() => props.toggleSnapping()}>
              {props.snapping ? (
                <img style={{ opacity: 1 }} src={SnappingEnabledIcon} />
              ) : (
                <img style={{ opacity: 0.5 }} src={SnappingDisabledIcon} />
              )}
            </IconButton>
          </DarkToolTip>
          ) : null}
          {props.onRemoveSelectedVertex && !props.hideSnapping ? (
              <DarkToolTip
                  arrow
                  title={(t(translations.editToolbar.toolTip.deletePoint).toString())}
                  placement="top">
                <IconButton
                    aria-label={(t(translations.editToolbar.toolTip.deletePoint).toString())}
                    classes={{ root: classes.iconButton }}
                    onClick={() => props.onRemoveSelectedVertex()}>
                  <img style={{ opacity: 0.6 }} src={deleteSelectedVertexIcon} />
                </IconButton>
              </DarkToolTip>
          ) : null}
          <DarkToolTip
            arrow
            title={
              props.step === RegistrationStep.editObjectGeometry
                ? (t(translations.editToolbar.toolTip.removeObject).toString())
                : (t(translations.editToolbar.toolTip.deleteRedraw).toString())
            }
            placement="top">
            <IconButton
              aria-label="delete"
              classes={
                props.hideRemoveLastVertex !== true
                  ? { root: classes.iconButton }
                  : { root: classes.iconButtonWithHiddenButtons }
              }
              onClick={handleClickOpen}>
              <DeleteIcon />
            </IconButton>
          </DarkToolTip>
          <DarkToolTip
            arrow
            title={
              props.step === RegistrationStep.editObjectGeometry
                ? (t(translations.editToolbar.toolTip.confirmChange).toString())
                : (t(translations.editToolbar.toolTip.confirmGoToProperties).toString())
            }
            placement="top">
            <Button
              // style={
              //   props.isDrawing === false
              //     ? {}
              //     : {
              //         backgroundColor: 'lightgrey',
              //         color: 'rgba(0, 0, 0, 0.38)',
              //       }
              // }
              classes={
                props.hideRemoveLastVertex !== true
                  ? { root: classes.completeButton }
                  : { root: classes.completeButtonWithHiddenButtons }
              }
              style={{marginRight: 10}}
              variant="contained"
              startIcon={<DoneIcon />}
              onClick={() => {
                //if (props.selectedLayer && !props.isDrawing) {
                  props.onConfirm();
                  //DrawUtil.disableEditOnLayer(props.selectedLayer);
                  console.log('editing disabled');
                //}
              }}>
              {t(translations.confirm)}
            </Button>
          </DarkToolTip>
        </div>
      </div>
      <Dialog
        open={deleteDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">
          {t(translations.editToolbar.dialog.title).toString()}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t(translations.editToolbar.dialog.alert).toString()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            classes={{ root: classes.deleteCancel }}
            color="primary">
            {t(translations.editToolbar.dialog.noDelete).toString()}
          </Button>
          <Button
            classes={{ root: classes.deleteConfirm }}
            onClick={handleDelete}
            color="primary"
            autoFocus>
            {t(translations.editToolbar.dialog.delete).toString()}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

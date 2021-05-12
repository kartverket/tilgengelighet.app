import React, { useContext } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import FilterIcon from '../../../images/filtericon.png';
import AddIcon from '@material-ui/icons/Add';
import Img from 'app/components/Img';
import GroupButtonsPaper from '../GroupButtonsPaper';
import InfoPaper from '../InfoPaper';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { DataContext } from 'app/containers/HomePage';
const useStyles = makeStyles(() =>
  createStyles({
    objectButtonsDesktop: {
      display: 'flex',
      paddingTop: '20px',
      justifyContent: 'space-between',
      width: '330px',
    },
    desktopButton: {
      backgroundColor: '#f5f5f5',
      width: '160px',
      height: '40px',
      '&:hover': {
        backgroundColor: '#f5f5f5',
      },
      '&.opened': {
        backgroundColor: '#E2F5FF',
      },
    },
    applyFilterButton: {
      width: '330px',
      backgroundColor: 'white',
      fontWeight: 'bold',
      color: '#1A589F',
      '&:hover': {
        backgroundColor: 'white',
      },
      boxShadow:
        '0 4px 5px rgba(0, 0, 0, 0.14), 0 1px 10px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      marginTop: '10px',
      display: 'flex',
    },
  }),
);

export default function SideBarDesktop({
  registerChosen,
  setRegisterStatus,
  showObjectOpened,
  setShowInfoStatus,
  showInfoOpened,
  setShowObjectStatus,
  openFilter,
  loadingObjectImport,
  onObjectImport,
  importObjectErrorMsg,
}) {
  const classes = useStyles();

  const { t } = useTranslation();

  const { onImportClicked } = useContext(DataContext);

  if (registerChosen == undefined) {
    setRegisterStatus(true);
  }

  return (
    <>
      <div className={classes.objectButtonsDesktop}>
        <Button
          className={classes.desktopButton}
          startIcon={<AddIcon htmlColor="black" elevation={3} />}
          onClick={() => onImportClicked!()}>
          {t(translations.importObjects.importObjectsButton)}
        </Button>

        <Button
          className={`${classes.desktopButton}${
            showObjectOpened ? ' opened' : ''
          }`}
          startIcon={<Img src={FilterIcon} />}
          onClick={() => setShowObjectStatus(!showObjectOpened)}>
          {t(translations.mapPage.showObjectDesktop)}
        </Button>
      </div>

      {showObjectOpened && (
        <>
          <GroupButtonsPaper
            registerChosen={registerChosen}
            setRegisterStatus={setRegisterStatus}
            setShowInfoStatus={setShowInfoStatus}
            showInfoStatus={showInfoOpened}
          />

          {showInfoOpened && (
            <InfoPaper
              registerChosen={registerChosen}
              setShowInfoStatus={setShowInfoStatus}
              center={false}
            />
          )}

          <Button
            onClick={() => openFilter()}
            className={classes.applyFilterButton}>
            {t(translations.mapPage.applyFilter)}
          </Button>
          {loadingObjectImport == true ? (
            <Button className={classes.applyFilterButton}>
              <CircularProgress
                size={25}
                style={{ color: 'rgb(26, 88, 159)' }}
              />
            </Button>
          ) : (
            // <Button className={classes.applyFilterButton} disabled>
            //   {t(translations.mapPage.allImportObjects)}
            // </Button>
            <div>
              <Button
                className={classes.applyFilterButton}
                style={{ display: 'list-item' }}
                onClick={() => onObjectImport()}>
                <div style={{ width: '100%' }}>
                  {t(translations.mapPage.importObjectForArea)}
                </div>
                <div style={{ width: '100%' }}>
                  {importObjectErrorMsg != undefined ? (
                    <text
                      style={{
                        color: 'rgb(176, 0, 32)',
                        fontSize: '12.23px',
                        fontFamily: 'Arial',
                      }}>
                      {'\n' + importObjectErrorMsg}
                    </text>
                  ) : (
                    <div></div>
                  )}
                </div>
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

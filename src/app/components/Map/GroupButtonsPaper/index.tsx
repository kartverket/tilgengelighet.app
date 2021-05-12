import React from 'react';
import { Paper, ButtonGroup, Button } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';

const useStyles = makeStyles(() =>
  createStyles({
    buttonGroup: {
      width: '300px',
      marginBottom: '10px',
    },
    eachGroupButton: {
      width: '149px',
      height: '46px',
      fontSize: '14px',
      padding: 0,
      '&.opened': {
        backgroundColor: '#E2F5FF',
        color: '#1A589F',
        borderColor: '#1A589F',
      },
    },
    desktopPaper: {
      width: '330px',
      margin: '10px 0',
      padding: '20px 16px',
    },
    infoWrapper: {
      alignContent: 'center',
      '& span': {
        fontSize: '12px',
        color: '#1A589F',
      },
      '& span:hover': {
        cursor: 'pointer',
      },
    },
    showLegendText: {
      fontSize: '12.23px',
      letterSpacing: '0.4px',
      fontFamily: 'Arial',
    },
    smallIcon: {
      fontSize: '16px',
      marginRight: '6px',
    },
    noOutline: {
      '&:focus': {
        outline: 'none',
      },
    },
  }),
);

export default function GroupButtonsPaper({
  registerChosen,
  setRegisterStatus,
  setShowInfoStatus,
  showInfoStatus,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Paper className={classes.desktopPaper}>
      <ButtonGroup className={classes.buttonGroup}>
        <Button
          className={`${classes.eachGroupButton}${
            registerChosen ? ' opened' : ''
          }`}
          onClick={() => setRegisterStatus(true)}>
          {t(translations.mapPage.registerStatus)}
        </Button>
        <Button
          className={`${classes.eachGroupButton}${ 
            !registerChosen ? ' opened' : ''
          }`}
          onClick={() => setRegisterStatus(false)}>
          {t(translations.mapPage.currentStatus)}
        </Button>
      </ButtonGroup>

      <div
        onClick={() => setShowInfoStatus(true)}
        role="button"
        tabIndex={-1}
        onKeyUp={() => {}}
        className={classes.infoWrapper}>
        <div style={{ display: 'inline-block' }} className={classes.noOutline}>
          <InfoIcon className={classes.smallIcon} htmlColor="#1A589F" />
        </div>
        <text
          className={classes.showLegendText}
          style={showInfoStatus ? { color: 'rgb(26, 88, 159)' } : {}}>
          {' '}
          {t(translations.mapPage.info)}
        </text>
      </div>
    </Paper>
  );
}

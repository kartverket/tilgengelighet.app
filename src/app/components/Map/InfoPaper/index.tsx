import React from 'react';
import { Paper } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';

const useStyles = makeStyles(() =>
  createStyles({
    infoPaper: {
      width: '330px',
      paddingLeft: '30px',
      paddingTop: '20px',
      paddingRight: '20px',
      paddingBottom: '30px',
      display: 'flex',
      flexDirection: 'column',
    },
    colorInfoWrapper: {
      '&:not(:last-child)': {
        marginBottom: '20px',
      },
      display: 'flex',
    },
    closeIcon: {
      marginLeft: 'auto',
      '&:hover': {
        cursor: 'pointer',
      },
    },
  }),
);

export default function InfoPaper({
  registerChosen,
  setShowInfoStatus,
  center,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const registerInfoArray = [
    {
      color: '#0F3C64',
      text: t(translations.importedObjects),
    },
    {
      color: '#2189D6',
      text: t(translations.importedObjectsYTD),
    },
    {
      color: '#005824',
      text: t(translations.newOrEditedObjects),
    },
    {
      color: '#BE0000',
      text: t(translations.invalidObjects),
    },
  ];

  const statusInfoArray = [
    {
      color: '#00CC00',
      text: t(translations.accessible),
    },
    {
      color: '#FFC800',
      text: t(translations.partlyAccessible),
    },
    {
      color: '#FF3201',
      text: t(translations.notAccessible),
    },
    {
      color: '#33FFFF',
      text: t(translations.notAssessed),
    },
  ];

  const renderInfo = (type, className) => {
    const chosenArray =
      type === 'register' ? registerInfoArray : statusInfoArray;

    return chosenArray.map(info => (
      <div key={info.color} className={className}>
        <div
          style={{
            backgroundColor: info.color,
            width: '20px',
            minWidth: '20px',
            height: '20px',
            borderRadius: '4px',
            marginRight: '15px',
            display: 'inline-block',
            border: '1px solid #585858',
          }}></div>

        <div
          style={{
            display: 'inline-block',
            fontSize: '14px',
          }}>
          {info.text}
        </div>
      </div>
    ));
  };
  return (
    <Paper
      className={classes.infoPaper}
      style={
        center == true
          ? {
              margin: '0 auto',
            }
          : {}
      }>
      <ClearIcon
        className={classes.closeIcon}
        htmlColor="#1D1D1D"
        style={{ marginLeft: 'auto' }}
        onClick={() => setShowInfoStatus(false)}
      />
      {registerChosen && renderInfo('register', classes.colorInfoWrapper)}
      {!registerChosen && renderInfo('status', classes.colorInfoWrapper)}
    </Paper>
  );
}

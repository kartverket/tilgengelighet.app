import React, { useContext, useEffect, useState } from 'react';
import NavigationCard from '../../../components/Admin/NavigationCard';
import { Button, Switch, useMediaQuery } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
  makeStyles,
  withStyles,
  createStyles,
  useTheme, Theme,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import {ToolTipContext} from "../../../../store/ToolTipStore";
import { LocalStorageProvider } from 'app/providers/LocalStorageProvider';
import { DataContext } from 'app/containers/HomePage';
import {controlSaveTiles} from "../../../components/ActualMap";
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
  container: {
    marginLeft: '-15px',
    marginRight: '-15px',
    [theme.breakpoints.down('xs')]: {
      marginTop: 0,
      marginBottom: 30
    },
  },
  deleteBtn: {
    fontSize: '15px',
    letterSpacing: '1.25px',
    lineHeight: '16px',
    color: 'rgb(26, 88, 159)',
    fontFamily: 'Arial',
    fontWeight: 700,
    marginTop: '2vh',
  },
}));

const formStyle: any = createStyles({
  formControlLabel: {
    width: '30px',
    fontSize: '16px',
    fontWeight: 700,
    '& label': {
      fontSize: '16px',
    },
  },
});

const CustomSwitch = withStyles({
  switchBase: {
    color: '#BDBDBD',
    '&$checked': {
      color: 'rgb(36, 148, 70)',
    },
    '&$checked + $track': {
      backgroundColor: 'rgb(36, 148, 70)',
    },
  },
  checked: {},
  track: {},
})(Switch);

interface Props {
  pageTitle?: any;
}

export default function DataPage(props: Props) {
  const { t } = useTranslation();
  let {showToolTips, setShowToolTips} = React.useContext(ToolTipContext)
  const { pageTitle } = props;
  const classes = useStyles();

  const [state, setState] = React.useState({
    imageImport: true,
  });

  const { onCleanCache } = useContext(DataContext);

  const theme = useTheme();

  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const cleanCache = () => {
    onCleanCache!();
    controlSaveTiles._rmTiles();
  };

  return (
    <div style={smallScreen ? {} : { padding: '2px 15px' }}>
      {!smallScreen ? (
        <div style={{marginTop: 30}}>
          <h1 style={{fontFamily: 'Meta Book', fontSize: 24, color: 'rgba(0,0,0,0,87)'}}>{t(translations.adminPage.dataImport).toString()}</h1>
        </div>
      ) : null}

      <div className={classes.container}>
        <NavigationCard
          title={t(translations.adminPage.data.imageImportTitle)}
          content={t(translations.adminPage.data.imageImportContent)}
          action={
            <FormControlLabel
              value=""
              control={
                <CustomSwitch
                  checked={state.imageImport}
                  onChange={handleChange}
                  color="primary"
                  name="imageImport"
                />
              }
              label={
                <Typography style={formStyle.formControlLabel}>
                  {state.imageImport
                    ? t(translations.adminPage.data.imageImportActionOn)
                    : t(translations.adminPage.data.imageImportActionOff)}
                </Typography>
              }
              labelPlacement="start"></FormControlLabel>
          }
        />
        <NavigationCard
          title={t(translations.adminPage.data.cachedDataTitle)}
          content={t(translations.adminPage.data.cachedDataContent)}
          action={
            <Button onClick={() => cleanCache()} style={{ width: '80px' }}>
              <p className={classes.deleteBtn}>
                <a>{t(translations.adminPage.data.cachedDataActionDelete)}</a>
              </p>
            </Button>
          }></NavigationCard>
      </div>
    </div>
  );
}

import React, { useContext } from 'react';
import NavigationCard from '../../../components/Admin/NavigationCard';
import { Switch, useMediaQuery } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
  makeStyles,
  withStyles,
  createStyles,
  useTheme,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import LaunchIcon from '@material-ui/icons/Launch';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import ToolTipProvider, {
  ToolTipContext,
} from '../../../../store/ToolTipStore';
import { DataContext } from 'app/containers/HomePage';

const useStyles = makeStyles({
  container: {
    marginLeft: '-15px',
    marginRight: '-15px',
  },
  deleteBtn: {
    fontSize: '15px',
    letterSpacing: '1.25px',
    lineHeight: '16px',
    color: 'rgb(26, 88, 159)',
    fontFamily: 'Arial',
    fontWeight: 700,
    marginTop: '2vh',
    marginLeft: '18px',
  },
});

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

export default function DataPage() {
  const { t } = useTranslation();

  const classes = useStyles();
  const theme = useTheme();

  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  let { showToolTips, setShowToolTips } = React.useContext(ToolTipContext);
  const [state, setState] = React.useState({
    toolTipState: true,
  });

  const { demoModeActive, setDemoMode } = useContext(DataContext);

  React.useEffect(() => {
    let storedVals =
      JSON.parse(localStorage.getItem('all_tooltips') as string) || [];
    if (storedVals.hidden) {
      setState({ toolTipState: !storedVals.hidden });
      setShowToolTips(!state.toolTipState);
    }
  }, []);

  React.useEffect(() => {
    if (state.toolTipState) {
      localStorage.setItem(
        'all_tooltips',
        JSON.stringify({ hidden: !state.toolTipState }),
      );
    } else {
      localStorage.setItem(
        'all_tooltips',
        JSON.stringify({ hidden: !state.toolTipState }),
      );
    }
  }, [state.toolTipState]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
    setShowToolTips(!state.toolTipState);
  };

  console.log('tooltipstate');
  console.log(state.toolTipState);
  console.log('showToolTips');
  console.log(showToolTips);

  return (
    <div style={smallScreen ? {} : { padding: '20px 15px' }}>
      <div className={classes.container}>
        {!smallScreen ? (
          <div style={{marginTop: 10, marginLeft: 15}}>
            <h1 style={{fontFamily: 'Meta Book', fontSize: 24, color: 'rgba(0,0,0,0,87)'}}>{t(translations.adminPage.assist).toString()}</h1>
          </div>
        ) : null}

        <NavigationCard
          title={t(translations.adminPage.help.tipsTitle)}
          content={t(translations.adminPage.help.tipsContent)}
          action={
            <FormControlLabel
              value=""
              control={
                <CustomSwitch
                  checked={state.toolTipState}
                  onChange={handleChange}
                  color="primary"
                  name="toolTipState"
                />
              }
              label={
                <Typography style={formStyle.formControlLabel}>
                  {state.toolTipState
                    ? t(translations.adminPage.help.tipsActionOn)
                    : t(translations.adminPage.help.tipsActionOff)}
                </Typography>
              }
              labelPlacement="start"></FormControlLabel>
          }></NavigationCard>
        <NavigationCard
          title={'Demo'}
          content={t(translations.demoDescription)}
          action={
            <FormControlLabel
              value=""
              control={
                <CustomSwitch
                  checked={demoModeActive ?? false}
                  onChange={(e, checked) => setDemoMode!(checked)}
                  color="primary"
                  name="toolTipState"
                />
              }
              label={
                <Typography style={formStyle.formControlLabel}>
                  {demoModeActive ?? false
                    ? t(translations.adminPage.help.tipsActionOn)
                    : t(translations.adminPage.help.tipsActionOff)}
                </Typography>
              }
              labelPlacement="start"></FormControlLabel>
          }></NavigationCard>
        <NavigationCard
          title={t(translations.adminPage.help.usermanualTitle)}
          content={t(translations.adminPage.help.usermanualContent)}
          action={
            <p className={classes.deleteBtn}>
              <a>
                <LaunchIcon />
              </a>
            </p>
          }></NavigationCard>
      </div>
    </div>
  );
}

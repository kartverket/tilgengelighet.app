import React from 'react';
import {
  createStyles,
  makeStyles,
  styled,
  withStyles,
} from '@material-ui/core/styles';
import { FormControlLabel, FormGroup, Switch } from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import {translations} from 'locales/i18n';

const useStyles = makeStyles(() =>
  createStyles({
    label: {
      fontWeight: 'bold',
    },
  }),
);

const StyledSwitch = withStyles({
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

export default function CustomSwitch(props) {
  const classes = useStyles();
  const {t} = useTranslation();
  const [state, setState] = React.useState({
    value: props.checked,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, value: event.target.checked });
    props.onChange(event.target.checked);
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={<StyledSwitch checked={state.value} onChange={handleChange} />}
        label={
          <span className={classes.label}>{state.value ? (t(translations.yes).toString()) : (t(translations.no).toString())}</span>
        }
        labelPlacement="start"
        className={classes.label}
      />
    </FormGroup>
  );
}

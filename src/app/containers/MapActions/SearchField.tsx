import React, { Component } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MaterialTextField, { TextFieldProps } from '@material-ui/core/TextField';
import {
  createMuiTheme,
  MuiThemeProvider,
  FormControl,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      '& > *': {
        marginTop: '0px',
        width: '100%',
        display: 'flex',
      },
    },
    input: {
      color: 'black',
      fontFamily: 'Arial',
      fontSize: '16px',
      fontWeight: 'bold',

      '&&&:before': {
        borderBottom: 'none',
      },
      '&&:after': {
        borderBottom: 'none',
      },
      '&::placeholder': {
        textOverflow: 'ellipsis !important',
        color: 'blue',
        fontSize: '33px',
      },
    },

    inputLabel: {
      fontFamily: 'Arial',
    },
  }),
);

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#FFFFFF',
    },
  },
});

export interface Props {
  value?: boolean;
  onChanged?: any;
}

function SearchField(props: Props) {
  const { t } = useTranslation();

  const classes = useStyles();

  const [state, setState] = React.useState({
    value: props.value,
  });
  const handleChange = (prop: keyof Props) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setState({ ...state, [prop]: event.target.value });
  };

  return (
    <FormControl fullWidth className={classes.root}>
      <MuiThemeProvider theme={theme}>
        {t(translations.searchInMap)}

        {placeholder => (
          <MaterialTextField
            variant="standard"
            id="input"
            value={state.value}
            onChange={handleChange('value')}
            placeholder={placeholder}
            InputLabelProps={{
              className: classes.inputLabel,
            }}
            InputProps={{
              className: classes.input,
            }}
            type="search"
          />
        )}
      </MuiThemeProvider>
    </FormControl>
  );
}

export default SearchField;

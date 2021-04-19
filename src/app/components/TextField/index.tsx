import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MaterialTextField, { TextFieldProps } from '@material-ui/core/TextField';
import {
  createMuiTheme,
  MuiThemeProvider,
  FormControl,
  InputLabel,
  FilledInput,
} from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    input: {
      color: 'black',
      fontFamily: 'Arial',
      fontSize: '16px',
      fontWeight: 'bold',
    },

    inputLabel: {
      fontFamily: 'Arial',
    },
  }),
);

export interface Props {
  handleRoute?(): void;
  value?: string;
  label?: string;
  type?: string;
  helperText?: string;
  intlLabel?: any;
  onChanged?: any;
  errorText?: string;
  error?: boolean;
  name?: string;
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1A589F',
    },
  },
});

function TextField(props: Props) {
  const classes = useStyles();

  const [values, setValues] = React.useState<Props>({
    value: props.value,
  });

  const handleChange = (prop: keyof Props) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setValues({ ...values, [prop]: event.target.value });
    props.onChanged(event.target.value);
  };

  return (
    <FormControl variant="filled" fullWidth className={classes.root}>
      <MuiThemeProvider theme={theme}>
        <InputLabel
          style={{ fontFamily: 'Arial' }}
          htmlFor="filled-adornment-password"
        >
          {props.intlLabel}
        </InputLabel>
        <FilledInput
          name={props.name}
          style={{
            color: 'black',
            fontFamily: 'Arial',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
          error={props.error}
          required={true}
          id={props.name}
          type={props.type}
          value={values.value}
          onChange={handleChange('value')}
        />
        <div>
          <div id="username-helper-text" aria-hidden="true">
            {props.error === true ? props.errorText ?? '' : ''}
          </div>
        </div>
      </MuiThemeProvider>
    </FormControl>
  );
}
export default TextField;

{
  /* <MaterialTextField
  variant="filled"
  id="input"
  value={values.value}
  error={props.error}
  required={true}
  onChange={handleChange('value')}
  helperText={props.helperText}
  InputLabelProps={{
    className: classes.inputLabel,
  }}
  InputProps={{
    className: classes.input,
  }}
  label={intlLabel}
  type={props.type}
/>; */
}

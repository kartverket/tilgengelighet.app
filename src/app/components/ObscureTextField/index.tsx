import React from 'react';
import clsx from 'clsx';
import {
  makeStyles,
  Theme,
  createStyles,
  createMuiTheme,
  MuiThemeProvider,
} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import FilledInput from '@material-ui/core/FilledInput';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    input: {},
  }),
);

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1A589F',
    },
  },
});

export interface Props {
  value?: string;
  showPassword?: boolean;
  onChanged?: any;
  errorText?: string;
  error?: boolean;
  onKeyPress?: any;
}

export default function ObscureTextField(props: Props) {
  const { t } = useTranslation();

  const classes = useStyles();
  const [values, setValues] = React.useState<Props>({
    value: props.value,
    showPassword: props.showPassword,
  });

  const handleChange = (prop: keyof Props) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setValues({ ...values, [prop]: event.target.value });
    props.onChanged(event.target.value);
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  return (
    <div className={classes.root}>
      <FormControl variant="filled" fullWidth>
        <MuiThemeProvider theme={theme}>
          <InputLabel
            style={{ fontFamily: 'Arial' }}
            htmlFor="filled-adornment-password"
          >
            {t(translations.loginPage.password)}
          </InputLabel>
          <FilledInput
            style={{
              color: 'black',
              fontFamily: 'Arial',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
            onKeyPress={props.onKeyPress}
            error={props.error}
            required={true}
            id="filled-adornment-password"
            type={values.showPassword ? 'text' : 'password'}
            value={values.value}
            onChange={handleChange('value')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {values.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
          <div>
            <div id="username-helper-text" aria-hidden="true">
              {props.error === true ? props.errorText ?? '' : ''}
            </div>
          </div>
        </MuiThemeProvider>
      </FormControl>
    </div>
  );
}

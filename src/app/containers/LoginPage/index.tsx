import React, {useEffect, useCallback} from 'react';
import {Helmet} from 'react-helmet-async';
import A from './A';
import Logo from '../../images/kartverketstaaende.png';
import LogoContainer from './LogoContainer';
import ContentContainer from './ContentContainer';
import {makeStyles, createStyles, useMediaQuery, Paper, useTheme, Divider} from '@material-ui/core';
import useWindowDimensions from 'app/utils/windowDimensions';
import CONSTANTS from '../../constants/email.constants';
import Img from 'app/components/Img';
import H2 from 'app/components/H2';
import TextField from 'app/components/TextField';
import ObscureTextField from 'app/components/ObscureTextField';
import CheckBox from 'app/components/CheckBox';
import PrimaryButton from 'app/components/PrimaryButton';
import {useTranslation} from 'react-i18next';
import {translations} from 'locales/i18n';
import Auth from 'auth';


const useStyles = makeStyles(() =>
  createStyles({
    forgotPassword: {
      color: '#1A589F',
      fontFamily: 'Arial',
      fontSize: '14.26px',
      fontWeight: 'bold',
      letterSpacing: '1.25px',
      textAlign: 'center',
    },
    divider: {
      height: '1px',
      backgroundColor: '#000000',
      width: '100%',
      opacity: '0.1',
    },

    inputLabel: {
      fontFamily: 'Arial',
    },
  }),
);

export function LoginPage() {
  const {t} = useTranslation();

  const classes = useStyles();
  const {height, width} = useWindowDimensions();

  const theme = useTheme();


  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [errorMsg, setErrorMsg] = React.useState();

  const [state, setState] = React.useState({
    checked: false,
    usernameValue: '',
    passwordValue: '',
    usernameErrorText: '',
    passwordErrorText: '',
    passwordError: false,
    usernameError: false,
  });

  const [forgetEmailLink, setForgetEmailLink] = React.useState<string>(
    `mailto:${CONSTANTS.ADMIN_EMAIL_ADDRESS}`,
  );

  const [registerEmailLink, setRegisterEmailLink] = React.useState<string>(
    `mailto:${CONSTANTS.ADMIN_EMAIL_ADDRESS}`,
  );

  useEffect(() => {
    const forgetLink = `mailto:${CONSTANTS.ADMIN_EMAIL_ADDRESS}?${CONSTANTS.FORGET_EMAIL_TEMPLATE}${state.usernameValue}`;
    setForgetEmailLink(forgetLink);

    const registerLink = `mailto:${CONSTANTS.ADMIN_EMAIL_ADDRESS}?${CONSTANTS.REGISTER_EMAIL_TEMPLATE}${state.usernameValue}`;
    setRegisterEmailLink(registerLink);
  }, [state.usernameValue]);

  const validateUsername = () => {
    if (state.usernameValue.trim() === '') {
      state.usernameErrorText = 'Feltet kan ikke være tomt';
      state.usernameError = true;
    } else {
      state.usernameError = false;
    }
  };

  const validatePassword = () => {
    if (state.passwordValue.trim() === '') {
      state.passwordErrorText = 'Feltet kan ikke være tomt';
      state.passwordError = true;
    } else {
      state.passwordError = false;
    }
  };

  const onLoginAttempt = async () => {
    validateUsername();
    validatePassword();
    setState({
      ...state,
    });
    //console.log(state.usernameValue);
    //console.log(state.passwordValue);

    //Authenticate
    localStorage.setItem('remember_me', String(state.checked))

    if (!state.usernameError && !state.passwordError) {
      const login = await Auth.login(state.usernameValue, state.passwordValue);
      if (login?.length) setErrorMsg(login);
    }

  };


  // const handleChange = (prop: keyof State) => (
  //   event: React.ChangeEvent<HTMLInputElement>,
  // ) => {
  //   setState({ ...state, [prop]: event.target.value });
  // };


  let head = <div><Helmet>
    <title>{t(translations.loginPage.login)}</title>
    <meta name="description" content="Proof of concept kartverket"/>
  </Helmet>
    <LogoContainer>
      <A>
        <Img src={Logo} alt="Kartverket - Logo"/>
      </A>
    </LogoContainer></div>;

  let content = <div style={{backgroundColor: 'white',}}>

    <ContentContainer>
      <H2 style={{paddingTop: '40px'}}>
        {t(translations.loginPage.login)}
      </H2>
      <div style={{paddingTop: '20px'}}>
        <TextField
          value={state.usernameValue}
          type="email"
          intlLabel={t(translations.loginPage.username)}
          onChanged={val => {
            (state.usernameValue = val);
            if (errorMsg)
              setErrorMsg(undefined);
          }}
          errorText={state.usernameErrorText}
          error={state.usernameError}
        />
      </div>
      <div style={{paddingTop: '20px', paddingBottom: '25px'}}>
        <ObscureTextField
          value={state.passwordValue}
          showPassword={false}
          onChanged={val => {
            (state.passwordValue = val);
            if (errorMsg)
              setErrorMsg(undefined);
          }}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') {
              onLoginAttempt()
            }
          }}
          errorText={state.passwordErrorText}
          error={state.passwordError}
        ></ObscureTextField>
      </div>
      <div style={{display: "flex"}}>
        <CheckBox
          value={state.checked}
          intlLabel={t(translations.loginPage.remember_me)}
          onChanged={val => (state.checked = val)}
        ></CheckBox>
      </div>

      <div style={{paddingTop: '30px', paddingBottom: '30px'}}>
        <PrimaryButton
          onClick={() => onLoginAttempt()}
          label={t(translations.loginPage.login)}
        ></PrimaryButton>
      </div>
      <a href={forgetEmailLink} className={classes.forgotPassword}>
        {t(translations.loginPage.forgot_password)}
      </a>

      {errorMsg ? <a style={{paddingTop: "30px", color: "red"}}>{errorMsg}</a> : null}
    </ContentContainer>
    <div
      style={{
        position: smallScreen ? 'fixed' : 'relative',
        bottom: smallScreen ? '0' : '',
        width: smallScreen ? '100%' : "496px",
        backgroundColor: 'white',
      }}
    >
      <Divider></Divider>
      <div
        style={{
          textAlign: 'center',
          paddingTop: '20px',
          paddingBottom: '20px',
        }}
      >
        <a
          style={{
            fontFamily: 'Arial',
            fontSize: '16.26px',
            letterSpacing: '0.5px',
          }}
        >
          {t(translations.loginPage.no_account)}
        </a>
        <a> </a>
        <a
          href={registerEmailLink}
          style={{
            fontSize: '16.26px',
            letterSpacing: '1.42px',
            color: '#1A589F',
          }}
          className={classes.forgotPassword}
        >
          {t(translations.loginPage.sign_up)}
        </a>
      </div>
    </div>
  </div>;

  if (!smallScreen)

    return (
      <div style={{width: width, height: height, backgroundColor: "#F5F5F5", textAlign: "center"}}>
        {head}
        <Paper
          style={{
            width: "496px", height: "514px", display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}>
          {content}
        </Paper>

      </div>
    );

  return <article>
    {head}
    {content}
  </article>;
}

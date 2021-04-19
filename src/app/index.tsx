/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import {Helmet} from 'react-helmet-async';
import styled from 'styles/styled-components';
import {Switch, Route, BrowserRouter} from 'react-router-dom';
import {hot} from 'react-hot-loader/root';
import 'bootstrap';
import './style.scss';

// import FeaturePage from 'containers/FeaturePage/Loadable';
// import NotFoundPage from 'containers/NotFoundPage/Loadable';
import {writeFileSync, readFileSync} from 'fs';
// import LoginPage from 'containers/LoginPage/Loadable';
// import HomePage from 'containers/HomePage/Loadable';
// import AdminPage from 'containers/Admin/Loadable';
// import MapView from 'containers/MapActions/Loadable';
// import ImportObjects from 'containers/ImportObjects/Loadable';
import {StylesProvider, createMuiTheme} from '@material-ui/core';
import {ThemeProvider} from '@material-ui/core/styles';
import GlobalStyle from 'global-styles';
import {HomePage} from './containers/HomePage';
import {LoginPage} from './containers/LoginPage/Loadable';
import {AdminPage} from './containers/Admin/Loadable';
import {MapActions} from './containers/MapActions/Loadable';
import {ImportObjects} from './containers/ImportObjects/Loadable';
import {ImportArea} from './components/ImportArea/Loadable';
import ObjectEditor from './containers/ObjectEditor';
import {NotFoundPage} from './containers/NotFoundPage/Loadable';
import ToolTipProvider from "../store/ToolTipStore";
import PrivateRoute from "./components/PrivateRoute";
import Auth from "../auth";
// import ObjectEditor from '../../views/ObjectEditorExample';
// import ImportArea from 'components/ImportArea/Loadable';

const AppWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  padding: 0 0px;
  flex-direction: column;
  background-color: #fff;
  height: 100%;
  width: 100%;
`;

const appTheme = createMuiTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
    MuiButtonGroup: {
      disableRipple: true,
    },
    MuiIconButton: {
      disableRipple: true,
    },
  },
  overrides: {
    MuiButton: {
      root: {
        '&:focus': {
          outline: 'none',
        },
        textTransform: 'none',
      },
    },
    MuiIconButton: {
      root: {
        '&:focus': {
          outline: 'none',
        },
        '&:hover': {
          backgroundColor: 'transparent',
        },
        textTransform: 'none',
      },
    },
  },
});

export function App() {
  return (
    <AppWrapper>
      {/* <Helmet
        titleTemplate="%s - React.js Boilerplate"
        defaultTitle="React.js Boilerplate"
      >
        <meta name="description" content="A React.js Boilerplate application"/>
      </Helmet>
      <HomePage /> */}
      <StylesProvider injectFirst>
        <ThemeProvider theme={appTheme}>
          <ToolTipProvider>
            <BrowserRouter>
              <Switch>
                <PrivateRoute exact path="/" component={HomePage}/>
                <Route exact path="/login" component={LoginPage}/>
                <PrivateRoute path="/admin" component={AdminPage}/>
                <PrivateRoute exact path="/map" component={MapActions}/>
                <PrivateRoute exact path="/import" component={ImportObjects}/>
                <PrivateRoute exact path="/import/area" component={ImportArea}/>
                <PrivateRoute path="/rampe" component={ObjectEditor}/>
                {/* <Route exact path="/a" component={AccessibilityPage} /> */}
              <Route component={NotFoundPage}/>
              </Switch>
            </BrowserRouter>
          </ToolTipProvider>
        </ThemeProvider>
      </StylesProvider>

      <GlobalStyle/>
    </AppWrapper>
  );
}

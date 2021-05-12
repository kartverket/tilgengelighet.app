/**
 * index.tsx
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */
import { config as configDotenv } from 'dotenv';
import { resolve } from 'path';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as serviceWorker from 'serviceWorker';
import 'sanitize.css/sanitize.css';
import FontFaceObserver from 'fontfaceobserver';
import $ from 'jquery';
import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Import root app
import { App } from 'app';

import { HelmetProvider } from 'react-helmet-async';

// Initialize languages
import './locales/i18n';
import { configureAppStore } from 'store/configureStore';

require('dotenv').config();

const result = configDotenv({
  path: resolve('../.env.local'),
});

const openSansObserver = new FontFaceObserver('Meta', {});

// When Open Sans is loaded, add a font-family using Open Sans to the body
openSansObserver.load().then(() => {
  document.body.classList.add('fontLoaded');
});

const MOUNT_NODE = document.getElementById('root') as HTMLElement;

const store = configureAppStore();

interface Props {
  Component: typeof App;
}

const ConnectedApp = ({ Component }: Props) => (
  <Provider store={store}>
    <HelmetProvider>
      <React.StrictMode>
        <Component />
      </React.StrictMode>
    </HelmetProvider>
  </Provider>
);
const render = (Component: typeof App) => {
  ReactDOM.render(<ConnectedApp Component={Component} />, MOUNT_NODE);
};

if (module.hot) {
  // Hot reloadable translation json files and app
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept(['./app', './locales/i18n'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    const App = require('./app').App;
    render(App);
  });
}

render(App);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

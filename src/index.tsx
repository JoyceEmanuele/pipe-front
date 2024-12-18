import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';

import ReactDOM from 'react-dom';

import { App } from './App';

import { init as initApm } from '@elastic/apm-rum';

declare global {
  interface Window {
    elasticApm: any;
    transaction: any;
  }
}

if (process.env.REACT_APP_APM_ELASTIC) {
  const apm = initApm({
    // Configurações do agente apm
    serviceName: 'DAP-Frontend',
    serverUrl: process.env.REACT_APP_APM_ELASTIC,
    secretToken: process.env.REACT_APP_APM_TOKEN,
    verifyServerCert: false,
    pageLoadTransactionName: window.location.pathname,
  });

  window.elasticApm = apm;
}

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root'),
);

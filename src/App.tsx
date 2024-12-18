import { useEffect, useState } from 'react';

import { ThemeProvider } from 'emotion-theming';
import { Provider } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { setLocale } from 'yup';

import { getUserProfile, refreshUserProfile } from 'helpers/userProfile';
import { CloseIcon } from 'icons';
import { backendDescriptionToShow } from 'providers';
import { Routes } from 'routes';
import store from 'store';
import { useStateVar } from './helpers/useStateVar';
import MenuContext from './contexts/menuContext';
import i18n from './i18n/index';
import useGaTracker from './useGaTracker';
import moment from 'moment';
import 'sanitize.css/sanitize.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import 'antd/dist/antd.css';
import 'assets/css/font-awesome.min.css';
import { CardProvider } from './contexts/CardContext';
import { TourProvider } from './contexts/TourContext';
import posthog from 'posthog-js';
import { identifyUser } from './helpers/posthogHelper';
import { GlobalStyles } from 'styles/GlobalStyles';

const ReFlexbox = {
  breakpoints: ['360px', '480px', '768px', '992px', '1200px'],
};

export const App = (): JSX.Element => {
  useGaTracker();
  const isOpenMenu = localStorage.getItem('menuDiel') && localStorage.getItem('menuDiel') === 'false';
  const [menuToogle, setMenuToogle] = useState(isOpenMenu === null ? true : isOpenMenu === false);
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const [state, _render, setState] = useStateVar({
    checkingAuthToken: true,
  });
  if (process.env.REACT_APP_POSTHOG_HOST && process.env.REACT_APP_POSTHOG_KEY) {
    posthog.init(process.env.REACT_APP_POSTHOG_KEY, {
      api_host: process.env.REACT_APP_POSTHOG_HOST,
      disable_session_recording: true,
    });
  }
  setLocale({
    mixed: { required: 'Campo obrigatório' },
  });

  async function fetchUserProfile() {
    setState({ checkingAuthToken: true });
    try {
      const user = getUserProfile();
      if (user && user.isLogged) {
        identifyUser(user);
        await refreshUserProfile();
      }
      i18n.changeLanguage(user && user.prefsObj && user.prefsObj.language
        ? user.prefsObj.language : 'pt');
      if (user.isTracker) {
        posthog.startSessionRecording();
      }
    } catch (err: any) {
      console.log(err);

      // Se o erro for o backend informando explicitamente que o token é inválido, tira ele do localStorage.
      if (err && err.isAxiosError && err.response && err.response.status === 401) {
        if (err.response.data && err.response.data.errorCode === 'INVALID_AUTH_TOKEN') {
          localStorage.removeItem('@diel:token');
          localStorage.removeItem('@diel:profile');
        }
      }
    }
    setState({ checkingAuthToken: false });
  }

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <MenuContext.Provider value={{ menuToogle, setMenuToogle }}>
      <Provider store={store}>
        <TourProvider>
          <CardProvider>
            <ThemeProvider theme={ReFlexbox}>
              {(!!backendDescriptionToShow) && (
                <div
                  style={{
                    fontSize: '10px',
                    backgroundColor: '#00ff9b',
                    color: '#090b4b',
                    padding: '4px 3px',
                    fontWeight: 'bold',
                    position: 'absolute',
                    zIndex: 1001,
                  }}
                >
                  {backendDescriptionToShow}
                </div>
              )}
              {
            state.checkingAuthToken
              ? <div>&nbsp;</div>
              : <Routes />
          }
              <GlobalStyles />
              <ToastContainer
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                toastClassName="toastify-body"
                position={toast.POSITION.TOP_RIGHT}
                closeButton={<CloseIcon size="14" />}
              />
            </ThemeProvider>
          </CardProvider>
        </TourProvider>
      </Provider>
    </MenuContext.Provider>
  );
};

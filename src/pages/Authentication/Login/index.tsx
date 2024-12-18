import axios from 'axios';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';

import { useStateVar } from '~/helpers/useStateVar';
import formFieldsValidator from '~/helpers/formFieldsValidator';
import {
  ApiResps, apiCall, reqWithCredentials, unicodeBase64,
} from '~/providers';
import i18n from '~/i18n';

import { fetchServerData, setUpdatedProfile } from '~/helpers/userProfile';

import { LoginInput, MainContent } from './styles';
import { Button } from '~/components';
import { RouteComponentProps } from 'react-router-dom';
import { useEffect } from 'react';
import { useCard } from '~/contexts/CardContext';

interface LoginProps extends Pick<RouteComponentProps, 'history'> {
  setIsLogin: () => void;
  setIsLoading: () => void;
}

export const Login: React.FC<LoginProps> = ({ history, setIsLogin, setIsLoading }) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();
  const { dispatch } = useCard();

  const [state, render, setState] = useStateVar(() => {
    let dashPage = '/analise/unidades/';
    const queryPars = queryString.parse(history.location.search);
    if (queryPars.topage) {
      if (queryPars.topage === 'maquinas') {
        dashPage = '/analise/maquinas';
      } else {
        dashPage = queryPars.topage as string;
      }
    }
    const formLoginValuesState = {
      userId: '',
      password: '',
    };
    const formLoginSchema = {
      userId: yup.string().required(t('campoObrigatorio')),
      password: yup.string().required(t('campoObrigatorio')),
    };
    const state = {
      loading: false,
      checkingSSO: false,
      dashPage,
      formData: formFieldsValidator(
        formLoginSchema as any,
        formLoginValuesState,
      ),
    };
    return state;
  });

  const {
    values: formLoginValues,
    handleChange,
    errors: formLoginErrors,
  } = state.formData;

  const handleSubmit = async () => {
    try {
      if (!(await state.formData.checkAll())) {
        render();
        return;
      }
      if (window.location.href.includes('energia.dielenergia.com')) {
        const { data } = await axios.post(
          'https://backend.greenant.com.br/api/login',
          {
            email: formLoginValues.userId,
            password: formLoginValues.password,
          },
        );
        if (data.message !== 'success') {
          toast.error(
            data.message || t('erroLoginGreeAnt'),
          );
          return;
        }
        const logoutUrl = 'https://energia.dielenergia.com';
        window.location.href = `https://dashboard.greenant.com.br/#!/redirect?token=${data.token}&url=${logoutUrl}`;
        return;
      }
      localStorage.clear();
      const authHeader = `JSON ${unicodeBase64(
        JSON.stringify(formLoginValues),
      )}`;
      await loginWithCredentials(authHeader);
    } catch (err: any) {
      console.log(err);
      const codeError = err?.response?.data?.errorCode;
      if (codeError === 'INVALID_USER') {
        toast.error(t('usuarioInvalido'));
      }
      else if (codeError === 'PW_CHECK_FAILED') {
        toast.error(t('credenciaisInvalidas'));
      }
      else {
        toast.error(t('naoFoiPossivelVerificarCredenciais'));
      }
      setState({ loading: false });
    }
  };

  const loginWithCredentials = async (authHeader) => {
    const response = await reqWithCredentials(authHeader, '/my-profile');
    if (response.data) {
      const profile = response.data as ApiResps['/my-profile'];
      localStorage.setItem('@diel:token', profile.token);
      // @ts-ignore
      delete profile.token;
      if (profile.dataToFront && profile.dataToFront.topage) {
        state.dashPage = profile.dataToFront.topage;
      }
      delete profile.dataToFront;
      setUpdatedProfile(profile);

      const prefsOverview = await apiCall('/users/get-prefs-overview', {
        userId: profile.user,
      });

      if (prefsOverview) {
        const ordernedCards = prefsOverview.prefs.sort(
          (a: any, b: any) => a.position - b.position,
        );

        dispatch({ type: 'RESET_ALL', payload: ordernedCards as any });
      }
      const listIdClients = profile.permissions.PER_CLIENT.map((x) => x.clientId);
      fetchServerData(listIdClients);

      if (profile.permissions.isInstaller) state.dashPage = '/analise/unidades';
      setState({ loading: true });
      setIsLoading();
    }
  };

  useEffect(() => {
    if (state.loading) {
      setTimeout(() => {
        history.push(state.dashPage);
      }, 4000);
    }
  }, [state.loading]);

  return (
    <MainContent>
      <h1>{t('entrar')}</h1>
      <LoginInput
        label={t('email').toUpperCase()}
        value={formLoginValues.userId}
        error={formLoginErrors.userId}
        id="email"
        name="email"
        placeholder={t('email')}
        onChange={(e) => {
          handleChange('userId', e.target.value);
          render();
        }}
      />
      <LoginInput
        label={t('senha').toUpperCase()}
        value={formLoginValues.password}
        error={formLoginErrors.password}
        id="password"
        name="password"
        placeholder={t('senha')}
        type="password"
        onChange={(e) => {
          handleChange('password', e.target.value);
          render();
        }}
      />
      <Button variant="primary" onClick={handleSubmit}>
        {t('login')}
      </Button>
      <span className="outlineButton" onClick={setIsLogin}>{t('esqueciSenha')}</span>
    </MainContent>
  );
};

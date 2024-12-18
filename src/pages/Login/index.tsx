import { useMemo, useState } from 'react';

import axios from 'axios';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';

import Logo from '~/assets/img/logos/NewLogoDiel.svg';
import { Input, Loader } from '~/components';
import formFieldsValidator from '~/helpers/formFieldsValidator';
import { getUserProfile, setUpdatedProfile, fetchServerData } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import { reqWithCredentials, unicodeBase64, ApiResps } from '~/providers';
import { colors } from '~/styles/colors';
import { withTransaction } from '@elastic/apm-rum-react';

import {
  ContainerCard, LoginCard, StyledButton, StyledLink,
} from './styles';

const Login = ({ history }) => {
  const dispatch = useDispatch();

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
    const formValues = {
      userId: '',
      password: '',
    };
    const checkers = {
      userId: yup.string().required('O campo de usuário é obrigatório'),
      password: yup.string().required('A senha é obrigatória'),
    };
    const state = {
      loading: false,
      checkingSSO: false,
      dashPage,
      formData: formFieldsValidator(checkers as any, formValues),
    };
    return state;
  });
  const { values: formValues, handleChange, errors: formErrors } = state.formData;

  const [loggedProfile] = useState(getUserProfile);

  useMemo(() => {
    const queryPars = queryString.parse(history.location.search);
    if (queryPars.gstoken) {
      // token GeraSolucoes
      state.checkingSSO = true;
      Promise.resolve().then(async () => {
        try {
          await loginWithCredentials(`SSO-GS ${queryPars.gstoken}`);
        } catch (err) {
          console.log(err);
          setState({ checkingSSO: false });
        }
      });
    }
    if (queryPars.rdtoken) {
      // token Redirect to Dash
      state.checkingSSO = true;
      Promise.resolve().then(async () => {
        try {
          await loginWithCredentials(`RD2D ${queryPars.rdtoken}`);
        } catch (err) {
          console.log(err);
          setState({ checkingSSO: false });
        }
      });
    }
  }, []);

  const handleSubmit = async () => {
    try {
      if (!await state.formData.checkAll()) {
        render();
        return;
      }
      setState({ loading: true });
      if (window.location.href.includes('energia.dielenergia.com')) {
        const response = await axios.post('https://backend.greenant.com.br/api/login', {
          email: formValues.userId,
          password: formValues.password,
        }).then((r) => r.data);
        if (response.message !== 'success') {
          toast.error(response.message || 'Não foi possível fazer login na GreenAnt');
          return;
        }
        const logoutUrl = 'https://energia.dielenergia.com';
        window.location.href = `https://dashboard.greenant.com.br/#!/redirect?token=${response.token}&url=${logoutUrl}`;
        return;
      }
      localStorage.clear();
      const authHeader = `JSON ${unicodeBase64(JSON.stringify(formValues))}`;
      await loginWithCredentials(authHeader);
    } catch (err) {
      console.log(err);
      toast.error('Credenciais inválidas!');
      setState({ loading: false });
    }
  };

  async function loginWithCredentials(authHeader) {
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

      const listIdClients = profile.permissions.PER_CLIENT.map((x) => x.clientId);
      fetchServerData(listIdClients);

      if (profile.permissions.isInstaller) state.dashPage = '/analise/unidades';
      history.push(state.dashPage);
    }
  }

  const logout = () => {
    localStorage.clear();
    dispatch({ type: 'RESET_DATA' });
    window.location.reload();
  };

  return (
    <>
      <Helmet>
        <title>Login - Diel Energia</title>
      </Helmet>
      <ContainerCard>
        <LoginCard>
          {(state.checkingSSO)
            ? (
              <div style={{ textAlign: 'center' }}>
                <Loader />
              </div>
            )
            : (loggedProfile && loggedProfile.isLogged)
              ? (
                <>
                  <div style={{ color: colors.GrenTab }}>
                    Logado como
                    {' '}
                    <b>{loggedProfile.fullName || loggedProfile.user || ''}</b>
                  </div>
                  <StyledButton variant="primary" onClick={() => history.push(state.dashPage)}>
                    Ir para o dashboard
                  </StyledButton>
                  <StyledButton variant="primary" onClick={logout}>
                    Sair
                  </StyledButton>
                </>
              )
              : (
                <>
                  <div className="titleLogin">
                    <span>Entrar</span>
                    <img src={Logo} alt="new logo" />
                  </div>

                  <div>
                    <Input
                      type="user"
                      id="userId"
                      name="userId"
                      value={formValues.userId}
                      error={formErrors.userId}
                      placeholder="Usuário"
                      onChange={(e) => { handleChange('userId', e.target.value); render(); }}
                      onEnterKey={handleSubmit}
                    />
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      value={formValues.password}
                      error={formErrors.password}
                      placeholder="Senha"
                      onChange={(e) => { handleChange('password', e.target.value); render(); }}
                      onEnterKey={handleSubmit}
                    />
                    <StyledLink to="/esqueceu-senha">Esqueceu sua senha?</StyledLink>
                    <StyledButton onClick={handleSubmit} variant="primary">
                      {state.loading ? <Loader size="small" variant="secondary" /> : 'Login'}
                    </StyledButton>
                  </div>
                </>
              )}
        </LoginCard>
      </ContainerCard>
    </>
  );
};

const LoginWrapper = withRouter(Login);

export { LoginWrapper as Login };
export default withTransaction('Login', 'component')(Login);

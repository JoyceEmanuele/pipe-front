import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import * as yup from 'yup';

import Lightning from '~/assets/img/Lightning.png';
import Logo from '~/assets/img/logos/NewLogoDiel.svg';
import { Input, Link, Loader } from '~/components';
import formFieldsValidator from '~/helpers/formFieldsValidator';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall } from '~/providers';
import { withTransaction } from '@elastic/apm-rum-react';
import CelciusWhiteLogo from '~/assets/img/logos/CelciusWhiteLogo.svg';

import {
  ContainerCard, ForgotPasswordCard, BackgroundImage, LogoImage, LogoImageMobile, Title, StyledButton,
} from './styles';

export const ResetPassword = () => {
  const history = useHistory();
  const [state, render, setState] = useStateVar(() => {
    const queryPars = queryString.parse(history.location.search);
    const formValues = {
      token: (queryPars.token || '') as string,
      pass: '',
    };
    const checkers = {
      token: yup.string().required(),
      pass: yup.string().required(),
    };
    const state = {
      loading: false,
      formData: formFieldsValidator(checkers as any, formValues),
    };
    return state;
  });
  const { values: formValues, handleChange, errors: formErrors } = state.formData;

  async function onSubmit() {
    try {
      if (!await state.formData.checkAll()) {
        render();
        return;
      }
      setState({ loading: true });
      const response = await apiCall('/login/reset', formValues);
      response && toast.success('Senha resetada com sucesso');
    } catch (err) {
      console.log(err);
      toast.error('Erro ao resetar senha');
    } finally {
      setState({ loading: false });
    }
  }

  return (
    <>
      <Helmet>
        <title>Resetar sua senha - Diel Energia</title>
      </Helmet>
      <ContainerCard>
        <ForgotPasswordCard>
          <div className="titleLogin">
            <span>
              Resetar sua
              {' '}
              <br />
              {' '}
              Senha
            </span>
            <img src={CelciusWhiteLogo} alt="new logo" />
          </div>
          <div className="spanText" />
          <div>
            <Input
              type="password"
              name="pass"
              value={formValues.pass}
              error={formErrors.pass}
              placeholder="Senha"
              onChange={(e) => { handleChange('pass', e.target.value); render(); }}
              onEnterKey={onSubmit}
            />
            <StyledButton onClick={onSubmit} variant="primary">
              {state.loading ? <Loader size="small" variant="secondary" /> : 'Resetar senha'}
            </StyledButton>
            <Link to="/login">
              <StyledButton variant="greendiel">Retornar ao login</StyledButton>
            </Link>
          </div>
        </ForgotPasswordCard>
      </ContainerCard>
    </>
  );
};

export default withTransaction('ResetPassword', 'component')(ResetPassword);

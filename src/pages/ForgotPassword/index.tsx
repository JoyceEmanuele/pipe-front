import axios from 'axios';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import * as yup from 'yup';

import Logo from '~/assets/img/logos/NewLogoDiel.svg';
import {
  Input, Loader,
} from '~/components';
import formFieldsValidator from '~/helpers/formFieldsValidator';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall } from '~/providers';
import { withTransaction } from '@elastic/apm-rum-react';

import {
  ContainerCard, ForgotPasswordCard, StyledButton, StyledLink,
} from './styles';

export const ForgotPassword = () => {
  const [state, render, setState] = useStateVar(() => {
    yup.setLocale({
      mixed: {
        required: 'Campo obrigatório',
      },
    });
    const formValues = {
      email: '',
    };
    const checkers = {
      email: yup.string()
        .required()
        .email('E-mail inválido'),
    };
    const state = {
      loading: false,
      send: false,
      formData: formFieldsValidator(checkers as any, formValues),
      isEnergia: window.location.href.includes('energia.dielenergia.com'),
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

      if (state.isEnergia) {
        const { error, message } = await axios.post('https://backend.greenant.com.br/api/forgot', { email: formValues.email }).then((r) => r.data);
        if (error) {
          toast.error(String(error));
        } else {
          toast.success(message || 'Por favor verifique seu email');
          // Uma mensagem foi enviada para o seu e-mail com as instruções necessárias
          setState({ send: true });
        }
      } else {
        await apiCall('/login/forgot', { user: formValues.email });
        toast.success('Por favor verifique seu email');
        setState({ send: true });
      }
    } catch (err) {
      console.log(err);
      toast.error('Erro ao solicitar redefinição de senha');
    } finally {
      setState({ loading: false });
    }
  }

  return (
    <>
      <Helmet>
        <title>Esqueceu sua senha - Diel Energia</title>
      </Helmet>
      <ContainerCard>
        <ForgotPasswordCard>
          <div className="titleLogin">
            <span>{state.send ? 'E-mail enviado!' : 'Esqueceu sua Senha'}</span>
            <img src={Logo} alt="new logo" />
          </div>
          <div className="spanText">
            <span>
              {state.send
                ? 'Confira o seu e-mail com as instruções sobre redefinição de senha.'
                : 'Insira seu e-mail e enviaremos um link para você redefinir sua senha.'}
            </span>
          </div>

          {state.send
            ? (
              <StyledButton send={state.send} type="button" variant="primary" onClick={() => setState({ send: false })}>
                VOLTAR PARA A PÁGINA INICIAL
              </StyledButton>
            )
            : (
              <div>
                <Input
                  type="text"
                  name="email"
                  id="email"
                  value={formValues.email}
                  error={formErrors.email}
                  placeholder="E-mail"
                  onChange={(e) => { handleChange('email', e.target.value); render(); }}
                  onEnterKey={onSubmit}
                />
                <StyledLink to="/login">Voltar à página de login</StyledLink>
                <StyledButton onClick={onSubmit} variant="primary">
                  {state.loading ? <Loader size="small" variant="secondary" /> : 'ENVIAR'}
                </StyledButton>
              </div>
            )}
        </ForgotPasswordCard>
      </ContainerCard>
    </>
  );
};

export default withTransaction('ForgotPassword', 'component')(ForgotPassword);

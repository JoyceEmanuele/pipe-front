import axios from 'axios';
import * as yup from 'yup';
import { toast } from 'react-toastify';

import { useStateVar } from '~/helpers/useStateVar';
import formFieldsValidator from '~/helpers/formFieldsValidator';
import { apiCall } from '~/providers';

import { ForgotPasswordInput, MainContent } from './styles';
import { Button } from '~/components';
import moment from 'moment';
import i18n from '~/i18n';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordProps {
  setIsLogin: () => void
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ setIsLogin }) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const [state, render, setState] = useStateVar(() => {
    yup.setLocale({
      mixed: {
        required: `${t('campoObrigatorio')}`,
      },
    });
    const formForgotPasswordValues = {
      email: '',
    };
    const checkers = {
      email: yup.string().required().email(t('emailInvalido')),
    };
    const state = {
      loading: false,
      send: false,
      formData: formFieldsValidator(checkers as any, formForgotPasswordValues),
      isEnergia: window.location.href.includes('energia.dielenergia.com'),
    };
    return state;
  });

  const {
    values: formForgotPasswordValues,
    handleChange,
    errors: formForgotPasswordErrors,
  } = state.formData;

  const onSubmit = async () => {
    try {
      if (!(await state.formData.checkAll())) {
        render();
        return;
      }
      setState({ loading: true });

      if (state.isEnergia) {
        const { error, message } = await axios
          .post('https://backend.greenant.com.br/api/forgot', {
            email: formForgotPasswordValues.email,
          })
          .then((r) => r.data);
        if (error) {
          toast.error(String(error));
        } else {
          toast.success(message || t('verifiqueEmail'));
          setState({ send: true });
        }
      } else {
        await apiCall('/login/forgot', { user: formForgotPasswordValues.email });
        toast.success(t('verifiqueEmail'));
        setState({ send: true });
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erroRedefinirSenha'));
    } finally {
      setState({ loading: false });
    }
  };

  return (
    <>
      {
        !state.send ? (
          <MainContent>
            <h1>{t('esqueciSenha')}</h1>
            <p>
              {t('esqueciSenhaTexto')}
            </p>
            <ForgotPasswordInput
              label={t('email').toUpperCase()}
              value={formForgotPasswordValues.email}
              error={formForgotPasswordErrors.email}
              id="email"
              name="email"
              placeholder={t('email')}
              onChange={(e) => { handleChange('email', e.target.value); render(); }}
            />
            <Button variant="primary" onClick={onSubmit}>{t('enviar')}</Button>
            <span className="outlineButton" onClick={setIsLogin}>{t('voltarLogin')}</span>
          </MainContent>
        ) : (
          <MainContent>
            <h1>{t('emailEnviado')}</h1>
            <p>
              {t('emailEnviadoTexto')}
            </p>
            <Button variant="primary" onClick={setIsLogin}>{t('voltarLogin')}</Button>
          </MainContent>
        )
      }
    </>
  );
};

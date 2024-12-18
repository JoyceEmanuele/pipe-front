import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import * as yup from 'yup';
import { setLocale } from 'yup';

import { Input, Breadcrumb, Button } from '~/components';
import formFieldsValidator from '~/helpers/formFieldsValidator';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall } from '~/providers';

import { Card } from './styles';
import { withTransaction } from '@elastic/apm-rum-react';

export const ChangePassword = ({ match, history }) => {
  const [state, render, setState] = useStateVar(() => {
    setLocale({
      mixed: {
        required: 'Campo obrigatório',
      },
    });
    const formValues = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    const checkers = {
      oldPassword: yup
        .string()
        .required()
        .min(5, 'Sua senha deve conter 5 ou mais digitos.'),
      newPassword: yup
        .string()
        .required()
        .min(5, 'Sua senha deve conter 5 ou mais digitos.'),
      confirmPassword: (value: any) => {
        if (!value) return 'Confirme sua senha';
        if (value !== formValues.newPassword) return 'As senhas não são iguais';
      },
    };
    const state = {
      isLoading: false,
      formData: formFieldsValidator(checkers as any, formValues),
    };
    return state;
  });
  const {
    values: formValues, handleChange, errors: formErrors, checkField,
  } = state.formData;

  async function handleSubmit() {
    try {
      if (!await state.formData.checkAll()) {
        render();
        return;
      }
      setState({ isLoading: true });
      const profile = getUserProfile();
      const response = await apiCall('/login', { user: profile.user!, password: formValues.oldPassword });
      if (response) {
        await apiCall('/users/edit-user', { USER: profile.user!, PASSWORD: formValues.newPassword });
        toast.success('Senha alterada com sucesso!');
        history.push('/configuracoes');
      }
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível alterar sua senha.');
    } finally {
      setState({ isLoading: false });
    }
  }

  return (
    <>
      <Helmet>
        <title>Diel Energia - Alterar senha</title>
      </Helmet>
      <Flex flexDirection="column">
        <Box width={1} pt="8px" mb={33}>
          <Breadcrumb />
        </Box>
        <Box width={1}>
          <Card>
            <div>
              <Flex flexDirection="column">
                <Box width={[1, 1, 1, 2 / 4, '280px']} mb={24}>
                  <Input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    error={formErrors.oldPassword}
                    value={formValues.oldPassword}
                    onChange={(e) => { handleChange('oldPassword', e.target.value); render(); }}
                    onBlur={() => { checkField('oldPassword'); render(); }}
                    placeholder="Senha atual"
                    disabled={state.isLoading}
                    onEnterKey={handleSubmit}
                  />
                </Box>
                <Box width={[1, 1, 1, 2 / 4, '280px']} mb={24}>
                  <Input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    error={formErrors.newPassword}
                    value={formValues.newPassword}
                    onChange={(e) => { handleChange('newPassword', e.target.value); render(); }}
                    onBlur={() => { checkField('newPassword'); render(); }}
                    placeholder="Senha nova"
                    disabled={state.isLoading}
                    onEnterKey={handleSubmit}
                  />
                </Box>
                <Box width={[1, 1, 1, 2 / 4, '280px']} mb={32}>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    error={formErrors.confirmPassword}
                    value={formValues.confirmPassword}
                    onChange={(e) => { handleChange('confirmPassword', e.target.value); render(); }}
                    onBlur={() => { checkField('confirmPassword'); render(); }}
                    placeholder="Repetir nova senha"
                    disabled={state.isLoading}
                    onEnterKey={handleSubmit}
                  />
                </Box>
                <Box>
                  <Flex flexWrap="wrap">
                    <Box width={[1, 1, 1, 2 / 4, '280px']} mr={[0, 0, 0, 24, 24]} mb={[16, 16, 16, 16, 0]}>
                      <Button variant="secondary" onClick={() => history.push('/configuracoes')}>
                        voltar
                      </Button>
                    </Box>
                    <Box width={[1, 1, 1, 2 / 4, '280px']}>
                      <Button onClick={handleSubmit} variant={state.isLoading ? 'disabled' : 'primary'}>
                        Salvar
                      </Button>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </div>
          </Card>
        </Box>
      </Flex>
    </>
  );
};

export default withTransaction('ChangePassword', 'component')(ChangePassword);

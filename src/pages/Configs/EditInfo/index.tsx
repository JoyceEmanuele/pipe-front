import { useEffect, useState } from 'react';

import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import * as yup from 'yup';

import {
  Breadcrumb, Button, RadioButton, Loader, Input, SelectMultiple, ActionButton, Checkbox,
} from 'components';
import formFieldsValidator from 'helpers/formFieldsValidator';
import { getUserProfile, setUpdatedProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import { DeleteOutlineIcon } from 'icons';
import { apiCall, ApiParams } from 'providers';
import { colors } from 'styles/colors';
import i18n from '~/i18n';
import SelectSearch from 'react-select-search';
import {
  Text,
  CardWrapper,
  ProfilesTable,
  StyleSelect,
} from './styles';
import { useTranslation } from 'react-i18next';
import { withTransaction } from '@elastic/apm-rum-react';

export const EditInfo = ({ match, history }) => {
  const [profile] = useState(getUserProfile);
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar(() => {
    const formValues = {
      name: profile.name || '',
      lastName: profile.lastName || '',
      clients: [] as {
        CLIENT_ID: number
        NAME: string
        checked?: boolean
      }[],
    };

    yup.setLocale({
      mixed: {
        required: 'Campo obrigatório',
      },
    });

    const checkers = {
      name: yup.string().required(t('campoNomeNecessario')),
      lastName: yup.string().required(t('campoSobrenomeNecessario')),
    };

    const state = {
      isLoading: false,
      simulateProfile: false,
      simularPerfilParceiroValidador: false,
      simularPerfilInstalador: false,
      isEdit: false,
      notifsBy: profile.notifsby,
      viewTratedData: profile.prefsObj.viewTratedData || false,
      language: i18n.language as string | undefined,
      temperature: ['celsius'] as string | string[],
      clientsList: [] as {
        CLIENT_ID: number
        NAME: string
        checked?: boolean
      }[],
      cProfiles: {} as {
        [clientIdStr: string]: '[U]'|'[C]'|'[I]'|'[CP]'
      },
      profile,
      radioState: profile.prefsObj.pressureUnit || (profile.permissions.isInstaller ? 'psi' : 'bar'),
      waterMeasuring: profile.prefsObj.water || (profile.permissions.isInstaller ? 'liters' : 'cubic'),
      formData: formFieldsValidator(checkers as any, formValues),
    };
    return state;
  });
  useEffect(onMount, []);
  function onMount() {
    const { values } = state.formData;
    if (state.profile.permissions.isAdminSistema) {
      apiCall('/clients/get-clients-list', { withManagerPermission: true }).then((response) => {
        state.clientsList = response.list;
        if ((state.clientsList.length === 1) && (!state.isEdit)) {
          values.clients = [...state.clientsList];
          state.cProfiles[String(values.clients[0].CLIENT_ID)] = '[U]';
        }
        render();
      })
        .catch((err) => { console.log(err); toast.error(t('houveErro')); });
    }
  }

  async function handleSubmit() {
    const { values } = state.formData;
    try {
      state.isLoading = true; render();
      const updatedData: Parameters<typeof setUpdatedProfile>[0] = {
        ...profile,
      };
      updatedData.name = values.name;
      updatedData.lastName = values.lastName;
      updatedData.notifsby = state.notifsBy || 'email';
      updatedData.prefs = JSON.stringify({
        ...profile.prefsObj,
        pressureUnit: state.radioState,
        language: state.language,
        water: state.waterMeasuring,
        viewTratedData: state.viewTratedData,
      });

      await apiCall('/users/edit-user', {
        USER: profile.user,
        NOME: values.name,
        SOBRENOME: values.lastName,
        NOTIFSBY: state.notifsBy || 'email',
        PREFS: JSON.stringify({
          pressureUnit: state.radioState,
          language: state.language,
          water: state.waterMeasuring,
          viewTratedData: state.viewTratedData,
        }),
      });
      i18n.changeLanguage(state.language);
      setUpdatedProfile(updatedData); // localStorage.setItem('@diel:profile', JSON.stringify(updatedData))
      toast.success(t('sucessoEditarDados'));
      history.push('/configuracoes');
    } catch (err) {
      console.log(err);
      toast.error(t('erroEditarDados'));
    } finally {
      state.isLoading = false; render();
    }
  }

  async function submitProfileSim() {
    sessionStorage.clear();
    const { values } = state.formData;
    try {
      let fakeProfile: ApiParams['/login/impersonate']['fakeProfile'];
      if (state.simulateProfile) {
        fakeProfile = {};
        fakeProfile.clients_v2 = values.clients.map((client) => ({
          CLIENT_ID: client.CLIENT_ID,
          PERMS: state.simularPerfilInstalador ? '[I]' : state.cProfiles[String(client.CLIENT_ID)] || undefined,
          UNITS: undefined,
        }));
        if (state.simularPerfilParceiroValidador) {
          fakeProfile.PERMS_U = '[PV]';
        }
        if (state.simularPerfilInstalador) {
          fakeProfile.PERMS_U = '[I]';
        }
        if (fakeProfile.PERMS_U && fakeProfile.clients_v2.length === 0) {
          delete fakeProfile.clients_v2;
        }
      }
      console.log(fakeProfile);
      const profile = await apiCall('/login/impersonate', { fakeProfile });

      localStorage.setItem('@diel:token', profile.token);
      delete (profile as any).token;
      setUpdatedProfile(profile); // localStorage.setItem('@diel:profile', JSON.stringify(profile));

      window.location.reload();
    } catch (err) {
      console.log(err);
      toast.error(t('erroSalvar'));
    }
  }

  const {
    values, handleChange, checkField, errors,
  } = state.formData;

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaEditarInformacoes')}</title>
      </Helmet>
      <Flex mb="32px">
        <Box>
          <Breadcrumb />
        </Box>
      </Flex>
      <Flex>
        <Box width={1}>
          <CardWrapper>
            <Flex mb="16px">
              <Box width={[1, 1, 1, 2 / 3, 1 / 3]}>
                <Flex mb="24px">
                  <Box width={1}>
                    <Input
                      name="name"
                      placeholder={t('nome')}
                      value={values.name}
                      onBlur={() => { checkField('name'); render(); }}
                      onChange={(e) => { handleChange('name', e.target.value); render(); }}
                      error={errors.name}
                    />
                  </Box>
                </Flex>
                <Flex mb="24px">
                  <Box width={1}>
                    <Input
                      name="lastName"
                      placeholder={t('sobrenome')}
                      value={values.lastName}
                      onBlur={() => { checkField('lastName'); render(); }}
                      onChange={(e) => { handleChange('lastName', e.target.value); render(); }}
                      error={errors.lastName}
                    />
                  </Box>
                </Flex>
                <Text isBold>{t('receberNotificacoesPor')}</Text>
                <Flex mt="6px" mb="24px" alignItems="center" justifyContent="flex-start">
                  <Box mr="12px">
                    <RadioButton
                      label={t('email')}
                      checked={!['telegram', 'email and telegram'].includes(state.notifsBy!)}
                      onClick={() => { state.notifsBy = 'email'; render(); }}
                    />
                  </Box>
                  <Box ml="12px">
                    <RadioButton
                      label={t('telegram')}
                      checked={state.notifsBy === 'telegram'}
                      onClick={() => { state.notifsBy = 'telegram'; render(); }}
                    />
                  </Box>
                  <Box ml="12px">
                    <RadioButton
                      label={t('ambos')}
                      checked={state.notifsBy === 'email and telegram'}
                      onClick={() => { state.notifsBy = 'email and telegram'; render(); }}
                    />
                  </Box>
                </Flex>
                <Flex style={{
                  display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', width: '200px',
                }}
                >
                  <OptionsSelect
                    value={state.language}
                    options={[{ value: 'pt', name: t('portugues') }, { value: 'en', name: t('ingles') }]}
                    onChange={(value) => setState({ language: value })}
                    loading={state.isLoading}
                    label={t('idioma')}
                  />
                  <OptionsSelect
                    value={state.radioState}
                    options={[{ value: 'psi', name: 'PSI' }, { value: 'bar', name: 'Bar' }]}
                    onChange={(value) => setState({ radioState: value })}
                    loading={state.isLoading}
                    label={t('unidadePressao')}
                  />
                  <OptionsSelect
                    value={state.temperature}
                    options={[{ value: 'celsius', name: '°C' }, { value: 'fahrenheit', name: '°F' }, { value: 'kelvin', name: 'Kelvin' }]}
                    onChange={(value) => setState({ temperature: value })}
                    loading={state.isLoading}
                    label={t('unidadeTemperatura')}
                  />
                  <OptionsSelect
                    value={state.waterMeasuring}
                    options={[{ value: 'liters', name: 'L' }, { value: 'cubic', name: 'm³' }]}
                    onChange={(value) => setState({ waterMeasuring: value })}
                    loading={state.isLoading}
                    label={t('unidadeMedicaoAgua')}
                  />
                </Flex>
                {
                  profile.permissions.isAdminSistema && (
                    <Flex style={{
                      display: 'flex', flexDirection: 'column', marginBottom: '20px',
                    }}
                    >
                      <Text isBold>{t('visualizarDadosTratadosPlataforma')}</Text>
                      <Flex mt="6px" mb="24px" alignItems="center" justifyContent="flex-start">
                        <Box mr="12px">
                          <RadioButton
                            label={t('nao')}
                            checked={!state.viewTratedData}
                            onClick={() => setState({ viewTratedData: false })}
                          />
                        </Box>
                        <Box ml="12px">
                          <RadioButton
                            label={t('sim')}
                            checked={state.viewTratedData}
                            onClick={() => setState({ viewTratedData: true })}
                          />
                        </Box>
                      </Flex>
                    </Flex>
                  )
                }
              </Box>
            </Flex>
            <Flex alignItems="center" flexWrap="wrap">
              <Box
                width={[1, 1, 1, 1 / 3, 1 / 3]}
                mr={[0, 0, 0, '12px', '12px']}
                mb={['24px', '24px', '24px', 0, 0]}
              >
                <div onClick={() => history.push('/configuracoes')}>
                  <Button variant="secondary">{t('botaoVoltar')}</Button>
                </div>
              </Box>
              <Box width={[1, 1, 1, 1 / 3, 1 / 3]} ml={[0, 0, 0, '12px', '12px']}>
                <Button variant="primary" onClick={handleSubmit}>
                  {state.isLoading ? <Loader size="small" variant="secondary" /> : t('botaoSalvar')}
                </Button>
              </Box>
            </Flex>

            {((state.profile as any).profileSim) && (
              <div>
                <hr style={{ margin: '50px 0' }} />
                <Button variant="primary" onClick={submitProfileSim}>{t('pararSimulacaoPerfil')}</Button>
              </div>
            )}
            {(state.profile.permissions.isAdminSistema && !(state.profile as any).profileSim) && (
              <div>
                <hr style={{ margin: '50px 0' }} />
                <Checkbox
                  checked={state.simulateProfile}
                  label={t('simularPerfil')}
                  onClick={() => { state.simulateProfile = !state.simulateProfile; render(); }}
                  style={{ marginTop: '15px', marginBottom: '8px' }}
                />

                {(state.simulateProfile) && (
                  <div>
                    <div style={{ display: 'flex' }}>
                      <Checkbox
                        checked={state.simularPerfilParceiroValidador}
                        label={t('parceiroValidador')}
                        onClick={() => { state.simularPerfilParceiroValidador = !state.simularPerfilParceiroValidador; render(); }}
                        style={{ marginTop: '15px', marginBottom: '8px' }}
                      />
                    </div>
                    <div style={{ display: 'flex' }}>
                      <Checkbox
                        checked={state.simularPerfilInstalador}
                        label={t('perfilInstalador')}
                        onClick={() => { state.simularPerfilInstalador = !state.simularPerfilInstalador; render(); }}
                        style={{ marginTop: '15px', marginBottom: '8px' }}
                      />
                    </div>
                    <SelectMultiple
                      options={state.clientsList}
                      propLabel="NAME"
                      values={values.clients}
                      error={errors.clients}
                      placeholder={t('clientes')}
                      onSelect={
                        (item, list, newValues) => {
                          handleChange('clients', newValues || []);
                          checkField('clients');
                          if (item && !state.cProfiles[String(item.CLIENT_ID)]) {
                            state.cProfiles[String(item.CLIENT_ID)] = '[U]';
                          }
                          render();
                        }
                      }
                      style={{ marginBottom: '15px' }}
                    />
                    {
                      !state.simularPerfilInstalador && (
                        <ProfilesTable>
                          <tbody>
                            {values.clients.map((client) => (
                              <tr style={{ display: 'flex', alignItems: 'center' }} key={client.CLIENT_ID}>
                                <td>
                                  {client.NAME}
                                  :
                                </td>
                                <td>
                                  <RadioButton
                                    checked={state.cProfiles[String(client.CLIENT_ID)] === '[U]'}
                                    onClick={() => { state.cProfiles[String(client.CLIENT_ID)] = '[U]'; render(); }}
                                    label={t('usuario')}
                                  />
                                </td>
                                <td>
                                  <RadioButton
                                    checked={state.cProfiles[String(client.CLIENT_ID)] === '[C]' || state.cProfiles[String(client.CLIENT_ID)] === '[CP]'}
                                    onClick={() => { state.cProfiles[String(client.CLIENT_ID)] = '[C]'; render(); }}
                                    label="Admin"
                                  />
                                </td>
                                <td>
                                  {
                                    (state.cProfiles[String(client.CLIENT_ID)] === '[C]' || state.cProfiles[String(client.CLIENT_ID)] === '[CP]') && (
                                      <Checkbox
                                        checked={state.cProfiles[String(client.CLIENT_ID)] === '[CP]'}
                                        label={t('Possui permissão para controlar Automação?')}
                                        onClick={() => { state.cProfiles[String(client.CLIENT_ID)] === '[CP]' ? state.cProfiles[String(client.CLIENT_ID)] = '[C]' : state.cProfiles[String(client.CLIENT_ID)] = '[CP]'; render(); }}
                                        style={{
                                          marginLeft: '5px', marginRight: '20px',
                                        }}
                                        size={15}
                                      />
                                    )
                                  }
                                </td>
                                <td>
                                  {(state.clientsList.length > 1)
                                    && <ActionButton onClick={() => { handleChange('clients', values.clients.filter((x) => x !== client)); checkField('clients'); render(); }} variant="red-inv"><DeleteOutlineIcon colors={colors.Black} /></ActionButton>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </ProfilesTable>
                      )
                    }
                  </div>
                )}
                <Button variant="primary" onClick={submitProfileSim}>{t('botaoEnviar')}</Button>
              </div>
            )}
          </CardWrapper>
        </Box>
      </Flex>
    </>
  );
};

function OptionsSelect({
  onChange, value, loading, label, options,
}) {
  return (
    <StyleSelect>
      <label>{label}</label>
      <SelectSearch
        options={options}
        disabled={loading}
        value={value}
        onChange={onChange}
      />
    </StyleSelect>
  );
}

export default withTransaction('EditInfo', 'component')(EditInfo);

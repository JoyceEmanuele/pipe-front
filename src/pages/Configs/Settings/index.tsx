import { useState, useMemo, useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import {
  Breadcrumb, Button, Input, ModalWindow, Loader,
} from '~/components';
import { getUserProfile, refreshUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall } from '~/providers';
import {
  Text,
  CardWrapper,
  EditLink,
  StyleSelectedOptions,
} from './styles';
import { useTranslation } from 'react-i18next';
import brasilIcon from '../../../assets/img/brasil.svg';
import usaIcon from '../../../assets/img/estadosunidos.svg';
import i18n from '~/i18n';
import { withTransaction } from '@elastic/apm-rum-react';

const t = i18n.t.bind(i18n);

function parseData(pressure) {
  if (pressure === 'psi') return 'PSI';
  return 'Bar';
}

function parseDataLanguage(language) {
  if (language === 'pt') return t('portugues');
  return t('ingles');
}

function parseDataWater(pressure) {
  if (pressure === 'liters') return 'L';
  return 'm³';
}

// ['/users/send-tg-number-check']: (session: SessionData, reqParams: { USER_ID: string, PHONENB: string }) => Promise<string>
// ['/users/check-tg-number-code']: (session: SessionData, reqParams: { USER_ID: string, TOKEN: string }) => Promise<string>

export const Settings = ({ match, history }) => {
  const profileData = getUserProfile();
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    submitting: false,
    openModal: null, // 'code', 'phone'
    isLoading: false,
    language: [profileData && profileData.prefsObj && profileData.prefsObj.language
      ? parseDataLanguage(profileData.prefsObj.language)
      : '-'] as any | any[],
    temperature: ['°C'] as any | any[],
    pressure: [profileData && profileData.prefsObj && profileData.prefsObj.pressureUnit
      ? parseData(profileData.prefsObj.pressureUnit)
      : '-'] as any | any[],
    water: [profileData && profileData.prefsObj && profileData.prefsObj.water
      ? parseDataWater(profileData.prefsObj.water)
      : '-'] as any | any[],
  });
  async function onConfirmPhone(phonenb) {
    try {
      if (phonenb) {
        phonenb = phonenb.replace(/[^\d]/g, '');
        if (phonenb.length < '1122223333'.length) { return alert(t('numeroInvalido')); }
        if (phonenb.length < '5511922223333'.length) { phonenb = `55${phonenb}`; }
        phonenb = `+${phonenb}`;
      }
      setState({ submitting: true });
      await apiCall('/users/send-tg-number-check', {
        USER_ID: profileData.user,
        PHONENB: phonenb || null,
      });
      if (!phonenb) {
        await refreshUserProfile();
        window.location.reload();
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    // @ts-ignore
    setState({ submitting: false, openModal: (phonenb ? 'code' : null) });
  }

  async function onConfirmCode(code) {
    try {
      setState({ submitting: true });
      await apiCall('/users/check-tg-number-code', {
        USER_ID: profileData.user,
        TOKEN: code,
      });
      await refreshUserProfile();
      window.location.reload();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    setState({ submitting: false, openModal: null });
  }

  function verifyChanges() {
    const verifications = {
      language: state.language,
      pressure: state.pressure,
      temperature: state.temperature,
    };

    if (verifications.language === i18n.language) {
      toast.success(t('sucessoMudancasConfiguracoes'));
    } else {
      toast.error(t('houveErro'));
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaConfiguracoes')}</title>
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
                <Text isBold>{t('nome')}</Text>
                <Text>{(profileData && profileData.name) || '-'}</Text>
                <Text isBold>{t('sobrenome')}</Text>
                <Text>{(profileData && profileData.lastName) || '-'}</Text>
                <Text isBold>{t('numeroTelegram')}</Text>
                <Text>
                  {(profileData && profileData.phonenb) || '-'}
                  &nbsp; &nbsp;
                  {/* @ts-ignore */}
                  <EditLink onClick={() => setState({ openModal: 'phone' })}>{`(${t('editar')})`}</EditLink>
                </Text>
              </Box>
            </Flex>
            <Flex style={{
              display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', width: '200px',
            }}
            >
              <OptionsSelect
                value={state.language}
                options={[]}
                onChange={(value) => { i18n.changeLanguage(value); setState({ language: value }); }}
                loading={state.isLoading}
                label={t('idioma')}
                icone={i18n.language === 'pt' ? brasilIcon : usaIcon}
              />
              <OptionsSelect
                value={state.pressure}
                options={[]}
                onChange={(value) => setState({ pressure: value })}
                loading={state.isLoading}
                label={t('unidadePressao')}
                icone=""
              />
              <OptionsSelect
                value={state.temperature}
                options={[]}
                onChange={(value) => setState({ temperature: value })}
                loading={state.isLoading}
                label={t('unidadeTemperatura')}
                icone=""
              />
              <OptionsSelect
                value={state.water}
                options={[]}
                onChange={(value) => setState({ water: value })}
                loading={state.isLoading}
                label={t('unidadeMedicaoAgua')}
                icone=""
              />
            </Flex>
            {
              profileData.permissions.isAdminSistema && (
                <Flex style={{
                  display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px',
                }}
                >
                  <>
                    <Text isBold>{t('visualizarDadosTratadosPlataforma')}</Text>
                    <Text>{profileData.prefsObj.viewTratedData ? t('sim') : t('nao')}</Text>
                  </>
                </Flex>
              )
            }
            <Flex alignItems="center" flexWrap="wrap" style={{ gap: '20px' }}>
              <Box width={[1, 1, 1, 1 / 3, 1 / 3]} mr={[0, 0, 0, '12px', '12px']} mb={['24px', '24px', '24px', 0, 0]} margin="10px">
                <div onClick={() => history.push('/configuracoes/alterar-senha')}>
                  <Button variant="secondary">{t('botaoAlterarSenha')}</Button>
                </div>
              </Box>
              <Box width={[1, 1, 1, 1 / 3, 1 / 3]} mr={[0, 0, 0, '12px', '12px']} mb={['24px', '24px', '24px', 0, 0]} margin="10px">
                <div onClick={() => history.push('/configuracoes/editar')}>
                  <Button variant="primary">{t('botaoEditarPerfil')}</Button>
                </div>
              </Box>
            </Flex>
          </CardWrapper>
        </Box>
      </Flex>
      {(state.openModal != null)
        && (
        // @ts-ignore
        <ModalWindow>
          {(state.openModal === 'phone')
            && (
            <FormEditValue
              currentValue={(profileData && profileData.phonenb) || ''}
              label={t('numeroTelefone')}
              submitting={state.submitting}
              onConfirm={onConfirmPhone}
              onCancel={() => setState({ openModal: null })}
              t={t}
            />
            )}
          {(state.openModal === 'code')
            && (
            <FormEditValue
              currentValue=""
              label={t('codigoRecebido')}
              submitting={state.submitting}
              onConfirm={onConfirmCode}
              onCancel={() => setState({ openModal: null })}
              t={t}
            />
            )}
        </ModalWindow>
        )}
    </>
  );
};

function FormEditValue({
  currentValue, label, submitting, onConfirm, onCancel, t,
}) {
  const [state, render, setState] = useStateVar({
    value: currentValue,
  });

  useMemo(() => {
    state.value = currentValue;
  }, [currentValue]);

  if (submitting) {
    return <div><Loader /></div>;
  }

  return (
    <div>
      <div>
        <Input
          type="text"
          value={state.value}
          placeholder={label}
          onChange={(event) => setState({ value: event.target.value })}
        />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
      }}
      >
        <Button style={{ width: '140px' }} onClick={() => onConfirm(state.value)} variant="primary">
          {t('botaoConfirmar')}
        </Button>
        {/* @ts-ignore */}
        <Button style={{ width: '140px', margin: '0 20px' }} onClick={onCancel} variant="grey">
          {t('botaoCancelar')}
        </Button>
      </div>
    </div>
  );
}

function OptionsSelect({
  onChange, value, loading, label, icone,
}) {
  return (
    <StyleSelectedOptions>
      <label>{label}</label>
      <div
        disabled={loading}
        onChange={onChange}
      >
        {
          icone && <img src={icone} alt="" />
        }
        <p>{value}</p>
      </div>
    </StyleSelectedOptions>
  );
}

export default withTransaction('Settings', 'component')(Settings);

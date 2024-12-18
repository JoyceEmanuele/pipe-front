import { Flex } from 'reflexbox';
import {
  Input, Button,
  Loader,
} from '~/components';
import {
  Card, Title, CustomInput, Label, BtnClean,
} from './styles';
import SelectSearch from 'react-select-search';
import { Headers2 } from '../../Header';
import { SelectDMTport } from 'components/SelectDmtPort';
import { DALSchedule } from '../../SchedulesModals/DAL_Schedule';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStateVar } from '~/helpers/useStateVar';
import { ApiResps, apiCall } from '~/providers';
import { toast } from 'react-toastify';
import { useEffect, useRef } from 'react';
import queryString from 'query-string';
import { Select } from '~/components/NewSelect';
import { StyledLink } from '../Nobreak/styles';

export const IlluminationEdit = ({ utilInfo, getUtilityInfo }): JSX.Element => {
  const match = useRouteMatch<{ utilId: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    linkBase: match.url.split(`/${match.params.utilId}`)[0],
    isLoading: false,
    utilInfo: utilInfo as (ApiResps['/dal/get-illumination-info']),
    ports: [] as {
      label: string,
      associated: boolean,
      port: number,
      illuminationId?: number,
    }[],
    feedbacks: [] as {
      label: string,
      associated: boolean,
      port: number,
      illuminationId?: number,
    }[],
    selectedPort: null as null|number,
    selectedFeedback: null as null|string,
    defaultModeOpts: [
      { name: t('ligadoMinusculo'), value: '1' },
      { name: t('desligadoMinusculo'), value: '0' },
    ],
    exceededExceptionLimit: false,
  });
  const [formData, _, setForm] = useStateVar({
    GRID_VOLTAGE: state.utilInfo?.GRID_VOLTAGE ? `${state.utilInfo.GRID_VOLTAGE} VAC` : '' as any,
    GRID_CURRENT: state.utilInfo?.GRID_CURRENT?.toString() || '',
    PORT: state.utilInfo?.PORT || null,
    FEEDBACK: state.utilInfo?.FEEDBACK ? `F${state.utilInfo.FEEDBACK}` : null,
    DEFAULT_MODE: state.utilInfo?.DEFAULT_MODE,
  });
  const { utilId } = match.params;
  const deviceCode = (utilInfo?.DMT_CODE || utilInfo?.DAL_CODE || utilInfo?.DAM_ILLUMINATION_CODE);

  async function getDevicePortsInfo(utilInfo) {
    if (utilInfo?.DAL_CODE) {
      const portsInfo = await apiCall('/dal/get-dal-ports-info', { DAL_CODE: utilInfo.DAL_CODE, CLIENT_ID: utilInfo.CLIENT_ID });
      state.ports = portsInfo.ports;
      state.feedbacks = portsInfo.feedbacks.map((x) => ({ ...x, label: 'F'.concat(x.label) }));
    } else if (utilInfo?.DMT_CODE) {
      const portsInfo = await apiCall('/dmt/get-dmt-ports-info', { DMT_CODE: utilInfo.DMT_CODE, CLIENT_ID: utilInfo.CLIENT_ID, NEW_UTILITY_TYPE: 'Illumination' });
      state.ports = portsInfo.ports;
    }
  }

  const backToLastRoute = () => {
    // @ts-ignore
    if (history.location.state && history.location.state.from === 'dmtInfo' && (state.utilInfo.DMT_CODE || state.utilInfo.DAL_CODE || state.utilInfo.DAM_ILLUMINATION_CODE)) {
      history.push(`/analise/dispositivo/${(state.utilInfo.DMT_CODE || state.utilInfo.DAL_CODE || state.utilInfo.DAM_ILLUMINATION_CODE)}/informacoes`);
    } else {
      history.push(`${state.linkBase}/${utilId}/informacoes`);
    }
  };

  async function getExtraUtilityInfo() {
    if (utilInfo) {
      try {
        setState({ isLoading: true });
        updateForm(utilInfo);
        await getDevicePortsInfo(utilInfo);
      } catch (err) {
        toast.error(t('houveErro'));
        console.log(err);
      }
      setState({ isLoading: false });
    }
  }

  function updateForm(utilInfo) {
    setForm({
      GRID_VOLTAGE: utilInfo.GRID_VOLTAGE?.toString().concat(' VAC') || '',
      GRID_CURRENT: utilInfo.GRID_CURRENT?.toString() || '',
      PORT: utilInfo.PORT || undefined,
      FEEDBACK: utilInfo?.FEEDBACK ? `F${utilInfo.FEEDBACK}` : undefined,
      DEFAULT_MODE: utilInfo?.DEFAULT_MODE,
    });
  }

  useEffect(() => {
    getExtraUtilityInfo();
  }, []);

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;
  const allTabs = [
    {
      title: t('utilitario'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'utilitario' })}`,
      visible: true,
      isActive: (queryPars.aba === 'utilitario') || (!queryPars.aba),
      ref: useRef(null),
    },
    {
      title: t('automacao'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'automacao' })}`,
      visible: !!(state.utilInfo?.DAL_CODE && state.utilInfo?.PORT),
      isActive: (queryPars.aba === 'automacao'),
      ref: useRef(null),
    },
  ];
  const tabs = allTabs.filter((x) => x.visible);

  async function setDmtIllumination() {
    await apiCall('/dmt/set-dmt-illumination', {
      ID: state.utilInfo.ID,
      DMT_CODE: state.utilInfo.DMT_CODE,
      UNIT_ID: state.utilInfo.UNIT_ID,
      NAME: state.utilInfo.NAME,
      GRID_CURRENT: formData.GRID_CURRENT ? Number(formData.GRID_CURRENT) : null,
      GRID_VOLTAGE: formData.GRID_VOLTAGE ? Number(formData.GRID_VOLTAGE.split(' ')[0]) : null,
      PORT: formData.PORT,
      FEEDBACK: formData.FEEDBACK ? Number(formData.FEEDBACK.split('F')[1]) : null,
    });
  }
  async function setDalIllumination() {
    await apiCall('/dal/set-dal-illumination', {
      ID: state.utilInfo.ID,
      DAL_CODE: state.utilInfo.DAL_CODE,
      UNIT_ID: state.utilInfo.UNIT_ID,
      NAME: state.utilInfo.NAME,
      GRID_CURRENT: formData.GRID_CURRENT ? Number(formData.GRID_CURRENT) : null,
      GRID_VOLTAGE: formData.GRID_VOLTAGE ? Number(formData.GRID_VOLTAGE.split(' ')[0]) : null,
      PORT: formData.PORT,
      FEEDBACK: formData.FEEDBACK ? Number(formData.FEEDBACK.split('F')[1]) : null,
      DEFAULT_MODE: formData?.DEFAULT_MODE,
    });
  }
  async function setDamIllumination() {
    await apiCall('/dam/set-dam-illumination', {
      ID: state.utilInfo.ID,
      DAM_ILLUMINATION_CODE: state.utilInfo.DAM_ILLUMINATION_CODE,
      UNIT_ID: state.utilInfo.UNIT_ID,
      NAME: state.utilInfo.NAME,
      GRID_CURRENT: formData.GRID_CURRENT ? Number(formData.GRID_CURRENT) : null,
      GRID_VOLTAGE: formData.GRID_VOLTAGE ? Number(formData.GRID_VOLTAGE.split(' ')[0]) : null,
    });
  }

  async function confirmEditUtil() {
    try {
      if (!((allTabs[1].isActive) && utilInfo?.DAL_CODE)) {
        setState({ isLoading: true });
      }
      if (state.utilInfo.DMT_CODE) await setDmtIllumination();
      else if (state.utilInfo.DAL_CODE) await setDalIllumination();
      else await setDamIllumination();

      if (!((allTabs[1].isActive) && utilInfo?.DAL_CODE)) {
        await getUtilityInfo();
      }
      toast.success(t('sucessoSalvar'));

      if (!((allTabs[1].isActive) && utilInfo?.DAL_CODE)) {
        backToLastRoute();
      }
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  return (
    <Card style={{ borderTop: '10px solid #363BC4' }}>
      <Flex flexDirection="column" width="100%" padding={20} flex="wrap">
        <Flex style={{ alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          <Flex flexDirection="column">
            <span style={{ fontWeight: 700, fontSize: '12px', lineHeight: '14px' }}>{`${t('editar')} ${t('utilitario')}`}</span>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>{utilInfo?.NAME}</span>
            <span style={{ fontWeight: 500, fontSize: '11px' }}>
              {deviceCode
            && (
              <StyledLink to={`/analise/dispositivo/${deviceCode}/informacoes`}>
                {deviceCode || '-'}
              </StyledLink>
            )}
              {!deviceCode
            && (
              <>
                -
              </>
            )}
            </span>
          </Flex>
        </Flex>

        <br />
        {!state.isLoading
        && (
        <>
          {(tabs.length > 1) && <Headers2 links={tabs} />}

          {(allTabs[0].isActive) && (
            <Flex flexDirection="column" mt={40}>
              <Title>{t('informacoes')}</Title>
              <Flex flexDirection="column" marginTop="20px">
                <div style={{ width: '15%', minWidth: '200px' }}>
                  <CustomInput style={{ width: '100%' }}>
                    <div style={{ width: '100%', paddingTop: 3, zIndex: 10 }}>
                      <Label>{t('tensaoDaRede')}</Label>
                      <SelectSearch
                        options={['127 VAC', '220 VAC', '380 VAC'].map((e) => ({ name: e, value: e }))}
                        value={formData.GRID_VOLTAGE}
                        onChange={(item) => { formData.GRID_VOLTAGE = item; render(); }}
                        placeholder={t('selecioneTensao')}
                        closeOnSelect
                      />
                    </div>
                  </CustomInput>
                </div>
                <div style={{ width: '15%', minWidth: '200px', marginTop: '20px' }}>
                  <Input
                    type="text"
                    value={formData.GRID_CURRENT}
                    label={t('correnteDaRede')}
                    placeholder={t('digitar')}
                    onChange={(event) => { formData.GRID_CURRENT = event.target.value; render(); }}
                    suffix="A"
                  />
                </div>
              </Flex>

              {(utilInfo.DAL_CODE || utilInfo.DMT_CODE) && (
                <>
                  <Title style={{ marginTop: '30px' }}>{t('associacao')}</Title>
                  <Flex flexWrap="wrap" maxWidth="40%" justifyContent="space-between">
                    <div style={{ minWidth: '150px', width: '48%', marginBottom: '20px' }}>
                      <SelectDMTport
                        label={utilInfo.DMT_CODE ? t('feedbackDoDmt') : t('portaDoDal')}
                        placeholder={t('selecionar')}
                        options={state.ports}
                        propLabel="label"
                        value={utilInfo.DMT_CODE && formData.PORT ? `F${formData.PORT}` : formData.PORT}
                        hideSelected
                        onSelect={(item) => {
                          formData.PORT = item.port;
                          render();
                        }}
                      />
                      <BtnClean onClick={() => { formData.PORT = null; render(); }}>{t('limpar')}</BtnClean>
                    </div>

                    {utilInfo.DAL_CODE
                    && (
                      <div style={{ minWidth: '150px', width: '48%' }}>
                        <SelectDMTport
                          label={t('feedbackDoDal')}
                          placeholder={t('selecionar')}
                          options={state.feedbacks}
                          propLabel="label"
                          value={formData.FEEDBACK}
                          hideSelected
                          onSelect={(item) => {
                            formData.FEEDBACK = item.label;
                            render();
                          }}
                        />
                        <BtnClean onClick={() => { formData.FEEDBACK = null; render(); }}>{t('limpar')}</BtnClean>
                      </div>
                    )}
                  </Flex>
                </>
              )}
            </Flex>
          )}

          {(allTabs[1].isActive) && utilInfo?.DAL_CODE && (
            <Flex flexDirection="column">
              <Select
                label={t('statusPadrao')}
                style={{ width: '200px', marginTop: '40px' }}
                options={state.defaultModeOpts}
                propLabel="name"
                value={state.defaultModeOpts.find((opt) => opt.value === formData.DEFAULT_MODE)}
                onSelect={(item) => {
                  formData.DEFAULT_MODE = item.value;
                  render();
                  toast.warn('Atualizando Status Padrão do Utilitário. Aguarde mensagem de confirmação.');
                  confirmEditUtil();
                }}
                hideSelected
              />
              <span style={{ marginTop: '10px', width: '300px', color: '#6D6D6D' }}>
                {t('selecioneStatusDefault')}
              </span>

              <div style={{ border: '1px solid #7C7C7C33', margin: '30px 0px' }} />
              <DALSchedule
                deviceCode={utilInfo.DAL_CODE}
                illumId={utilInfo.ID}
                illumName={utilInfo.NAME}
                canEdit
                isModal={false}
                isEditUtility
                exceededExceptionLimit={state.exceededExceptionLimit}
                setExceededExceptionLimit={(value: boolean) => { console.log('entrou', value); setState({ exceededExceptionLimit: value }); render(); }}
              />
            </Flex>
          )}

          {(allTabs[0].isActive) && (
            <Flex justifyContent="space-between" alignItems="center" marginTop="40px">
              <Button
                style={{ width: '100px' }}
                onClick={confirmEditUtil}
                variant="primary"
              >
                {`${t('salvar')}`}
              </Button>
              <BtnClean onClick={backToLastRoute}>{t('cancelar')}</BtnClean>
            </Flex>
          )}
        </>
        )}
      </Flex>
    </Card>
  );
};

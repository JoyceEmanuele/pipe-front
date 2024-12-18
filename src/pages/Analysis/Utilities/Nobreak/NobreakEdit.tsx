import { Flex } from 'reflexbox';
import {
  Input, Button,
} from '~/components';
import {
  Card, Title, CustomInput, Label, BtnClean, StyledLink,
} from './styles';
import { SelectDMTport } from 'components/SelectDmtPort';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStateVar } from '~/helpers/useStateVar';
import { ApiResps, apiCall } from '~/providers';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import SelectSearch from 'react-select-search';
import { addUnitToString, getParamNumber, propOrNullValue } from '~/pages/ClientPanel/FormEditUtility';
import { colors } from '~/styles/colors';

export const NobreakEdit = ({ utilInfo, getUtilityInfo }): JSX.Element => {
  const match = useRouteMatch<{ utilId: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    linkBase: match.url.split(`/${match.params.utilId}`)[0],
    isLoading: false,
    utilInfo: utilInfo as (ApiResps['/dmt/get-nobreak-info']),
    ports: [] as {
      label: string,
      associated: boolean,
      port: number,
      nobreakId?: number,
    }[],
    selectedPort: null as null|number,
    selectedFeedback: null as null|string,
  });
  const [formData, _, setForm] = useStateVar({
    PORT: state.utilInfo?.PORT || null,
    MANUFACTURER: state.utilInfo?.MANUFACTURER || '',
    MODEL: state.utilInfo?.MODEL || '',
    NOMINAL_POTENTIAL: (state.utilInfo?.NOMINAL_POTENTIAL && state.utilInfo?.NOMINAL_POTENTIAL.toString()) || '',
    OUTPUT_VOLTAGE: addUnitToString(state.utilInfo?.OUTPUT_VOLTAGE.toString(), 'VAC') as any,
    INPUT_VOLTAGE: addUnitToString(state.utilInfo?.INPUT_VOLTAGE.toString(), 'VAC') as any,
    BATTERY_LIFE: (state.utilInfo?.NOMINAL_BATTERY_LIFE && state.utilInfo?.NOMINAL_BATTERY_LIFE.toString()) || '',
    INPUT_ELECTRIC_CURRENT: (state.utilInfo?.INPUT_ELECTRIC_CURRENT && state.utilInfo?.INPUT_ELECTRIC_CURRENT.toString()) || '',
    OUTPUT_ELECTRIC_CURRENT: (state.utilInfo?.OUTPUT_ELECTRIC_CURRENT && state.utilInfo?.OUTPUT_ELECTRIC_CURRENT.toString()) || '',
    NOMINAL_BATTERY_CAPACITY: (state.utilInfo?.NOMINAL_BATTERY_CAPACITY && state.utilInfo?.NOMINAL_BATTERY_CAPACITY.toString()) || '',
  });
  const { utilId } = match.params;

  async function getDmtPortsInfo(utilInfo) {
    if (utilInfo?.DMT_CODE) {
      const portsInfo = await apiCall('/dmt/get-dmt-ports-info', { DMT_CODE: utilInfo.DMT_CODE, CLIENT_ID: utilInfo.CLIENT_ID, NEW_UTILITY_TYPE: 'Nobreak' });
      state.ports = portsInfo.ports.map((port) => { if (port.nobreakId === utilInfo.NOBREAK_ID) { port.associated = false; } return port; });
    }
  }

  function updateForm(utilInfo) {
    setForm({
      PORT: propOrNullValue(utilInfo.PORT),
      MANUFACTURER: utilInfo?.MANUFACTURER || '',
      MODEL: utilInfo?.MODEL || '',
      NOMINAL_POTENTIAL: propOrNullValue(utilInfo?.NOMINAL_POTENTIAL && utilInfo?.NOMINAL_POTENTIAL.toString()),
      OUTPUT_VOLTAGE: propOrNullValue(utilInfo?.OUTPUT_VOLTAGE && addUnitToString(utilInfo?.OUTPUT_VOLTAGE.toString(), 'VAC')),
      INPUT_VOLTAGE: propOrNullValue(utilInfo?.INPUT_VOLTAGE && addUnitToString(utilInfo?.INPUT_VOLTAGE.toString(), 'VAC')),
      BATTERY_LIFE: propOrNullValue(utilInfo?.NOMINAL_BATTERY_LIFE && utilInfo?.NOMINAL_BATTERY_LIFE.toString()),
      INPUT_ELECTRIC_CURRENT: propOrNullValue(utilInfo?.INPUT_ELECTRIC_CURRENT && utilInfo?.INPUT_ELECTRIC_CURRENT.toString()),
      OUTPUT_ELECTRIC_CURRENT: propOrNullValue(utilInfo?.OUTPUT_ELECTRIC_CURRENT && utilInfo?.OUTPUT_ELECTRIC_CURRENT.toString()),
      NOMINAL_BATTERY_CAPACITY: propOrNullValue(utilInfo?.NOMINAL_BATTERY_CAPACITY && utilInfo?.NOMINAL_BATTERY_CAPACITY.toString()),
    });
  }

  const backToLastRoute = () => {
    // @ts-ignore
    if (history.location.state && history.location.state.from === 'dmtInfo' && state.utilInfo.DMT_CODE) {
      history.push(`/analise/dispositivo/${state.utilInfo.DMT_CODE}/informacoes`);
    } else {
      history.push(`${state.linkBase}/${utilId}/informacoes`);
    }
  };

  async function confirmEditUtil() {
    try {
      setState({ isLoading: true });
      await apiCall('/dmt/set-dmt-nobreak', {
        ID: state.utilInfo.NOBREAK_ID,
        DMT_CODE: state.utilInfo.DMT_CODE,
        UNIT_ID: state.utilInfo.UNIT_ID,
        NAME: state.utilInfo.NAME,
        MANUFACTURER: propOrNullValue(formData.MANUFACTURER),
        MODEL: propOrNullValue(formData.MODEL),
        INPUT_VOLTAGE: propOrNullValue(formData.INPUT_VOLTAGE && getParamNumber(formData.INPUT_VOLTAGE)),
        OUTPUT_VOLTAGE: propOrNullValue(formData.OUTPUT_VOLTAGE && getParamNumber(formData.OUTPUT_VOLTAGE)),
        NOMINAL_POTENTIAL: propOrNullValue(formData.NOMINAL_POTENTIAL && Number(formData.NOMINAL_POTENTIAL)),
        NOMINAL_BATTERY_LIFE: propOrNullValue(formData.BATTERY_LIFE && Number(formData.BATTERY_LIFE)),
        INPUT_ELECTRIC_CURRENT: propOrNullValue(formData.INPUT_ELECTRIC_CURRENT && Number(formData.INPUT_ELECTRIC_CURRENT)),
        OUTPUT_ELECTRIC_CURRENT: propOrNullValue(formData.OUTPUT_ELECTRIC_CURRENT && Number(formData.OUTPUT_ELECTRIC_CURRENT)),
        NOMINAL_BATTERY_CAPACITY: propOrNullValue(formData.NOMINAL_BATTERY_CAPACITY && Number(formData.NOMINAL_BATTERY_CAPACITY)),
        PORT: propOrNullValue(formData.PORT),
      });
      await getUtilityInfo();
      toast.success(t('sucessoSalvar'));
      backToLastRoute();
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  async function getExtraUtilityInfo() {
    if (utilInfo) {
      try {
        setState({ isLoading: true });
        updateForm(utilInfo);
        await getDmtPortsInfo(utilInfo);
      } catch (err) {
        console.log(err);
        toast.error(t('houveErro'));
      }
      setState({ isLoading: false });
    }
  }

  useEffect(() => {
    getExtraUtilityInfo();
  }, []);

  return (
    <Card style={{ borderTop: '10px solid #363BC4' }}>
      <Flex width="100%" flexDirection="column" flex="wrap" padding={20}>
        <Flex style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <Flex flexDirection="column">
            <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: '14px' }}>{`${t('editar')} ${t('utilitario')}`}</span>
            <span style={{ fontSize: '15px', fontWeight: 700 }}>{utilInfo?.NAME}</span>
            <span style={{ fontWeight: 500, fontSize: '11px' }}>
              {(utilInfo?.DMT_CODE)
            && (
              <StyledLink to={`/analise/dispositivo/${utilInfo?.DMT_CODE}/informacoes`}>
                {utilInfo?.DMT_CODE || '-'}
              </StyledLink>
            )}
              { !utilInfo?.DMT_CODE
            && (
              <>
                -
              </>
            )}
            </span>
          </Flex>
        </Flex>

        {!state.isLoading
        && (
        <>
          <Flex flexDirection="column" mt={40}>
            <Title>{t('informacoes')}</Title>
            <Flex flexDirection="column" marginTop="5px">
              <div style={{ width: '25%', minWidth: '200px' }}>
                <Input
                  type="text"
                  value={formData.MANUFACTURER}
                  label={t('fabricante')}
                  placeholder={t('digitar')}
                  onChange={(event) => { formData.MANUFACTURER = event.target.value; render(); }}
                />
              </div>
              <div style={{ width: '25%', minWidth: '200px', marginTop: '20px' }}>
                <Input
                  type="text"
                  value={formData.MODEL}
                  label={t('modelo')}
                  placeholder={t('digitar')}
                  onChange={(event) => { formData.MODEL = event.target.value; render(); }}
                />
              </div>
              <div style={{ width: '25%', minWidth: '200px', marginTop: '20px' }}>
                <Input
                  type="number"
                  value={formData.NOMINAL_POTENTIAL}
                  label={t('potenciaNominal')}
                  placeholder={t('digitar')}
                  onChange={(event) => { formData.NOMINAL_POTENTIAL = event.target.value; render(); }}
                  suffix="VA"
                />
              </div>
              <div style={{ minWidth: '200px', width: '25%', marginTop: '20px' }}>
                <CustomInput style={{ width: '100%' }}>
                  <div style={{ paddingTop: 3, width: '100%' }}>
                    <Label>{t('tensaoDeSaida')}</Label>
                    <SelectSearch
                      onChange={(item) => { formData.OUTPUT_VOLTAGE = item; render(); }}
                      closeOnSelect={false}
                      value={formData.OUTPUT_VOLTAGE}
                      placeholder={t('selecioneTensao')}
                      options={['127 VAC', '220 VAC'].map((e) => ({ name: e, value: e }))}
                    />
                  </div>
                </CustomInput>
              </div>
              <div style={{ minWidth: '200px', width: '25%', marginTop: '20px' }}>
                <CustomInput style={{ width: '100%' }}>
                  <div style={{ paddingTop: 3, width: '100%' }}>
                    <Label>{t('tensaoDeEntrada')}</Label>
                    <SelectSearch
                      onChange={(item) => { formData.INPUT_VOLTAGE = item; render(); }}
                      closeOnSelect={false}
                      value={formData.INPUT_VOLTAGE}
                      placeholder={t('selecioneTensao')}
                      options={['127 VAC', '220 VAC', '380 VAC'].map((e) => ({ name: e, value: e }))}
                    />
                  </div>
                </CustomInput>
              </div>
              <div style={{ width: '25%', minWidth: '200px', marginTop: '20px' }}>
                <Input
                  type="number"
                  onChange={(event) => { formData.INPUT_ELECTRIC_CURRENT = event.target.value; render(); }}
                  value={formData.INPUT_ELECTRIC_CURRENT}
                  placeholder={t('digite')}
                  label={t('correnteEletricaDeEntrada')}
                  suffix="A"
                  noSuffixBorder
                />
              </div>
              <div style={{ width: '25%', minWidth: '200px', marginTop: '20px' }}>
                <Input
                  label={t('correnteEletricaDeEntrada')}
                  type="number"
                  value={formData.OUTPUT_ELECTRIC_CURRENT}
                  onChange={(event) => { formData.OUTPUT_ELECTRIC_CURRENT = event.target.value; render(); }}
                  placeholder={t('digite')}
                  suffix="A"
                  noSuffixBorder
                />
              </div>
              <div style={{ width: '25%', minWidth: '200px', marginTop: '20px' }}>
                <Input
                  label={t('capacidadeNominalDaBateria')}
                  onChange={(event) => { formData.NOMINAL_BATTERY_CAPACITY = event.target.value; render(); }}
                  type="number"
                  value={formData.NOMINAL_BATTERY_CAPACITY}
                  placeholder={t('digite')}
                  suffix="Ah"
                  noSuffixBorder
                />
              </div>
              <div style={{ width: '25%', minWidth: '200px', marginTop: '20px' }}>
                <Input
                  type="number"
                  value={formData.BATTERY_LIFE}
                  placeholder={t('digite')}
                  label={t('autonomiaNominalDaBateriaInterna')}
                  onChange={(event) => { formData.BATTERY_LIFE = event.target.value; render(); }}
                  suffix="min"
                  noSuffixBorder
                />
              </div>
              <span
                style={{
                  width: '30%', fontSize: 11, color: colors.Grey300, marginTop: 10,
                }}
              >
                {t('textoSobreAutonomia')}
              </span>
            </Flex>

            {utilInfo.DMT_CODE && (
              <>
                <Title style={{ marginTop: '30px' }}>{t('associacao')}</Title>
                <Flex flexWrap="wrap" justifyContent="space-between">
                  <div style={{ minWidth: '150px', width: '25%' }}>
                    <SelectDMTport
                      label={t('feedbackDoDmt')}
                      placeholder={t('selecionar')}
                      options={state.ports}
                      propLabel="label"
                      value={formData.PORT}
                      hideSelected
                      onSelect={(item) => {
                        formData.PORT = item.port;
                        render();
                      }}
                    />
                  </div>
                </Flex>
                <BtnClean onClick={() => { formData.PORT = null; render(); }}>{t('limparPorta')}</BtnClean>
              </>
            )}
          </Flex>

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
        </>
        )}
      </Flex>
    </Card>
  );
};

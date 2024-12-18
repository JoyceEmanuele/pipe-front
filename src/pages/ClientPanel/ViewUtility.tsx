import {
  ModalTitle3, IconWrapperView, CloseBtn,
} from './styles';
import {
  Button,
} from 'components';
import { Flex } from 'reflexbox';
import { UtilityIcon } from '~/icons/Utility';
import {
  BoxIcon, MonitoringIcon, PortIcon,
} from '~/icons';
import { colors } from '~/styles/colors';
import i18n from '../../i18n/index';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { apiCall } from '~/providers';
import { verifyInfoAdditionalParameters } from '~/helpers/additionalParameters';

const sliceStr = (str, len) => (str.length > len ? `${str.substring(0, len)}...` : str);
const addUnit = (str, unit) => (str ? `${str} ${unit}` : '-');

const formatUtilityInfo = (utilityInfo) => {
  const feedBack = utilityInfo?.FEEDBACK ? `F${utilityInfo?.FEEDBACK}` : utilityInfo?.FEEDBACK;
  const language = i18n.language === 'pt' ? 'pt-BR' : 'en';
  return {
    nobreakId: utilityInfo?.ID,
    name: utilityInfo?.NAME,
    devicePort: utilityInfo?.DMT_CODE ? feedBack : utilityInfo?.PORT,
    installationData: utilityInfo?.INSTALLATION_DATE ? new Date(utilityInfo.INSTALLATION_DATE).toLocaleDateString(language) : '-',
    unitName: utilityInfo?.UNIT_NAME ? sliceStr(utilityInfo.UNIT_NAME, 40) : '-',
    manufacturer: utilityInfo?.MANUFACTURER ? sliceStr(utilityInfo.MANUFACTURER, 25) : '-',
    model: utilityInfo?.MODEL ? sliceStr(utilityInfo.MODEL, 25) : '-',
    application: utilityInfo?.APPLICATION,
    inputVoltage: addUnit(utilityInfo?.INPUT_VOLTAGE, 'VAC'),
    outputVoltage: addUnit(utilityInfo?.OUTPUT_VOLTAGE, 'VAC'),
    gridCurrent: utilityInfo?.GRID_CURRENT ? (
      <span>
        <span style={{ fontWeight: 'bold' }}>{utilityInfo.GRID_CURRENT}</span>
        &nbsp;A
      </span>
    ) : '-',
    gridVoltage: utilityInfo?.GRID_VOLTAGE ? (
      <span>
        <span style={{ fontWeight: 'bold' }}>{utilityInfo.GRID_VOLTAGE}</span>
        &nbsp;VAC
      </span>
    ) : '-',
    deviceCode: (utilityInfo?.DMT_CODE || utilityInfo?.DAL_CODE || utilityInfo?.DAM_ILLUMINATION_CODE),
    nominalPotential: addUnit(utilityInfo?.NOMINAL_POTENTIAL, 'VA'),
    nominalBatteryLife: addUnit(utilityInfo?.NOMINAL_BATTERY_LIFE, 'min'),
    inputElectricCurrent: addUnit(utilityInfo?.INPUT_ELECTRIC_CURRENT, 'A'),
    outputElectricCurrent: addUnit(utilityInfo?.OUTPUT_ELECTRIC_CURRENT, 'A'),
    nominalBatteryCapacity: addUnit(utilityInfo?.NOMINAL_BATTERY_CAPACITY, 'Ah'),
    dmtCode: utilityInfo?.DMT_CODE,
    nobreakPort: utilityInfo?.PORT,
    datCode: utilityInfo?.DAT_CODE,
  };
};

export const ViewUtility = ({
  onClickEdit, onCancel, utilityInfo, utilityType,
}): JSX.Element => {
  const [additionalParameters, setAdditionalParameters] = useState<{ COLUMN_NAME: string; COLUMN_VALUE: string; }[]>([]);
  const utilityValues = formatUtilityInfo(utilityInfo);

  async function getNobreakAdditionalParameters(NOBREAK_ID) {
    try {
      const parameters = await apiCall('/dmt/get-nobreak-additional-parameters', { NOBREAK_ID });
      setAdditionalParameters(parameters);
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }

  useEffect(() => {
    utilityType === 'Nobreak' && getNobreakAdditionalParameters(utilityValues.nobreakId);
  }, []);

  return (
    <div style={{ margin: '25px' }}>
      <Flex width="100%" flexDirection="column">
        <ModalTitle3>{t('visualizarUtilitario')}</ModalTitle3>
        <div style={{ paddingTop: '20px' }} />
        <Flex marginLeft="50px" flexDirection="row" alignItems="center">
          <IconWrapperView style={{ marginBottom: 6 }}>
            <UtilityIcon />
          </IconWrapperView>
          <ModalTitle3>{utilityValues.name || '-'}</ModalTitle3>
        </Flex>
        <div style={{ paddingTop: '10px' }} />

        <Flex fontSize="12px" maxWidth="650px" marginLeft="82px" flexDirection="column">
          <Flex flexDirection="row" flexWrap="wrap">
            <Flex flexDirection="column" marginRight="30px">
              <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('unidade')}</span>
              {utilityValues.unitName}
            </Flex>
            <Flex flexDirection="column" marginRight="30px">
              <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('aplicacao')}</span>
              {utilityValues.application || '-'}
            </Flex>
            {utilityType === t('nobreak') && (
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('dataInstalacao')}</span>
                {utilityValues.installationData}
              </Flex>
            )}
          </Flex>
          <div style={{ paddingTop: '20px' }} />

          {utilityType === t('nobreak') && (
            <Flex flexDirection="row" flexWrap="wrap">
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('fabricante')}</span>
                {utilityValues.manufacturer}
              </Flex>
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('modelo')}</span>
                {utilityValues.model}
              </Flex>
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('tensaoDeEntrada')}</span>
                {utilityValues.inputVoltage}
              </Flex>
              <Flex flexDirection="column" marginRight="00px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('tensaoDeSaida')}</span>
                {utilityValues.outputVoltage}
              </Flex>
            </Flex>
          )}
          {utilityType === t('iluminacao') && (
            <Flex flexDirection="row" flexWrap="wrap">
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('tensaoDaRede')}</span>
                {utilityValues.gridVoltage}
              </Flex>
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('correnteDaRede')}</span>
                {utilityValues.gridCurrent}
              </Flex>
            </Flex>
          )}
          <div style={{ paddingTop: '20px' }} />

          {utilityType === t('nobreak') && (
            <Flex flexDirection="row" flexWrap="wrap">
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('potenciaNominal')}</span>
                {utilityValues.nominalPotential}
              </Flex>
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('autonomiaNominalDaBateriaInterna')}</span>
                {utilityValues.nominalBatteryLife}
              </Flex>
            </Flex>
          )}

          {utilityType === t('nobreak') && (
            <Flex flexDirection="row" flexWrap="wrap">
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('correnteEletricaDeEntrada')}</span>
                {utilityValues.inputElectricCurrent}
              </Flex>
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('correnteEletricaDeSaida')}</span>
                {utilityValues.outputElectricCurrent}
              </Flex>
            </Flex>
          )}
          {utilityType === t('nobreak') && (
            <Flex flexDirection="row" flexWrap="wrap">
              <Flex flexDirection="column" marginRight="30px">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('capacidadeNominalDaBateria')}</span>
                {utilityValues.nominalBatteryCapacity}
              </Flex>
            </Flex>
          )}

        </Flex>
        <div style={{ paddingTop: '20px' }} />

        {utilityType === t('nobreak') && (
          <>
            <Flex marginLeft="50px" fontSize="12px" flexDirection="row">
              <Flex alignItems="flex-start" flexDirection="row" marginRight="30px">
                <IconWrapperView>
                  <MonitoringIcon />
                </IconWrapperView>
                <Flex flexDirection="column">
                  <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('monitoramento')}</span>
                  {utilityValues.dmtCode || '-'}
                </Flex>
              </Flex>
              <Flex alignItems="flex-start" flexDirection="row" marginRight="30px">
                <IconWrapperView>
                  <PortIcon />
                </IconWrapperView>
                <Flex flexDirection="column">
                  <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('portaDoDmt')}</span>
                  {utilityValues.nobreakPort || '-'}
                </Flex>
              </Flex>
              <Flex alignItems="flex-start" flexDirection="row" marginRight="30px">
                <IconWrapperView>
                  <BoxIcon />
                </IconWrapperView>
                <Flex flexDirection="column">
                  <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>DAT ID</span>
                  {utilityValues.datCode || '-'}
                </Flex>
              </Flex>
            </Flex>
            <Flex flexDirection="row" flexWrap="wrap" justifyContent="space-between" width="100%" alignItems="space-between">
              <Flex flexDirection="column">
                {additionalParameters.length > 0 && verifyInfoAdditionalParameters(additionalParameters, true)}
              </Flex>
            </Flex>
          </>
        )}

        {utilityType === t('iluminacao') && (
          <Flex marginLeft="50px" fontSize="12px" flexDirection="row">
            <Flex alignItems="flex-start" flexDirection="row" marginRight="30px">
              <IconWrapperView>
                <MonitoringIcon />
              </IconWrapperView>
              <Flex flexDirection="column">
                <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{t('dispositivo')}</span>
                {utilityValues.deviceCode || '-'}
              </Flex>
            </Flex>
            {
              utilityValues.deviceCode && !utilityValues.deviceCode.startsWith('DAM') && (
                <Flex alignItems="flex-start" flexDirection="row" marginRight="30px">
                  <IconWrapperView>
                    <PortIcon />
                  </IconWrapperView>
                  <Flex flexDirection="column">
                    <span style={{ fontWeight: 'bold', color: colors.Grey200 }}>{utilityInfo?.DMT_CODE ? t('feedbackDoDmt') : t('portaDoDal')}</span>
                    { utilityValues.devicePort || '-'}
                  </Flex>
                </Flex>
              )
            }
          </Flex>
        )}
      </Flex>

      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: '20px',
      }}
      >
        <CloseBtn onClick={onCancel}>{t('botaoFechar')}</CloseBtn>
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <Button style={{ width: '30%' }} onClick={() => onClickEdit(utilityInfo)} variant="primary">
          {t('botaoEditar')}
        </Button>
      </div>
    </div>
  );
};

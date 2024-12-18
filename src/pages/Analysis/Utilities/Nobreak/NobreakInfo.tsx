import { useContext, useState, useEffect } from 'react';
import { Flex } from 'reflexbox';
import { useHistory } from 'react-router';
import { AssetStatus } from '~/components/AssetStatus';
import {
  Button,
} from '~/components';
import {
  Title, InfoItemShort, StyledLink,
} from './styles';
import {
  BatteryIcon, EletricNetworkIcon, InfoIcon, NobreakOffIcon,
} from 'icons';
import { useTranslation } from 'react-i18next';
import { getUserProfile } from 'helpers/userProfile';
import { colors } from '~/styles/colors';
import { RenderImagesDmtNobreak } from '../../DMTs/DmtInfo';
import ReactTooltip from 'react-tooltip';
import MenuContext from '~/contexts/menuContext';
import { apiCall } from '~/providers';
import { toast } from 'react-toastify';
import { verifyInfoAdditionalParameters } from '~/helpers/additionalParameters';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

export const NobreakInfo = ({ util, screen }): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const [profile] = useState(getUserProfile);
  const [additionalParameters, setAdditionalParameters] = useState<{ COLUMN_NAME: string; COLUMN_VALUE: string; }[]>([]);
  const nobreakStatus = {
    'Rede Elétrica': {
      icon: <EletricNetworkIcon />,
      label: t('redeEletrica'),
    },
    Bateria: {
      icon: <BatteryIcon width="30" height="18" />,
      label: t('bateria'),
    },
    Desligado: {
      icon: <NobreakOffIcon color="#CFCFCF" />,
      label: t('desligadoMin'),
    },
    Indisponível: {
      icon: <InfoIcon />,
      label: t('semInformacao'),
    },
  };
  const { menuToogle } = useContext(MenuContext);// true = open, false = not Open
  const sizeColumn = menuToogle ? '160px' : '240px';
  const columnItemWidth = screen === 'utilityInfo' ? 'auto' : sizeColumn;
  const deviceLabel = `${util.DMT_CODE || '-'} / ${util.DAT_CODE || '-'}`;
  const noOpStatus = !util.STATUS || util.STATUS === 'Indisponível';

  async function getNobreakAdditionalParameters() {
    try {
      setAdditionalParameters([]);
      const parameters = await apiCall('/dmt/get-nobreak-additional-parameters', { NOBREAK_ID: screen === 'dmtInfo' ? Number(util.NOBREAK_ID) : Number(util.ID) });
      setAdditionalParameters(parameters);
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }

  useEffect(() => {
    getNobreakAdditionalParameters();
  }, [util]);

  return (
    <Flex flexDirection="row" width="100%" marginTop="10px" flexWrap="wrap" justifyContent="space-between" fontSize="13px" padding="20px">
      <Flex width="100%" flexDirection="column" flex="wrap">
        <Flex style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <Flex flexDirection="column">
            <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: '14px' }}>{t('utilitario')}</span>
            <span style={{ fontSize: '15px', fontWeight: 700 }}>{util.NAME}</span>
            <span style={{ fontSize: '10.7px', fontWeight: 500, color: colors.Grey300 }}>
              {util.DMT_CODE
              && (
                <StyledLink to={`/analise/dispositivo/${util.DMT_CODE}/informacoes`}>
                  {deviceLabel}
                </StyledLink>
              )}
              {!util.DMT_CODE
              && (
                <>
                  {deviceLabel}
                </>
              )}
            </span>
          </Flex>
          {util.DMT_CODE && (
            <AssetStatus
              key={util.DMT_CODE}
              DUT_ID={null}
              DEV_AUT={util.DMT_CODE}
              DEV_ID={util.DMT_CODE}
              isAutomation
              withoutMarginTop
            />
          )}
        </Flex>

        <div style={{ border: '1px solid #DEDEDE', marginTop: '20px' }} />

        <Flex justifyContent="space-between" flexWrap="wrap" width="100%">
          <Flex flexDirection="row" width="50%" flexWrap="wrap" mb="20px" mt="20px">
            <Flex flexWrap="wrap" width="100%" flexDirection="column">
              <Flex flexDirection="row" flexWrap="wrap" justifyContent="space-between" width="100%" alignItems="flex-start">
                <Flex flexDirection="column">
                  <Title>{t('informacoes')}</Title>
                  <InfoItemShort style={{ width: columnItemWidth }}>
                    <b>{t('fabricante')}</b>
                    <br />
                    {util.MANUFACTURER || '-'}
                  </InfoItemShort>

                  <InfoItemShort style={{ width: columnItemWidth }}>
                    <b>{t('modelo')}</b>
                    <br />
                    {util.MODEL || '-'}
                  </InfoItemShort>
                  <InfoItemShort style={{ width: columnItemWidth }}>
                    <b>{t('potenciaNominal')}</b>
                    <br />
                    {util.NOMINAL_POTENTIAL ? `${formatNumberWithFractionDigits(util.NOMINAL_POTENTIAL)} VA` : '-'}
                  </InfoItemShort>
                  <InfoItemShort style={{ width: columnItemWidth }}>
                    <b>{t('autonomiaNominalDaBateriaInterna')}</b>
                    <br />
                    {util.NOMINAL_BATTERY_LIFE ? `${formatNumberWithFractionDigits(util.NOMINAL_BATTERY_LIFE)} min` : '-'}
                  </InfoItemShort>
                  <InfoItemShort style={{ width: columnItemWidth }}>
                    <b>{t('capacidadeNominalDaBateria')}</b>
                    <br />
                    {util.NOMINAL_BATTERY_CAPACITY ? `${formatNumberWithFractionDigits(util.NOMINAL_BATTERY_CAPACITY)} Ah` : '-'}
                  </InfoItemShort>
                  <InfoItemShort style={{ width: columnItemWidth }}>
                    <b>{t('tensaoDeSaida')}</b>
                    <br />
                    {util.OUTPUT_VOLTAGE ? `${formatNumberWithFractionDigits(util.OUTPUT_VOLTAGE)} VAC` : '-'}
                  </InfoItemShort>
                  <InfoItemShort style={{ width: columnItemWidth }}>
                    <b>{t('tensaoDeEntrada')}</b>
                    <br />
                    {util.INPUT_VOLTAGE ? `${formatNumberWithFractionDigits(util.INPUT_VOLTAGE)} VAC` : '-'}
                  </InfoItemShort>
                </Flex>
                <Flex flexDirection="column">
                  <Title>{t('tempoReal')}</Title>
                  <InfoItemShort>
                    <b>{t('statusDeOperacao')}</b>
                    <br />

                    {noOpStatus
                    && (
                      <Flex data-tip data-for="noInfo" flexDirection="row" alignItems="center" justifyContent="flex-start">
                        <InfoIcon />
                        <span style={{ marginLeft: 6 }}>{t('semInformacao')}</span>
                      </Flex>
                    )}

                    {!noOpStatus
                    && (
                    <Flex
                      justifyContent="center"
                      style={{
                        border: '1px solid #EDEDED', borderRadius: '10px', width: '130px', height: '60px', marginTop: '10px', padding: 20,
                      }}
                      alignItems="center"
                    >
                      {(nobreakStatus[util.STATUS]?.icon)}
                      <span style={{ width: '70px', marginLeft: '10px', fontSize: 13 }}>{(nobreakStatus[util.STATUS]?.label)}</span>
                    </Flex>
                    )}
                  </InfoItemShort>

                  {noOpStatus
                  && (
                  <ReactTooltip
                    id="noInfo"
                    place="top"
                    border
                    textColor="#000000"
                    backgroundColor="rgba(255, 255, 255, 0.97)"
                    borderColor="#202370"
                  >
                    <div style={{ width: '200px' }}>
                      <span>{t('semInfoNobreakDmt')}</span>
                    </div>
                  </ReactTooltip>
                  )}
                  <InfoItemShort>
                    <b>{t('duracaoMedia')}</b>
                    <br />
                    <Flex flexDirection="row" alignItems="center" justifyContent="flex-start">
                      <InfoIcon />
                      <span style={{ marginLeft: 6 }}>{t('semInformacao')}</span>
                    </Flex>
                  </InfoItemShort>
                  <InfoItemShort>
                    <b>{t('autonomia')}</b>
                    <br />
                    <Flex flexDirection="row" alignItems="center" justifyContent="flex-start">
                      <InfoIcon />
                      <span style={{ marginLeft: 6 }}>{t('semInformacao')}</span>
                    </Flex>
                  </InfoItemShort>
                  <Title style={{ marginTop: 53 }}>{t('associacao')}</Title>
                  <InfoItemShort>
                    <b>{t('feedbackDoDmt')}</b>
                    <br />
                    {util.PORT ? `F${util.PORT}` : '-'}
                  </InfoItemShort>
                </Flex>
              </Flex>
              <Flex flexDirection="row" flexWrap="wrap" justifyContent="flex-start" width="100%" alignItems="flex-start">
                <Flex flexDirection="column">
                  {additionalParameters.length > 0 && verifyInfoAdditionalParameters(additionalParameters)}
                </Flex>
              </Flex>
              {profile.manageAllClients && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Button
                    style={{
                      maxWidth: '100px', marginTop: '15px',
                    }}
                    onClick={() => history.push(`/analise/utilitario/nobreak/${util.NOBREAK_ID}/editar`, { from: screen })}
                    variant="primary"
                  >
                    {`${t('editar')}`}
                  </Button>
                </div>
              )}
            </Flex>
          </Flex>
          <RenderImagesDmtNobreak util={util} nobreakId={util.NOBREAK_ID} utilSelected devCode={util.DMT_CODE} deviceId={util.DMT_ID} />
        </Flex>
      </Flex>
    </Flex>
  );
};

import { useHistory } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { Flex } from 'reflexbox';
import { IconBiggerWrapper } from '~/components/AssetTree/styles';
import { getCardColor, getColorCo2, getColorHumi } from '../..';
import { formatRssiIcon, rssiDesc } from '../../..';
import { t } from 'i18next';
import {
  InformationContainer, InformationLabel, LateralBar, ListItemContainer, ListItemDataContainer, SuperiorBar, Title, InformationValue, InformationUnit, TooltipContainer, TransparentLink, ListItemDutQA, ItemAreaColorHealth,
} from './styles';
import { formatNumberWithFractionDigits, thousandPointFormat } from '~/helpers/thousandFormatNumber';

export const MosaicListItem = ({
  dut,
}: { dut: any }): React.ReactElement => {
  function dutQA(dut) {
    return (
      <ListItemDutQA>
        <div>
          {infoItemQA(10, t('umidade'), dut.Humidity, getColorHumi(dut.Humidity, dut.HUMIMAX, dut.HUMIMIN), '%', 15)}
        </div>
        <div>
          {infoItemQA(10, 'CO₂', dut.eCO2, getColorCo2(dut.eCO2, dut.CO2MAX), 'ppm', 15)}
        </div>
        <div
          style={{
            gridColumnStart: 1,
            gridColumnEnd: 4,
            gridRowStart: 2,
            gridRowEnd: 2,
          }}
        >
          {infoItemQA(14, t('temperatura'), dut.Temperature, getCardColor(dut.Temperature && dut.Temperature !== '-' && dut.status === 'ONLINE' ? dut.Temperature : null, dut.temprtAlert, dut.tpstats?.min, dut.tpstats?.max), 'ºC', 22)}
        </div>
      </ListItemDutQA>
    );
  }

  function infoItemQA(fontSizeWord, title, value, healthColor, unitMed, fontSizeValue) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}>
        <ItemAreaColorHealth color={healthColor} />
        <div
          style={{
            marginLeft: 4, fontSize: fontSizeWord, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}
        >
          <InformationLabel style={{ fontSize: fontSizeWord, padding: 0 }}>{title}</InformationLabel>
          <InformationValue style={{ fontSize: fontSizeValue }}>{thousandPointFormat(value)}</InformationValue>
          <InformationUnit>{unitMed}</InformationUnit>
        </div>
      </div>
    );
  }

  function cardDut(dut) {
    const isDutQa = (dut.eCO2 && dut.Humidity && dut.Temperature);
    return (
      <ListItemContainer>
        <ListItemDataContainer>
          <Title title={dut.ROOM_NAME}>
            { dut.ROOM_NAME.length < 30 ? dut.ROOM_NAME : `${dut.ROOM_NAME.substring(0, 30)}...` }
          </Title>
          <InformationContainer>
            {
              isDutQa ? (
                <>
                  {dutQA(dut)}
                </>
              ) : (
                (
                  <>
                    <InformationLabel>{t('temperatura')}</InformationLabel>
                    <InformationValue>{dut.Temperature && dut.Temperature !== '-' && dut.status === 'ONLINE' ? formatNumberWithFractionDigits(Number(dut.Temperature).toFixed(1)) : '--'}</InformationValue>
                    <InformationUnit>°C</InformationUnit>
                  </>
                )
              )
            }
          </InformationContainer>
        </ListItemDataContainer>
        <Flex flexDirection="column" alignItems="center" justifyContent="space-between" paddingRight={10}>
          <IconBiggerWrapper style={{ marginTop: '5px' }}>
            {formatRssiIcon(rssiDesc(dut.RSSI, dut.status))}
          </IconBiggerWrapper>
          { !isDutQa && <LateralBar color={getCardColor(dut.Temperature && dut.Temperature !== '-' && dut.status === 'ONLINE' ? dut.Temperature : null, dut.temprtAlert, dut.TUSEMIN, dut.TUSEMAX)} /> }
        </Flex>
      </ListItemContainer>
    );
  }

  return (
    <>
      <div data-tip data-for={`ENVIRONMENT_${dut.ENVIRONMENT_ID}`} style={{ width: '198px', height: '180px', minWidth: '200px' }}>
        <SuperiorBar />
        {dut.DEV_ID && dut.DEV_ID !== '-' ? (
          <TransparentLink to={`/analise/dispositivo/${dut.DEV_ID}/informacoes`}>
            {cardDut(dut)}
          </TransparentLink>
        ) : (
          <>
            {cardDut(dut)}
          </>
        )}
      </div>
      <ReactTooltip
        id={`ENVIRONMENT_${dut.ENVIRONMENT_ID}`}
        place="right"
        border
        textColor="#000000"
        backgroundColor="rgba(255, 255, 255, 0.97)"
        borderColor="#202370"
      >
        <TooltipContainer>
          <strong style={{ marginBottom: '4px' }}>{dut.ROOM_NAME}</strong>
          <strong>{t('limiteDeTemperatura')}</strong>
          <span>{`${dut?.TUSEMIN ? formatNumberWithFractionDigits(dut.TUSEMIN) : '-'}°C - ${dut?.TUSEMAX ? formatNumberWithFractionDigits(dut.TUSEMAX) : '-'}°C`}</span>
          <div>
            <div>
              <strong>{t('media')}</strong>
              <span>
                {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.med)) || '-'}
                °C
              </span>
            </div>
            <div>
              <strong>{t('max')}</strong>
              <span>
                {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.max)) || '-'}
                °C
              </span>
            </div>
            <div>
              <strong>Min:</strong>
              <span>
                {(dut.tpstats && formatNumberWithFractionDigits(dut.tpstats.min)) || '-'}
                °C
              </span>
            </div>
          </div>
          {dut.PLACEMENT === 'DUO' && (
            <>
              <strong>{t('temperaturaDeRetorno')}</strong>
              <span>{`${(dut.status === 'ONLINE' && formatNumberWithFractionDigits(dut.Temperature)) || '-'}°C`}</span>
              <strong>{t('temperaturaDeInsuflamento')}</strong>
              <span>{`${(dut.status === 'ONLINE' && formatNumberWithFractionDigits(dut.Temperature_1)) || '-'}°C`}</span>
            </>
          )}
          <strong>{t('periodoAnalisado')}</strong>
          <span>-</span>
        </TooltipContainer>
      </ReactTooltip>
    </>
  );
};

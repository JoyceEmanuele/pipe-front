import { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { getUserProfile } from '~/helpers/userProfile';
import { apiCall, ApiResps } from '~/providers';
import {
  DacItem, DatItem, formatRssiIcon, rssiDesc,
} from '../../../../..';
import { TooltipContainer } from '../../../../styles';
import {
  Title,
  Subtitle,
  StatusContainer,
  TransparentLink,
  RealTimeContainer,
  Dot,
} from './styles';
import { Flex } from 'reflexbox';
import { CheckboxIcon, CloseIcon } from '~/icons';
import { useWebSocketLazy } from '~/helpers/wsConnection';
import { useStateVar } from '~/helpers/useStateVar';
import moment from 'moment';
import { DataContainer, IconWiFiRealTime } from '../../styles';

type Props = {
  dac?: DacItem;
  dat?: DatItem;
  expanded?: boolean;
};

const diagnosisColor = { unavailable: '#B8B8B8', 'working-correctly': '#5AB365', malfunctioning: '#DC0E01' };
const diagnosisText = { unavailable: 'Nenhuma informação sobre o funcionamento.', 'working-correctly': 'Funcionando corretamente.', malfunctioning: 'Funcionando incorretamente.' };
const diagnosisIcon = { unavailable: null, 'working-correctly': <CheckboxIcon size={12} color="white" />, malfunctioning: <CloseIcon size="8" color="white" /> };

export const HeatExchangerInfo = ({
  dac,
  dat,
  expanded = false,
}: Props): React.ReactElement => {
  const [profile] = useState(getUserProfile);
  const [state, render] = useStateVar({
    heatInfo: null as any | ApiResps['/heat-exchanger/get-info-v2'],
    lastData: {} as any,
    diagnosis: 'unavailable', // unavailable working-correctly malfunctioning
  });

  const lws = useWebSocketLazy();

  function onWsOpen(wsConn) {
    wsConn.send(JSON.stringify({ type: 'subscribeTelemetry', data: { unit_id: dac?.UNIT_ID } }));
  }
  function onWsMessage(payload) {
    if (payload && payload.type === 'dacTelemetry' && payload.data.dac_id === dac?.DAC_ID) {
      state.lastData = payload.data;
      if (dac && dac.DAC_APPL === 'trocador-de-calor' && state.lastData && state.lastData.Tliq && state.lastData.Tsuc) {
        state.lastData.deltaT = Number((state.lastData.Tliq - state.lastData.Tsuc).toFixed(2));
        if (state.heatInfo && state.heatInfo.DELTA_T_MAX && state.heatInfo.DELTA_T_MIN) {
          if (state.lastData.deltaT > state.heatInfo.DELTA_T_MAX || state.lastData.deltaT < state.heatInfo.DELTA_T_MIN) {
            state.diagnosis = 'malfunctioning';
          } else {
            state.diagnosis = 'working-correctly';
          }
        } else {
          state.diagnosis = 'unavailable';
        }
      } else {
        state.diagnosis = 'unavailable';
      }
      render();
      ReactTooltip.rebuild();
      // @ts-ignore
      clearTimeout(state.onTelmTimer);
      // @ts-ignore
      state.hasNewTelm = true;
      // @ts-ignore
      state.onTelmTimer = setTimeout(() => state.hasNewTelm && render(), 100);
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send(JSON.stringify({ type: 'subscribeTelemetry', data: {} }));
  }

  const fetchData = async () => {
    if (dac && dac.CLIENT_ID && dac.HEAT_EXCHANGER_ID) {
      const info = await apiCall('/heat-exchanger/get-info-v2', { CLIENT_ID: dac.CLIENT_ID, HEAT_EXCHANGER_ID: dac.HEAT_EXCHANGER_ID });
      state.heatInfo = info;
    }
  };
  useEffect(() => {
    lws.start(onWsOpen, onWsMessage, beforeWsClose);

    fetchData();
  }, []);
  return (
    <>
      {dac && (
      <DataContainer expanded={expanded}>
        <TransparentLink to={`/analise/dispositivo/${dac.DAC_ID}/informacoes`}>
          <Flex alignItems="center" style={{ gap: '8px' }}>
            { dac.DAC_NAME && dac.DAC_NAME != null && (
            <Title data-tip data-for={dac.DAC_ID}>
              { dac.DAC_NAME.length < 25
                ? dac.DAC_NAME
                : `${dac.DAC_NAME.substring(0, 20)}...`}
            </Title>
            )}
            { !dac.DAC_NAME && (
            <Title data-tip data-for={dac.DAC_ID}>
              TAG NÃO DEFINIDA
            </Title>
            )}
            <Dot style={{ backgroundColor: diagnosisColor[state.diagnosis] }}>
              {diagnosisIcon[state.diagnosis]}
            </Dot>
          </Flex>
          {profile.manageAllClients && (
            <>
              <Subtitle>{dac.DAC_ID}</Subtitle>
            </>
          )}
        </TransparentLink>

        <RealTimeContainer style={{ marginTop: 11 }}>
          <strong>Retorno de Água: </strong>
          <span>
            { state.lastData.Tliq || '-'}
            <span>&nbsp;ºC</span>
          </span>
        </RealTimeContainer>
        <RealTimeContainer style={{ marginBottom: 24 }}>
          <strong>Saída de Água: </strong>
          <span>
            { state.lastData.Tsuc || '-'}
            <span>&nbsp;ºC</span>
          </span>
        </RealTimeContainer>
        <StatusContainer>
          <IconWiFiRealTime>
            {formatRssiIcon(rssiDesc(dac.RSSI, dac.status))}
          </IconWiFiRealTime>
        </StatusContainer>
      </DataContainer>
      )}
      <ReactTooltip
        id={dac ? dac.DAC_ID : undefined}
        place="top"
        border
        textColor="black"
        backgroundColor="white"
        borderColor="#202370"
      >
        <TooltipContainer color="black">
          <span style={{ color: 'black', display: 'inline-block' }}>
            Limites de Temperatura de
            {' '}
            <strong>Saída</strong>
            :
          </span>
          <span style={{ color: 'black', display: 'inline-block', marginBottom: 8 }}>
            Min.
            &nbsp;
            <strong>{state.heatInfo?.T_MIN}</strong>
            &nbsp;ºC
            &nbsp;&nbsp;
            Max.
            &nbsp;
            <strong>{state.heatInfo?.T_MAX}</strong>
            &nbsp;ºC
          </span>
          <span style={{ color: 'black', display: 'inline-block' }}>
            Diferença sobre
            {' '}
            <strong>Saída</strong>
            :
          </span>
          <span style={{ color: 'black', display: 'inline-block' }}>
            ΔT =
            &nbsp;
            <strong>{state.lastData.deltaT}</strong>
            &nbsp;ºC
          </span>
          <hr width="100%" color="black" style={{ border: '1px solid black' }} />
          <Flex alignItems="center" style={{ gap: '10px', color: 'black' }}>
            <strong style={{ fontSize: '10px' }}>Laudo Técnico&nbsp;</strong>
            <Dot style={{ backgroundColor: diagnosisColor[state.diagnosis] }}>
              {diagnosisIcon[state.diagnosis]}
            </Dot>
          </Flex>
          <span style={{ color: 'black', display: 'inline-block', marginBottom: 8 }}>
            {diagnosisText[state.diagnosis]}
          </span>
          <span style={{ color: 'black', display: 'inline-block' }}>
            <strong style={{ display: 'block' }}>
              Último laudo:
              {' '}
            </strong>
            {state.lastData && state.lastData.timestamp ? moment(state.lastData.timestamp).format('lll') : 'Indisponível'}
          </span>

        </TooltipContainer>
      </ReactTooltip>
    </>
  );
};

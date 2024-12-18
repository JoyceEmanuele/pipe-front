import { useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex } from 'reflexbox';
import styled from 'styled-components';

import { Loader, StatusBox } from 'components';
import { getCachedDevInfo, getCachedDevInfoSync } from 'helpers/cachedStorage';
import { useStateVar } from 'helpers/useStateVar';
import { useWebSocket, WSConn } from 'helpers/wsConnection';
import { TermometerIcon } from 'icons';
import { DevLayout } from 'pages/Analysis/DEVs/DevLayout';
import { DevFullInfo } from 'store';
import { colors } from 'styles/colors';

import { DutAutControl } from './DutAutControl';
import { useTranslation } from 'react-i18next';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

export const DutAutRealTime = (): JSX.Element => {
  const { t } = useTranslation();
  const routeParams = useParams<{ devId: string }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      devInfo: getCachedDevInfoSync(routeParams.devId),
    };
    state.isLoading = !state.devInfo;
    return state;
  });

  async function getDevInfo() {
    if (!state.devInfo) {
      try {
        state.devInfo = await getCachedDevInfo(routeParams.devId, {});
      } catch (err) {
        console.log(err);
        toast.error(t('houveErro'));
      }
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    getDevInfo();
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaTempoReal')}</title>
      </Helmet>
      <DevLayout devInfo={state.devInfo} />
      {(state.isLoading)
        && (
        <div style={{ paddingTop: '40px' }}>
          {' '}
          <Loader />
          {' '}
        </div>
        )}
      {(state.devInfo && !state.isLoading)
        && <DutAutRealTimeContents devInfo={state.devInfo} />}
    </>
  );
};

export function DutAutRealTimeContents(props: { devInfo: DevFullInfo }): JSX.Element {
  const { t } = useTranslation();
  const { devInfo } = props;
  const [state, render, setState] = useStateVar({
    TUSEMIN: null as null|number,
    ecoModeCfg: null as null|'0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP'|'4_BLOCKED'|'5_BACKUP_CONTROL'|'6_BACKUP_CONTROL_V2'|'7_FORCED'|'8_ECO_2',
    status: 'OFFLINE',
    telemetryDutAut: {
      State: null as null|string,
      Mode: null as null|string,
      status: 'OFFLINE',
      progState: null as null|string,
      ecoModeActing: null as null|boolean,
    },
    telemetryDut: {
      Temperature: null as null|number,
      status: 'OFFLINE',
    },
  });

  useEffect(() => {
    state.TUSEMIN = (devInfo.dut || null) && devInfo.dut!.TUSEMIN;
    state.ecoModeCfg = (devInfo.dut_aut && devInfo.dut_aut.CTRLOPER) || null;
    render();
  }, [devInfo]);

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);
  function onWsOpen(wsConn: WSConn) {
    wsConn.send({ type: 'dutSubscribeRealTime', data: { DUT_ID: devInfo.DEV_ID } });
  }
  function onWsMessage(response: { type: string, data: any }) {
    if (response && response.type === 'dutTelemetry' && response.data.status && response.data.dev_id === devInfo.DEV_ID) {
      state.status = state.telemetryDut.status = response.data.status;
      state.telemetryDut.Temperature = response.data.Temperature;
      render();
    }
    if (response && response.type === 'dutAutTelemetry' && response.data.status && response.data.dev_id === devInfo.DEV_ID) {
      state.status = state.telemetryDutAut.status = response.data.status;
      state.telemetryDutAut.Mode = response.data.Mode;
      state.telemetryDutAut.State = response.data.State;
      state.telemetryDutAut.progState = response.data.progState;
      state.telemetryDutAut.ecoModeActing = response.data.ecoModeActing;
      render();
    }
  }
  function beforeWsClose(wsConn: WSConn) {
    wsConn.send({ type: 'dutUnsubscribeRealTime' });
  }

  return (
    <>
      <Flex pt="10px" flexDirection="column">
        <Card>
          <StatusBox status={state.status} style={{ marginBottom: '30px' }}>{state.status}</StatusBox>
          <DutAutControl
            DUT_ID={devInfo.DEV_ID}
            telemetry={state.telemetryDutAut}
            ecoModeCfg={state.ecoModeCfg}
          />
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Text>
                <b>{t('limiteTemperatura')}</b>
                {' '}
                {(state.TUSEMIN != null) ? `${formatNumberWithFractionDigits(state.TUSEMIN)} °C` : t('semInformacaoTemperatura')}
              </Text>
            </div>
            <Wrapper>
              <StyledText>
                <TermometerIcon />
                {' '}
                {t('temperaturaAmbiente')}
              </StyledText>
              <div>
                <StyledText fontSize="96px">{(state.telemetryDut.Temperature != null) ? `${formatNumberWithFractionDigits(state.telemetryDut.Temperature)}°C` : '-'}</StyledText>
              </div>
            </Wrapper>
            <div>&nbsp;</div>
          </div>
        </Card>
      </Flex>
    </>
  );
}

const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;
const Text = styled.p<{ isBold?: boolean }>(
  ({ isBold }) => `
  margin-top: 1em;
  margin-bottom: 1em;
  color: ${colors.Grey400};
  font-weight: ${isBold ? 'bold' : 'normal'};
`,
);
const StyledText = styled.span<{ fontSize?: string }>(
  ({ fontSize = '16px' }) => `
  font-size: ${fontSize};
  font-weight: bold;
  color: ${colors.Grey400};
  white-space: nowrap;
  text-align: center;
`,
);

const Wrapper = styled.div`
  text-align: center;
`;

/*
    todayEvents: [] as {
      start: number
      end: number
      state: "allow" | "forbid" | "onlyfan"
    }[],

  async function getDutProg () {
    try {
      // setState({ isLoading: true });
      const { dayEvents: todayEvents, indexNow } = await api['/dut/get-programming-as-events']({ dutId: routeParams.devId, todayEvents: true });
      // const now = Date.now();
      state.todayEvents = todayEvents.map((item) => {
        return {
          // start: (item.start_m - indexNow) * 60 * 1000 + now,
          // end: (item.start_m - indexNow + item.duration_m) * 60 * 1000 + now,
          start: item.start_m,
          end: (item.start_m + item.duration_m),
          state: item.state,
        };
      });
    } catch (err) {
      console.log(err);
      // toast.warn('Não existem programações ativas')
      toast.error('Houve erro')
    }
    // setState({ isLoading: false });
  }

  function getProgState (devTimestamp: string): "allow" | "forbid" | "onlyfan" {
    if (!devTimestamp) return null;
    // const nowShifted = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const nowShifted = new Date(devTimestamp + 'Z');
    const index = nowShifted.getUTCHours() * 60 + nowShifted.getUTCMinutes();
    for (const item of state.todayEvents) {
      if ((index >= item.start) && (index < item.end)) {
        return item.state;
      }
    }
    return null;
  }
*/

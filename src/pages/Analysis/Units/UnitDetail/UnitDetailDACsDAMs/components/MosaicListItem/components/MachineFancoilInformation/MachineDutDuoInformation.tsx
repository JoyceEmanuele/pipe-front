import { ReactElement, useState } from 'react';
import {
  DataContainer, HealthContainer, Icon, IconWiFiRealTime, StatusContainer, Title, Label,
} from './styles';
import {
  DatItem, DutDuoItem, formatRssiIcon, rssiDesc,
} from 'pages/Analysis/Units/UnitDetail';
import { TooltipContainer, TransparentLink } from '../../styles';
import { getUserProfile } from 'helpers/userProfile';
import { formatHealthIcon } from 'components/HealthIcon';
import ReactTooltip from 'react-tooltip';
import { useWebSocket } from 'helpers/wsConnection';
import { WaterTemperatureTooltipInfo } from './WaterTemperatureTooltipInfo';

interface MachineDutDuoInformationProps {
  dutDuo: DutDuoItem;
  dat?: DatItem;
  expanded?: boolean;
}

interface WaterDutDuoInfoProps {
  dutDuoId: string;
  status?: string;
}

function WaterDutDuoInfo({
  dutDuoId,
  status,
}: WaterDutDuoInfoProps) {
  const [temperatures, setTemperature] = useState<{
    inlet?: number,
    outlet?: number,
  }>({
    inlet: undefined,
    outlet: undefined,
  });

  function onWsOpen(wsConn) {
    wsConn.send(JSON.stringify({ type: 'subscribeTelemetry', data: { DUT_ID: dutDuoId } }));
  }

  function onWsMessage(payload) {
    if (payload && payload.type === 'dutTelemetry' && payload.data.dev_id === dutDuoId) {
      setTemperature({
        inlet: payload.data.Temperature_1,
        outlet: payload.data.Temperature,
      });
    }
  }

  function beforeWsClose(wsConn) {
    wsConn.send(JSON.stringify({ type: 'subscribeTelemetry', data: {} }));
  }

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  return (
    <WaterTemperatureTooltipInfo
      devId={dutDuoId}
      temperatures={temperatures}
      disabled={status !== 'ONLINE'}
    />
  );
}

export function MachineDutDuoInformation({ dutDuo, dat, expanded = false }: MachineDutDuoInformationProps): ReactElement {
  const [profile] = useState(getUserProfile);
  const profilePermissionAllClients = profile.manageAllClients || profile.permissions.isInstaller;

  function dutDuoNameFormat(dutDuoName: string): string {
    if (dutDuoName.length < 20) {
      return dutDuoName;
    }
    return `${dutDuoName.substring(0, 20)}...`;
  }

  return (
    <>
      <DataContainer expanded={expanded} style={{ padding: '8px 0px 16px 16px', marginRight: 0 }}>
        <div>
          <TransparentLink to={`/analise/maquina/${dutDuo.GROUP_ID}/ativos/${dutDuo.DUT_DUO_ID}/informacoes`}>
            {dutDuo.AST_DESC !== null && (
              <Title data-tip data-for={`tip-${dutDuo.DUT_DUO_ID}`}>
                {dutDuoNameFormat(dutDuo.AST_DESC)}
              </Title>
            )}
          </TransparentLink>
          {profilePermissionAllClients && (
          <>
            <TransparentLink to={`/analise/dispositivo/${dutDuo.DUT_DUO_ID}/informacoes`}>
              <Label>{dutDuo.DUT_DUO_ID}</Label>
            </TransparentLink>
            {dat && (
            <TransparentLink to={`/analise/maquina/${dat.GROUP_ID}/ativos/${dat.DEV_ID || dat.DAT_ID}/informacoes`}>
              <Label>{dat.DAT_ID}</Label>
            </TransparentLink>
            )}
          </>
          )}

        </div>

        <HealthContainer expanded={expanded} className="healthContainer">
          <div>
            <Icon health={dutDuo.H_INDEX}>{formatHealthIcon(dutDuo.H_INDEX)}</Icon>
          </div>
        </HealthContainer>
        <StatusContainer>
          <WaterDutDuoInfo dutDuoId={dutDuo.DUT_DUO_ID} status={dutDuo.status} />
          <IconWiFiRealTime>
            {formatRssiIcon(rssiDesc(dutDuo.RSSI, dutDuo.status ?? 'OFFLINE'))}
          </IconWiFiRealTime>
        </StatusContainer>
        <ReactTooltip
          id={`tip-${dutDuo.DUT_DUO_ID}`}
          place="top"
          border
          textColor="#000000"
          backgroundColor="rgba(255, 255, 255, 0.97)"
          borderColor="#202370"
        >
          <TooltipContainer>
            <strong>{dutDuo.AST_DESC}</strong>
          </TooltipContainer>
        </ReactTooltip>
      </DataContainer>
    </>
  );
}

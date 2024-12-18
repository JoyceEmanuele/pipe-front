import { ReactElement, useState } from 'react';
import {
  DataContainer, HealthContainer, Icon, IconWiFiRealTime, StatusContainer, Title, Label,
} from './styles';
import {
  DacItem, DatItem, formatRssiIcon, rssiDesc,
} from 'pages/Analysis/Units/UnitDetail';
import { TooltipContainer, TransparentLink } from '../../styles';
import { getUserProfile } from 'helpers/userProfile';
import { formatHealthIcon } from '~/components/HealthIcon';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import { useWebSocket } from '~/helpers/wsConnection';
import { WaterTemperatureTooltipInfo } from './WaterTemperatureTooltipInfo';

interface MachineDacInformationProps {
  dac: DacItem;
  dat?: DatItem;
  expanded?: boolean;
}

interface WaterDacInfoProps {
  dacId: string;
  status?: string;
}

function WaterDacInfo({
  dacId,
  status,
}: WaterDacInfoProps) {
  const [temperatures, setTemperature] = useState<{
    inlet?: number,
    outlet?: number,
  }>({
    inlet: undefined,
    outlet: undefined,
  });

  function onWsOpen(wsConn) {
    wsConn.send(JSON.stringify({ type: 'subscribeTelemetry', data: { dac_id: dacId } }));
  }

  function onWsMessage(payload) {
    if (payload && payload.type === 'dacTelemetry' && payload.data.dac_id === dacId) {
      setTemperature({
        inlet: payload.data.Tsuc,
        outlet: payload.data.Tliq,
      });
    }
  }

  function beforeWsClose(wsConn) {
    wsConn.send(JSON.stringify({ type: 'subscribeTelemetry', data: {} }));
  }

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  return (
    <WaterTemperatureTooltipInfo
      devId={dacId}
      temperatures={temperatures}
      disabled={status !== 'ONLINE'}
    />
  );
}

export function MachineDacInformation({ dac, dat, expanded = false }: MachineDacInformationProps): ReactElement {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const profilePermissionAllClients = profile.manageAllClients || profile.permissions.isInstaller;

  function dacNameFormat(dacName: string): string {
    if (dacName.length < 20) {
      return dacName;
    }
    return `${dacName.substring(0, 20)}...`;
  }

  return (
    <>
      <DataContainer expanded={expanded} style={{ padding: '8px 0px 16px 16px', marginRight: 0 }}>
        <div>
          <TransparentLink to={`/analise/maquina/${dac.GROUP_ID}/ativos/${dac.DAC_ID}/informacoes`}>
            {dac.DAC_NAME !== null && (
              <Title data-tip data-for={dac.DAC_ID}>
                {dacNameFormat(dac.DAC_NAME)}
              </Title>
            )}
          </TransparentLink>
          <TransparentLink to={`/analise/dispositivo/${dac.DAC_ID}/informacoes`}>
            {profilePermissionAllClients && (
            <Label>{dac.DAC_ID}</Label>
            )}
          </TransparentLink>
          {dat && (
            <TransparentLink to={`/analise/maquina/${dat.GROUP_ID}/ativos/${dat.DEV_ID || dat.DAT_ID}/informacoes`}>
              {profilePermissionAllClients && (
              <Label>{dat.DAT_ID}</Label>
              )}
            </TransparentLink>
          )}
        </div>

        <HealthContainer expanded={expanded} className="healthContainer">
          <div>
            <Icon health={dac.H_INDEX}>{formatHealthIcon(dac.H_INDEX)}</Icon>
          </div>
          {dac.insufDut && dac.insufDut.Temperature && (
          <div>
            <strong style={{ marginBottom: '10px' }}>{t('insuflamento')}</strong>
            <span>{`${dac.insufDut.Temperature}°C`}</span>
          </div>
          )}
        </HealthContainer>
        <StatusContainer>
          <WaterDacInfo dacId={dac.DAC_ID} status={dac.status} />
          <IconWiFiRealTime>
            {formatRssiIcon(rssiDesc(dac.RSSI, dac.status))}
          </IconWiFiRealTime>
        </StatusContainer>
        <ReactTooltip
          id={dac.DAC_ID}
          place="top"
          border
          textColor="#000000"
          backgroundColor="rgba(255, 255, 255, 0.97)"
          borderColor="#202370"
        >
          <TooltipContainer>
            <strong>{dac.DAC_NAME}</strong>
          </TooltipContainer>
        </ReactTooltip>
      </DataContainer>
    </>
  );
}

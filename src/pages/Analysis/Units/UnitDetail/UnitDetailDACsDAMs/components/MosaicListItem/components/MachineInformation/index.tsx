import { useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { formatHealthIcon } from '~/components/HealthIcon';
import { getUserProfile } from '~/helpers/userProfile';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import {
  DacItem,
  DatItem,
  DutDuoItem,
  DutItem,
  formatRssiIcon,
  rssiDesc,
} from '../../../../..';
import { TooltipContainer } from '../../../../styles';
import {
  Title,
  Subtitle,
  HealthContainer,
  DuoTempContainer,
  UsageContainer,
  StatusContainer,
  Icon,
  TransparentLink,
} from './styles';
import { DataContainer, IconWiFiRealTime, StatusBox } from '../../styles';

type Props = {
  dac?: DacItem;
  dut?: DutItem;
  dat?: DatItem;
  dutsDuo?: DutDuoItem;
  expanded?: boolean;
};

export const MachineInformation = ({
  dac,
  dut,
  dat,
  dutsDuo,
  expanded = false,
}: Props): React.ReactElement => {
  const [profile] = useState(getUserProfile);

  function isDacOnline() {
    if (dac) {
      return typeof dac.Lcmp === 'number' && dac.status === 'ONLINE';
    }

    return false;
  }

  const nameTooltip = () => {
    if (dac) {
      return dac.DAC_NAME;
    }
    if (dat) {
      return dat.AST_DESC;
    }
    if (dutsDuo?.AST_DESC) {
      return dutsDuo.AST_DESC;
    }
    return '';
  };

  const dacNameFormat = (dacName: string) => {
    if (dacName.length < 20) {
      return dacName;
    }
    return `${dacName.substring(0, 20)}...`;
  };

  const profilePermissionAllClients = profile.manageAllClients || profile.permissions.isInstaller;

  function verifyLinkAsset(assetInfo: { ASSET_ID: number, DAT_ID?: string, MACHINE_ID: number }) {
    let link = '';
    if (assetInfo.DAT_ID?.length) {
      link = `/analise/dispositivo/${assetInfo.DAT_ID}/informacoes`;
    } else {
      link = `/analise/maquina/${assetInfo.MACHINE_ID}/ativos/${assetInfo.ASSET_ID}/informacoes`;
    }

    return link;
  }

  function verifyLinkAssetWithDut(assetInfo: { DAT_ID?: string, DEV_ID: string, MACHINE_ID?: number }) {
    let link = '';
    if (assetInfo.DAT_ID?.length) {
      link = `/analise/dispositivo/${assetInfo.DAT_ID}/informacoes`;
    } else if (assetInfo.MACHINE_ID) {
      link = `/analise/maquina/${assetInfo.MACHINE_ID}/ativos/${assetInfo.DEV_ID}/informacoes`;
    } else {
      link = `/analise/dispositivo/${assetInfo.DEV_ID}/informacoes`;
    }

    return link;
  }

  return (
    <>
      {dac && (
        <DataContainer expanded={expanded}>
          <div>
            <TransparentLink to={`/analise/maquina/${dac.GROUP_ID}/ativos/${dac.DAC_ID}/informacoes`}>
              {dac.DAC_NAME != null && (
                <Title data-tip data-for={`tip-${dac.DAC_ID}`}>
                  {
                    dacNameFormat(dac.DAC_NAME)
                  }
                </Title>
              )}
            </TransparentLink>
            <TransparentLink to={`/analise/dispositivo/${dac.DAC_ID}/informacoes`}>
              {profilePermissionAllClients && (
                <>
                  <Subtitle>{dac.DAC_ID}</Subtitle>
                </>
              )}
            </TransparentLink>
            {dat && (
              <TransparentLink to={`/analise/maquina/${dat.GROUP_ID}/ativos/${dat.DEV_ID || dat.DAT_ID}/informacoes`}>
                {profilePermissionAllClients && (
                  <>
                    <Subtitle>{dat.DAT_ID}</Subtitle>
                  </>
                )}
              </TransparentLink>
            )}
          </div>

          <HealthContainer expanded={expanded}>
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
          <UsageContainer>
            <strong>{`${t('usoMedio')}: `}</strong>
            <span>
              {dac.MEAN_USE || '00:00'}
              h/dia
            </span>
          </UsageContainer>
          <StatusContainer>
            {isDacOnline() && (
              <StatusBox isPrimary={false} status={dac.Lcmp}>
                {[t('desligadoMinusculo'), t('ligadoMinusculo')][dac.Lcmp]}
              </StatusBox>
            )}
            <IconWiFiRealTime>
              {formatRssiIcon(rssiDesc(dac.RSSI, dac.status))}
            </IconWiFiRealTime>
          </StatusContainer>
        </DataContainer>
      )}
      {dutsDuo && (
      <DataContainer expanded={expanded}>
        <div>
          <TransparentLink to={`/analise/maquina/${dutsDuo.GROUP_ID}/ativos/${dutsDuo.DUT_DUO_ID}/informacoes`}>
            {dutsDuo.AST_DESC != null && (
            <Title data-tip data-for={`tip-${dutsDuo.GROUP_ID}`}>
              {dutsDuo.AST_DESC.length < 20
                ? dutsDuo.AST_DESC
                : `${dutsDuo.AST_DESC.substring(0, 20)}...`}
            </Title>
            )}
          </TransparentLink>
          <TransparentLink to={`/analise/dispositivo/${dutsDuo.DUT_DUO_ID}/informacoes`}>
            {profilePermissionAllClients && (
            <>
              <Subtitle>{dutsDuo.DUT_DUO_ID}</Subtitle>
            </>
            )}
          </TransparentLink>
          {dat && (
          <TransparentLink to={`/analise/maquina/${dat.GROUP_ID}/ativos/${dat.DEV_ID || dat.DAT_ID}/informacoes`}>
            {profilePermissionAllClients && (
            <>
              <Subtitle>{dat.DAT_ID}</Subtitle>
            </>
            )}
          </TransparentLink>
          )}
        </div>

        <DuoTempContainer expanded={expanded}>
          {dutsDuo.Temperature && (
          <div>
            <strong>{t('saidaAgua')}</strong>
            <span>{`${dutsDuo.Temperature}°C`}</span>
          </div>
          )}
          {dutsDuo.Temperature_1 && (
          <div>
            <strong>{t('entradaAgua')}</strong>
            <span>{`${dutsDuo.Temperature_1}°C`}</span>
          </div>
          )}
        </DuoTempContainer>
        <StatusContainer>
          <IconWiFiRealTime>
            {formatRssiIcon(rssiDesc(dutsDuo.RSSI, dutsDuo.status || 'OFFLINE'))}
          </IconWiFiRealTime>
        </StatusContainer>
      </DataContainer>
      )}
      {dut && (
        <DataContainer expanded={expanded}>
          <div>
            <TransparentLink to={verifyLinkAssetWithDut({
              DAT_ID: dat?.DAT_ID, DEV_ID: dut.DEV_ID, MACHINE_ID: dat?.GROUP_ID,
            })}
            >
              {dat?.AST_DESC != null ? (
                <Title data-tip data-for={dat?.AST_DESC}>
                  {dat?.AST_DESC.length < 20
                    ? dat?.AST_DESC
                    : `${dat?.AST_DESC.substring(0, 20)}...`}
                </Title>
              ) : (
                <Title>
                  {dut.DEV_ID}
                </Title>
              )}
            </TransparentLink>
            <TransparentLink to={`/analise/dispositivo/${dut.DEV_ID}/informacoes`}>
              {profilePermissionAllClients && (
                <>
                  <Subtitle>{dut.DEV_ID}</Subtitle>
                </>
              )}
            </TransparentLink>
          </div>
          <DuoTempContainer expanded={expanded}>
            <div>
              <strong>{t('tempRetorno')}</strong>
              <span>
                {dut.Temperature}
                <span style={{ fontWeight: 'normal' }}>°C</span>
              </span>
            </div>
            <div>
              <strong>{t('tempInsuflamento')}</strong>
              <span>
                {dut.Temperature_1}
                <span style={{ fontWeight: 'normal' }}>°C</span>
              </span>
            </div>
          </DuoTempContainer>
          {/* <HealthContainer expanded={expanded}>
            <div>
              <strong style={{ marginBottom: '10px' }}>Temp. de Retorno</strong>
              <Icon health={0}>{formatHealthIcon(0)}</Icon>
            </div>
          </HealthContainer> */}
          {/* <div style={{ paddingTop: '22px' }} /> */}
          <StatusContainer>
            <IconWiFiRealTime>
              {formatRssiIcon(rssiDesc(dut.RSSI, dut.status))}
            </IconWiFiRealTime>
          </StatusContainer>
        </DataContainer>
      )}
      {(dat && !dac && !dut && !dutsDuo) && (
        <DataContainer
          expanded={expanded}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          <div>
            <TransparentLink to={verifyLinkAsset({
              ASSET_ID: dat.ASSET_ID, DAT_ID: dat.DAT_ID, MACHINE_ID: dat.GROUP_ID,
            })}
            >
              {dat.AST_DESC != null && (
                <Title data-tip data-for={dat.AST_DESC}>
                  {dat.AST_DESC && dat.AST_DESC.length > 25
                    ? `${dat.AST_DESC.substring(0, 25)}...`
                    : dat.AST_DESC}
                </Title>
              )}
              {profilePermissionAllClients && (
                <>
                  <Subtitle />
                  <Subtitle>{dat.DAT_ID}</Subtitle>
                </>
              )}
            </TransparentLink>
          </div>
          <div style={{
            opacity: 0.4,
            fontSize: '10px',
          }}
          >
            <Trans i18nKey="ativoNaoMonitorado">
              Este
              {' '}
              <strong>Ativo</strong>
              {' '}
              não é monitorado remotamente pela Diel Energia.
            </Trans>
          </div>
        </DataContainer>
      )}
      <ReactTooltip
        id={dac ? `tip-${dac?.DAC_ID}` : dat && dat?.AST_DESC}
        place="top"
        border
        textColor="#000000"
        backgroundColor="rgba(255, 255, 255, 0.97)"
        borderColor="#202370"
      >
        <TooltipContainer>
          <strong>{nameTooltip()}</strong>
        </TooltipContainer>
      </ReactTooltip>
    </>
  );
};

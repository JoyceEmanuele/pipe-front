import { ReactElement, useState } from 'react';
import {
  DataContainer, Label, Title,
} from './styles';
import { TooltipContainer, TransparentLink } from '../../styles';
import { DatItem } from '~/pages/Analysis/Units/UnitDetail';
import { getUserProfile } from '~/helpers/userProfile';
import { Trans } from 'react-i18next';
import ReactTooltip from 'react-tooltip';

interface MachineDatInformationProps {
  dat: DatItem;
  expanded: boolean;
}

export function MachineDatInformation({
  dat,
  expanded,
}: MachineDatInformationProps): ReactElement {
  const [profile] = useState(getUserProfile);
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

  return (
    <DataContainer
      expanded={expanded}
      style={{ padding: '8px 16px 16px', marginRight: 0 }}
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
            <Label>{dat.DAT_ID}</Label>
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
      <ReactTooltip
        id={dat.AST_DESC}
        place="top"
        border
        textColor="#000000"
        backgroundColor="rgba(255, 255, 255, 0.97)"
        borderColor="#202370"
      >
        <TooltipContainer>
          <strong>{dat.AST_DESC}</strong>
        </TooltipContainer>
      </ReactTooltip>
    </DataContainer>
  );
}

import { useMemo, useRef, useState } from 'react';

import { useRouteMatch, useHistory } from 'react-router-dom';

import { Breadcrumb2 } from '~/components';
import { getUserProfile } from '~/helpers/userProfile';

import { Header } from '../Header';
import { useTranslation } from 'react-i18next';

type Props = {
  devInfo?: null | { UNIT_NAME: string, GROUP_NAME: string, GROUP_ID: number, UNIT_ID: number, TIMEZONE_ID?: number, TIMEZONE_AREA?: string, TIMEZONE_OFFSET?: number};
  clientName?: string,
  screenInfo?: {
    assetRoleSelected?: number,
    groupSelected: boolean,
    hasNonDutDeviceInAssets: boolean,
    dutAutomationInfo: { placement?: string, dutId?: string },
    devAssociated?: string
    assetId?: string
    isDuoSelected: boolean,
    forceHideHealthTab?: boolean,
  }
}
export const AssetLayout = ({
  devInfo, clientName, screenInfo,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const match = useRouteMatch<{ devId, groupId }>();
  const history = useHistory();
  const [profile] = useState(getUserProfile);
  const { devId } = match.params;
  const { groupId } = match.params;
  const linkBase = groupId ? `/analise/maquina/${groupId}/ativos` : match.url.split(`/${devId}`)[0];
  const isEdit = history.location.pathname.includes('/editarAtivo');

  function verifyDevIdStartsWith(devInit: string) {
    if (devId?.startsWith(devInit)) {
      return true;
    }
    return false;
  }

  function verifyShowDutDuoUsage() {
    if (screenInfo?.dutAutomationInfo?.placement === 'DUO' && ((screenInfo.groupSelected && !screenInfo.hasNonDutDeviceInAssets))) {
      return true;
    }
    return false;
  }

  function verifyShowDutDuoHealth() {
    return isDutPage && screenInfo?.isDuoSelected && screenInfo?.assetRoleSelected !== undefined;
  }

  function verifyShowHealthTab() {
    return !screenInfo?.forceHideHealthTab
      && (isDacPage || verifyShowDutDuoHealth());
  }

  const isDacPage = verifyDevIdStartsWith('DAC');
  const isDamPage = verifyDevIdStartsWith('DAM');
  const isDutPage = verifyDevIdStartsWith('DUT');
  const isDriPage = verifyDevIdStartsWith('DRI');
  const isAssetPage = screenInfo?.devAssociated ? screenInfo?.devAssociated : verifyDevIdStartsWith('ASSET');

  const showDutDuoUsage = !isDacPage && verifyShowDutDuoUsage();
  const bcrumbs = useMemo(() => {
    const path = [] as { text: string, link: string|null }[];
    if (devInfo?.UNIT_NAME) {
      path.push({ text: t('unidade'), link: '/analise/unidades' });
      path.push({ text: devInfo.UNIT_NAME, link: `/analise/unidades/${devInfo.UNIT_ID}` });
      if (devInfo.GROUP_NAME) {
        path.push({ text: devInfo.GROUP_NAME, link: `/analise/maquina/${devInfo.GROUP_ID}/ativos` });
      }
    } else {
      path.push({ text: t('maquinas'), link: '/analise/maquinas' });
    }

    devId && path.push({ text: devId, link: null }); // match.url
    if (profile.manageAllClients && clientName !== undefined) {
      (!path.some((item) => item.text === clientName)) && path.unshift({ text: clientName, link: null });
    }
    return (<Breadcrumb2 items={path} timezoneArea={devInfo?.TIMEZONE_AREA} timezoneGmt={devInfo?.TIMEZONE_OFFSET} unitId={devInfo?.UNIT_ID} />);
  }, [devInfo, devId]);

  const links = [
    {
      title: t('perfil'),
      link: devId ? `${linkBase}/${devId}/informacoes` : linkBase,
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('tempoReal'),
      link: `${linkBase}/${devId}/tempo-real`,
      visible: isAssetPage || isDacPage || isDamPage || isDutPage || isDriPage,
      ref: useRef(null),
    },
    {
      title: t('indiceUso'),
      link: `${linkBase}/${showDutDuoUsage ? screenInfo?.dutAutomationInfo.dutId : devId}/indice-de-uso`,
      visible: isAssetPage || isDacPage || showDutDuoUsage && !profile.permissions.isInstaller,
      ref: useRef(null),
    },
    {
      title: t('saude'),
      link: `${linkBase}/${devId}/saude`,
      visible: verifyShowHealthTab() && !profile.permissions.isInstaller,
      ref: useRef(null),
    },
    {
      title: t('historico'),
      link: `${linkBase}/${devId}/historico`,
      visible: isAssetPage || isDacPage || isDutPage || isDamPage || isDriPage,
      ref: useRef(null),
    },
    {
      title: t('controleRemoto'),
      link: `${linkBase}/${devId}/controle-remoto`,
      visible: isDutPage && (
        profile.manageAllClients
        || profile.permissions.isUserManut
        || (profile.permissions.CLIENT_MANAGE.includes(104)) // alteração temporária
      ),
      ref: useRef(null),
    },
    {
      title: t('editar'),
      link: match.url,
      visible: !!isEdit,
      ref: useRef(null),
    },
  ];

  return (
    <>
      {bcrumbs}
      <div style={{ marginTop: '35px' }} />
      <Header links={links.filter((x) => x.visible)} match={history} />
    </>
  );
};

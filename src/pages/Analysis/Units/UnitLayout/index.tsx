import { useEffect, useMemo, useState } from 'react';
import { t } from 'i18next';
import { useParams, useHistory } from 'react-router-dom';

import { Breadcrumb3 } from 'components/Breadcrumb';
import { getUserProfile } from 'helpers/userProfile';
import { Header } from 'pages/Analysis/Header';

export type TUnitInfo = {
  CLIENT_NAME: string
  CLIENT_ID: number
  UNIT_ID: number
  UNIT_NAME: string
  UNIT_CODE_CELSIUS: string
  UNIT_CODE_API: string
  LAT: string
  LON: string
  CITY_ID: string
  CITY_NAME: string
  STATE_ID: string
  ADDRESS: string
  PRODUCTION: boolean
  hasEnergyInfo: boolean
  TARIFA_KWH: number
  EXTRA_DATA: string
  GA_METER: number
  TARIFA_DIEL: 0|1
  hasNess: boolean
  hasWater: boolean
  hasOxyn: boolean
  hasLaager: boolean
  hasChiller: boolean
  hasVrf: boolean
  dmaId: string
  BASELINE_ID: number
  TIMEZONE_AREA: string
  TIMEZONE_ID: number
  TIMEZONE_OFFSET: number
  CONSTRUCTED_AREA: number
  AMOUNT_PEOPLE: number
  arrayChiller: { VARSCFG: string; DEVICE_CODE: string; }[]
}

export const UnitLayout = (props: {
  unitInfo: null | TUnitInfo
}): JSX.Element => {
  const routeParams = useParams<{ unitId }>();
  const history = useHistory();
  const [profile] = useState(getUserProfile);
  const { unitInfo } = props;
  const isInstaller = profile.permissions.isInstaller;
  const links = [] as { title: string, link: string }[];

  links.push({
    title: t('perfil'),
    link: `/analise/unidades/perfil/${routeParams.unitId}`,
  });
  if (props.unitInfo && !props.unitInfo.hasChiller) {
    links.push({
      title: t('tempoReal'),
      link: `/analise/unidades/${routeParams.unitId}`,
    });

    if (!isInstaller) {
      links.push({
        title: t('analiseIntegrada'),
        link: `/analise/unidades/integrated/${routeParams.unitId}`,
      });
    }
    links.push({
      title: t('energia'),
      link: `/analise/unidades/energyEfficiency/${routeParams.unitId}`,
    });
  }
  if (props.unitInfo && props.unitInfo.hasNess && !isInstaller) {
    links.push({
      title: 'NESS',
      link: `/analise/unidades/integracao-ness/${routeParams.unitId}`,
    });
  }
  if (props.unitInfo && props.unitInfo.hasLaager) {
    links.push({
      title: t('agua'),
      link: `/analise/unidades/integracao-agua/${routeParams.unitId}?aba=historico&supplier=laager`,
    });
  }
  if (props.unitInfo && props.unitInfo.dmaId) {
    links.push({
      title: t('agua'),
      link: `/analise/unidades/integracao-agua/${routeParams.unitId}?aba=historico&supplier=diel`,
    });
  }
  if (props.unitInfo && props.unitInfo.hasVrf && !isInstaller) {
    links.push({
      title: t('sistemasVrf'),
      link: `/analise/unidades/integracao-vrf/${routeParams.unitId}`,
    });
  }
  if (history.location.pathname.startsWith('/analise/unidades/revezamento-programacao/')) {
    links.push({
      link: history.location.pathname,
      title: t('revezamentoDeProgramacao'),
    });
  }
  if (history.location.pathname.startsWith(`/analise/unidades/perfil/${routeParams.unitId}/editar`)) {
    links.push({
      link: history.location.pathname,
      title: t('editarUnidade'),
    });
  }
  if (props.unitInfo && props.unitInfo.hasChiller) {
    links.push({
      link: `/analise/unidades/cag/${routeParams.unitId}`,
      title: t('CAG'),
    });
  }
  const bcrumbItems = useMemo(() => {
    const path = [] as { text: string, link: string|null }[];
    if (unitInfo && unitInfo.UNIT_NAME) {
      if (profile.manageAllClients) {
        path.push({ text: unitInfo.CLIENT_NAME, link: null });
      }
      path.push({ text: t('analise'), link: '/analise' });
      path.push({ text: t('unidades'), link: '/analise/unidades' });
      if (unitInfo.hasChiller) {
        path.push({ text: unitInfo.UNIT_NAME, link: `/analise/unidades/cag/${unitInfo.UNIT_ID}` });
      } else {
        path.push({ text: unitInfo.UNIT_NAME, link: `/analise/unidades/${unitInfo.UNIT_ID}` });
      }
    }
    return path;
  }, [unitInfo]);

  useEffect(() => {
    if (unitInfo && unitInfo?.hasChiller) {
      const linkBase = `/analise/unidades/cag/${unitInfo.UNIT_ID}?aba=tempo-real&driId=${unitInfo.arrayChiller?.[0].DEVICE_CODE}`;
      history.push(`${linkBase}`);
    }
  }, []);

  return (
    <>
      <Breadcrumb3 items={bcrumbItems} timezoneArea={unitInfo?.TIMEZONE_AREA} timezoneGmt={unitInfo?.TIMEZONE_OFFSET} unitId={unitInfo?.UNIT_ID} />
      <div style={{ marginTop: '35px' }} />
      <Header links={links} match={history} />
    </>
  );
};

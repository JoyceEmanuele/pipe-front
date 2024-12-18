import { useMemo, useRef } from 'react';
import queryString from 'query-string';
import { useHistory } from 'react-router-dom';

import { Breadcrumb2 } from '~/components';

import { Header, Headers2 } from '../Header';

import { useTranslation } from 'react-i18next';

export default function IntegrLayout(props: {
  integrType: string,
  integrId: string,
  varsCfg?: any,
}): JSX.Element {
  const history = useHistory();
  const { t } = useTranslation();

  const { integrType, integrId, varsCfg } = props;
  const isEdit = history.location.pathname.endsWith('/editar');

  const links = [
    {
      title: t('perfil'),
      link: `/integracoes/info/${integrType}/${integrId}/perfil`,
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('tempoReal'),
      link: `/integracoes/info/${integrType}/${integrId}/tempo-real`,
      visible: ((integrType === 'diel' && varsCfg) || ['ness', 'water', 'coolautomation'].includes(integrType) || (integrType === 'diel' && integrId.startsWith('DMA'))),
      ref: useRef(null),
    },
    {
      title: t('historico'),
      link: `/integracoes/info/${integrType}/${integrId}/historico`,
      visible: ((integrType === 'diel' && varsCfg?.application && !['cg-et330', 'abb-nexus-ii', 'abb-ete-30', 'abb-ete-50', 'cg-em210', 'kron-mult-k', 'kron-mult-k-05', 'kron-mult-k-120', 'kron-ikron-03', 'schneider-eletric-pm2100', 'schneider-electric-pm210', 'schneider-electric-pm9c'].includes(varsCfg.application)) || ['ness', 'water', 'coolautomation'].includes(integrType) || (integrType === 'diel' && integrId.startsWith('DMA'))),
      ref: useRef(null),
    },
    {
      title: t('editar'),
      link: `/integracoes/info/${integrType}/${integrId}/editar`,
      visible: !!isEdit,
      ref: useRef(null),
    },
  ];

  return (
    <Header links={links.filter((x) => x.visible)} match={history} />
  );
}

export function buildTabLink(aba: string, history: ReturnType<typeof useHistory>) {
  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;

  return `${linkBase}?${queryString.stringify({ ...queryPars, aba })}`;
}

export function IntegrInlineTabs(props: {
  integrType: string,
}): JSX.Element {
  const { t } = useTranslation();
  const history = useHistory();
  const { integrType } = props;

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;

  const allTabs = [
    {
      title: t('perfil'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'perfil' })}`,
      visible: true,
      isActive: (queryPars.aba === 'perfil') || (!queryPars.aba && integrType !== 'coolautomation'),
      ref: useRef(null),
    },
    {
      title: t('tempoReal'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'tempo-real' })}`,
      visible: (['diel', 'ness', 'coolautomation'].includes(integrType) || (integrType === 'water' && queryPars.supplier === 'diel')),
      isActive: (queryPars.aba === 'tempo-real') || (!queryPars.aba && integrType === 'coolautomation'),
      ref: useRef(null),
    },
    {
      title: t('historico'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'historico' })}`,
      visible: (['diel', 'water', 'coolautomation'].includes(integrType)),
      isActive: (queryPars.aba === 'historico'),
      ref: useRef(null),
    },
    {
      title: t('editar'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'editar' })}`,
      visible: (queryPars.aba === 'editar'),
      isActive: (queryPars.aba === 'editar'),
      ref: useRef(null),
    },
  ];

  return (
    <Headers2 links={allTabs.filter((x) => x.visible)} />
  );
}

export function IntegrBreadCrumbs(props: {
  integrId: string,
  integrType: string,
  devInfo: null | {
    CLIENT_ID: number,
    CLIENT_NAME: string,
    UNIT_NAME: string,
    UNIT_ID: number,
    machineName: string,
    dataSource: string,
    automatedMachine?: string,
    TIMEZONE_ID?: number
    TIMEZONE_AREA?: string
    TIMEZONE_OFFSET?: number
  },
}) {
  const { t } = useTranslation();
  const { integrId, devInfo } = props;
  const integrType = props.integrType === 'water' ? t('agua') : props.integrType;

  const bcrumbs = useMemo(() => {
    const path = [] as {}[];
    // if (devInfo && devInfo.UNIT_NAME) {
    //   path.push({ text: 'Unidades', link: '/analise/unidades' });
    //   path.push({ text: devInfo.UNIT_NAME, link: `/analise/unidades/${devInfo.UNIT_ID}` });
    //   if (devInfo.machineName) {
    //     path.push({ text: devInfo.machineName, link: null });
    //   }
    // }
    // path.push({ text: `Integração ${integrType}`, link: `/integracoes?fornecedor=${integrType}` });
    if (integrType === 'diel' && devInfo && devInfo.CLIENT_ID && devInfo.UNIT_ID) {
      path.push({ text: devInfo.CLIENT_NAME, link: '/visao-geral' });
      path.push({ text: devInfo.UNIT_NAME, link: `/analise/unidades/${devInfo.UNIT_ID}` });
      if (devInfo.machineName) {
        path.push({ text: devInfo.machineName, link: `/integracoes/info/diel/${devInfo.dataSource}/perfil` });
      }
      else if (devInfo.automatedMachine) {
        path.push({ text: devInfo.automatedMachine, link: null });
      }
      path.push({ text: devInfo.dataSource, link: null });
    } else if (devInfo) {
      path.push({ text: t('integracoes'), link: '/integracoes' });
      path.push({ text: integrType.toUpperCase(), link: `/integracoes?fornecedor=${integrType}` });
      path.push({ text: (devInfo && devInfo.dataSource) || integrId, link: null }); // match.url
    }
    return (<Breadcrumb2 items={path} timezoneArea={devInfo?.TIMEZONE_AREA} timezoneGmt={devInfo?.TIMEZONE_OFFSET} unitId={devInfo?.UNIT_ID} />);
  }, [devInfo]);
  return (
    <>
      {bcrumbs}
      <div style={{ marginTop: '35px' }} />
    </>
  );
}

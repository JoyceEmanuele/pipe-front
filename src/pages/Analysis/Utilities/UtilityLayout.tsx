import { useMemo, useRef, useState } from 'react';

import { useRouteMatch, useHistory } from 'react-router-dom';

import { Breadcrumb2 } from '~/components';
import { getUserProfile } from '~/helpers/userProfile';

import { Header } from '../Header';
import { useTranslation } from 'react-i18next';

type Props = {
  utilInfo?: null | {UNIT_NAME: string; UNIT_ID: number; CLIENT_NAME: string, NAME: string, DAL_CODE?: string, DMT_CODE?: string, DAM_ILLUMINATION_CODE?: string, TIMEZONE_ID?: number, TIMEZONE_AREA?: string, TIMEZONE_OFFSET?: number};
  utility?: string;
};

export const UtilityLayout = ({ utilInfo }: Props): JSX.Element => {
  const { t } = useTranslation();
  const match = useRouteMatch<{ utilId, type }>();
  const history = useHistory();
  const [profile] = useState(getUserProfile);

  const { utilId, type } = match.params;
  const linkBase = match.url.split(`/${utilId}`)[0];
  const isEdit = history.location.pathname.includes('/editar');

  const bcrumbs = useMemo(() => {
    const path = [] as { text: string, link: string|null }[];
    if (utilInfo && utilInfo.UNIT_NAME) {
      path.push({ text: t('unidade'), link: '/analise/unidades' });
      path.push({ text: utilInfo.UNIT_NAME, link: `/analise/unidades/${utilInfo.UNIT_ID}` });
    }
    utilInfo && utilInfo.DAL_CODE && path.push({ text: utilInfo.DAL_CODE, link: `/analise/dispositivo/${utilInfo.DAL_CODE}/informacoes` }); // match.url
    utilInfo && utilInfo.DMT_CODE && path.push({ text: utilInfo.DMT_CODE, link: `/analise/dispositivo/${utilInfo.DMT_CODE}/informacoes` }); // match.url
    utilInfo && utilInfo.DAM_ILLUMINATION_CODE && path.push({ text: utilInfo.DAM_ILLUMINATION_CODE, link: `/analise/dispositivo/${utilInfo.DAM_ILLUMINATION_CODE}/informacoes` }); // match.url

    utilInfo && path.push({ text: utilInfo.NAME, link: null }); // match.url
    if (profile.manageAllClients && utilInfo?.CLIENT_NAME) {
      (!path.some((item) => item.text === utilInfo.CLIENT_NAME)) && path.unshift({ text: utilInfo.CLIENT_NAME, link: null });
    }
    return (<Breadcrumb2 items={path} timezoneArea={utilInfo?.TIMEZONE_AREA} timezoneGmt={utilInfo?.TIMEZONE_OFFSET} unitId={utilInfo?.UNIT_ID} />);
  }, [utilInfo, utilId]);

  const isIllumination = type === 'iluminacao';
  const isDal = !!utilInfo?.DAL_CODE;
  const isDam = !!utilInfo?.DAM_ILLUMINATION_CODE;

  const links = [
    {
      title: t('perfil'),
      link: `${linkBase}/${utilId}/informacoes`,
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('tempoReal'),
      link: `${linkBase}/${utilId}/tempo-real`,
      visible: isIllumination && isDal,
      ref: useRef(null),
    },
    {
      title: t('tempoReal'),
      link: `/analise/dispositivo/${type}/${utilId}/${utilInfo?.DAM_ILLUMINATION_CODE}/tempo-real`,
      visible: isIllumination && isDam,
      ref: useRef(null),
    },
    {
      title: t('historico'),
      link: `/analise/dispositivo/${type}/${utilId}/${utilInfo?.DAM_ILLUMINATION_CODE}/historico`,
      visible: isIllumination && isDam,
      ref: useRef(null),
    },
    {
      title: t('indiceUso'),
      link: `${linkBase}/${utilId}/indice-de-uso`,
      visible: isDal,
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

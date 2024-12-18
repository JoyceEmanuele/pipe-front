import {
  useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch, useHistory } from 'react-router-dom';

import { Breadcrumb2 } from '~/components';
import { getUserProfile } from '~/helpers/userProfile';

import { Header } from '../Header';

export const DevLayout = ({ devInfo }): JSX.Element => {
  const { t } = useTranslation();
  const match = useRouteMatch<{ devId, utilId, type }>();
  const history = useHistory();
  const [profile] = useState(getUserProfile);

  const { devId, utilId, type } = match.params;
  const linkBase = '/analise/dispositivo'; // match.url.split(`/${devId}`)[0];
  const isEdit = history.location.pathname.endsWith('/editar');

  let isDac = false;
  let isDam = false;
  let isDut = false;
  let isDutAut = false;
  let isDal = false;
  let isDmt = false;
  let isDutDuo = false;

  if (devInfo) {
    isDac = !!devInfo.dac;
    isDam = !!devInfo.dam;
    isDut = !!devInfo.dut;
    isDutAut = !!devInfo.dut_aut;
    isDal = !!devInfo.dal;
    isDmt = !!devInfo.dmt;
    isDutDuo = devInfo.dut?.PLACEMENT === 'DUO';
  }
  const permissionManageClient = (devInfo?.CLIENT_ID && profile.permissions.CLIENT_MANAGE.includes(devInfo.CLIENT_ID));
  const bcrumbs = useMemo(() => {
    const path = [] as { text: string, link: string|null }[];
    if (devInfo && devInfo.UNIT_NAME) {
      if (profile.manageAllClients) {
        path.push({ text: devInfo.CLIENT_NAME, link: null });
      }
      path.push({ text: t('unidades'), link: '/analise/unidades' });
      path.push({ text: devInfo.UNIT_NAME, link: `/analise/unidades/${devInfo.UNIT_ID}` });
      if (devInfo.dac && devInfo.dac.GROUP_NAME) {
        path.push({ text: devInfo.dac.GROUP_NAME, link: null });
      }
      if (devInfo.dut && devInfo.dut.ROOM_NAME) {
        path.push({ text: devInfo.dut.ROOM_NAME, link: null });
      }
      if (devInfo.dam && (!devInfo.dac) && devInfo.dam.groups && devInfo.dam.groups.length > 0) {
        const groupName = devInfo.dam.groups.filter((x) => x.GROUP_NAME).map((x) => x.GROUP_NAME).join(', ');
        if (groupName) {
          path.push({ text: groupName, link: null });
        }
      }
    } else if (isDac) {
      path.push({ text: t('maquinas'), link: '/analise/maquinas' });
    } else if (isDam) {
      path.push({ text: t('automacao'), link: '/analise/dams' });
    } else if (isDut) {
      path.push({ text: t('ambientes'), link: '/analise/ambientes' });
    }
    // if (isEdit) {
    //   path.push({ text: devId, link: `${linkBase}/${devId}/informacoes` })
    //   path.push({ text: 'Editar', link: match.url })
    // }
    path.push({ text: devId, link: null }); // match.url
    return (<Breadcrumb2 items={path} timezoneArea={devInfo?.TIMEZONE_AREA} timezoneGmt={devInfo?.TIMEZONE_OFFSET} unitId={devInfo?.UNIT_ID} />);
  }, [devInfo]);

  const links = [
    {
      title: t('perfil'),
      link: `${linkBase}/${devId}/informacoes`,
      visible: !utilId,
      ref: useRef(null),
    },
    {
      title: t('perfil'),
      link: `/analise/utilitario/${type}/${utilId}/informacoes`,
      visible: !!utilId,
      ref: useRef(null),
    },
    {
      title: t('tempoReal'),
      link: `${linkBase}/${devId}/tempo-real`,
      visible: !utilId,
      ref: useRef(null),
    },
    {
      title: t('tempoReal'),
      link: `${linkBase}/${type}/${utilId}/${devId}/tempo-real`,
      visible: !!utilId,
      ref: useRef(null),
    },
    {
      title: t('indiceUso'),
      link: `${linkBase}/${devId}/indice-de-uso`,
      visible: isDal || isDutDuo || isDmt || isDac && !profile.permissions.isInstaller,
      ref: useRef(null),
    },
    {
      title: t('saude'),
      link: `${linkBase}/${devId}/saude`,
      visible: (isDac || isDutDuo) && !profile.permissions.isInstaller,
      ref: useRef(null),
    },
    {
      title: t('historico'),
      link: `${linkBase}/${devId}/historico`,
      visible: !utilId && !isDal && !isDmt && (isDac || isDut || profile.manageAllClients || permissionManageClient || profile.permissions.isInstaller),
      ref: useRef(null),
    },
    {
      title: t('historico'),
      link: `${linkBase}/${type}/${utilId}/${devId}/historico`,
      visible: !!utilId && !isDal && !isDmt && (isDac || isDut || profile.manageAllClients || permissionManageClient || profile.permissions.isInstaller),
      ref: useRef(null),
    },
    {
      title: t('infra-vermelho'),
      link: `${linkBase}/${devId}/infravermelho`,
      visible: isDutAut && (
        profile.manageAllClients
        || profile.permissions.isUserManut
        || profile.permissions.isInstaller
        || permissionManageClient
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
      { bcrumbs }
      <div style={{ marginTop: '35px' }} />
      <Header links={links.filter((x) => x.visible)} match={history} />
    </>
  );
};

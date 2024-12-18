import { useHistory } from 'react-router-dom';
import { Header } from 'pages/Analysis/Header';
import { useTranslation } from 'react-i18next';
import { getUserProfile } from '../../../helpers/userProfile';
import { useState } from 'react';

export const AnalysisLayout = (): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const [profile] = useState(getUserProfile);

  const links = [
    {
      title: t('unidades'),
      link: '/analise/unidades',
    },
    {
      title: t('maquinas'),
      link: '/analise/maquinas',
    },
    {
      title: t('ambientes'),
      link: '/analise/ambientes',
    },
    {
      title: t('energia'),
      link: '/analise/energia',
    },
  ];

  if (history.location.pathname.includes('/analise/programacao-dams')) {
    links.push({
      title: t('programacao'),
      link: history.location.pathname + history.location.search,
    });
  }

  if (!profile.permissions.isInstaller) {
    links.push({
      title: t('geolocalizacao'),
      link: '/analise/geolocalizacao',
    });
  }
  links.push({
    title: t('dispositivos'),
    link: '/analise/dispositivos',
  });
  links.push({
    title: t('utilitarios'),
    link: '/analise/utilitarios',
  });

  return (
    <>
      <Header links={links} match={history} />
    </>
  );
};

export const AnalysisLayoutGeneral = (): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const links = [
    {
      title: t('geral'),
      link: '/analise/geral',
    },
    {
      title: t('comparativo'),
      link: '/analise/comparativo',
    },
    {
      title: t('geolocalizacao'),
      link: '/analise/geolocalizacao',
    },
  ];

  return (
    <>
      <Header links={links} match={history} />
    </>
  );
};

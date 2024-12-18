import { useState } from 'react';

import { useHistory } from 'react-router-dom';

import { Header } from '../Analysis/Header';
import { getUserProfile } from '~/helpers/userProfile';

export const ClientPanelLayout = (): JSX.Element => {
  const history = useHistory();
  const [profile] = useState(getUserProfile);
  const links = [
    {
      link: '/painel/client-painel',
      title: 'Painel',
    },
  ];

  if ((!profile.manageAllClients) && (profile.manageSomeClient) && !profile.permissions.isInstaller && profile.permissions.CLIENT_MANAGE.includes(145)) {
    links.push({
      link: '/painel/projeto-bb/kpis',
      prefix: '/painel/projeto-bb/',
      title: 'Informações do Projeto',
    });
  }

  return (
    <>
      <Header links={links} match={history} />
    </>
  );
};

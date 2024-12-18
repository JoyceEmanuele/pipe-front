import { useState } from 'react';

import { useHistory } from 'react-router-dom';

import { getUserProfile } from 'helpers/userProfile';

import { Header } from '../../Analysis/Header';

export const AdminLayout = (): JSX.Element => {
  const history = useHistory();
  const [profile] = useState(getUserProfile);

  const links = [
    {
      link: '/painel/clientes/listagem',
      title: 'Empresas',
    },
    {
      link: '/painel/cidades',
      title: 'Cidades',
    },
    {
      link: '/painel/falhas/dac',
      prefix: '/painel/falhas/',
      title: 'Falhas',
    },
    {
      link: '/painel/dut-ir',
      title: 'DUT IR',
    },
    {
      link: '/painel/devlogs',
      title: 'Logs',
    },
    {
      link: '/painel/firmware',
      title: 'Firmware',
    },
    {
      link: '/painel/simCards?empresa=todos',
      title: 'SIMCARDS',
    },
    {
      link: '/painel/integracoes',
      title: 'Integrações',
    },
  ];
  if (profile.permissions.isAdminSistema) {
    links.push({
      link: '/painel/fabricantes',
      title: 'Fabricantes',
    });
    links.push({
      link: '/painel/sensores',
      title: 'Sensores',
    });
    links.push({
      link: '/painel/servers-monitoring',
      title: 'Servidores',
    });
    links.push({
      link: '/painel/ferramentas-diel',
      title: 'Ferramentas Diel',
    });
    links.push({
      link: '/painel/projeto-bb/kpis',
      prefix: '/painel/projeto-bb/',
      title: 'Projeto BB',
    });
    links.push({
      link: '/painel/horario-verao',
      prefix: '/painel/horario-verao/',
      title: 'Horario de Verão',
    });
  }
  if (profile.isMasterUser || history.location.pathname.endsWith('/painel/devtools')) {
    links.push({
      link: '/painel/devtools',
      title: 'DevTools',
    });
  }
  if (profile.isMasterUser || history.location.pathname.endsWith('/painel/analise-automacao-grupos')) {
    links.push({
      link: '/painel/analise-automacao-grupos',
      title: 'Análise Automação',
    });
  }

  return (
    <>
      <Header links={links} match={history} />
    </>
  );
};

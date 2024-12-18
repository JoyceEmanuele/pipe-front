import { useState } from 'react';

import { useHistory } from 'react-router-dom';

import { getUserProfile } from 'helpers/userProfile';

import { Header } from '../../Analysis/Header';

export const FaultsLayout = ({ ...props }): JSX.Element => {
  const history = useHistory();
  const [profile] = useState(getUserProfile);

  const links = [
    {
      link: '/painel/falhas/dac',
      title: 'DAC',
    },
    {
      link: '/painel/falhas/dut',
      title: 'DUT',
    },
    {
      link: '/painel/falhas/dam',
      title: 'DAM',
    },
    {
      link: '/painel/falhas/instalacao',
      title: 'Instalação',
    },
    {
      link: '/painel/falhas/desativadas',
      title: 'Desativadas',
    },
  ];

  return (
    <>
      <Header links={links} match={history} />
    </>
  );
};

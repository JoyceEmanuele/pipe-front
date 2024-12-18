import { useHistory } from 'react-router-dom';
import { Header, Headers2 } from '../../../Analysis/Header';
import queryString from 'query-string';
import { useRef } from 'react';

export const ProjetoBBLayout = ({ ...props }): JSX.Element => {
  const links = [
    {
      link: '/painel/projeto-bb/kpis',
      title: 'KPIs do Projeto',
    },
    {
      link: '/painel/projeto-bb/ans/recente',
      title: 'ANS',
    },
    {
      link: '/painel/projeto-bb/cronograma',
      title: 'Cronograma de Instalação',
    },
    {
      link: '/painel/projeto-bb/cadastroAC',
      title: 'Cadastro AC',
    },
    {
      link: '/painel/projeto-bb/nobreak',
      title: 'Cadastro Nobreak',
    },
  ];

  return (
    <>
      <Header links={links} />
    </>
  );
};

export const AnsLayout = ({ ...props }): JSX.Element => {
  const history = useHistory();
  const linkBase = history.location.pathname;
  const links = [
    {
      title: 'Recente',
      link: '/painel/projeto-bb/ans/recente',
      isActive: linkBase.includes('recente'),
      visible: true,
      ref: useRef(null),
    },
    {
      title: 'Antiga',
      link: '/painel/projeto-bb/ans/antiga',
      isActive: linkBase.includes('antiga'),
      visible: true,
      ref: useRef(null),
    },
  ];

  return (
    <>
      <Headers2 links={links} />
    </>
  );
};

import { useHistory } from 'react-router-dom';
import { Header } from '../Analysis/Header';

export const NewNotificationsLayout = ({ ...props }): JSX.Element => {
  const history = useHistory();
  const links = [
    {
      title: 'Feed',
      link: '/notificacoes/feed',
    },
    {
      title: 'Histórico',
      link: '/notificacoes/historico',
    },
    {
      title: 'Gerenciamento',
      link: '/notificacoes/gerenciamento',
    },
  ];

  return (
    <>
      <Header links={links} match={history} />
    </>
  );
};

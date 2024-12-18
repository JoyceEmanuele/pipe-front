import { useTranslation } from 'react-i18next';
import { useHistory, useRouteMatch } from 'react-router-dom';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { Headers2 } from '../../Header';
import { getUserProfile } from '~/helpers/userProfile';

export function ChillerInlineTabs(): JSX.Element {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch<{ devId, utilId, type }>();
  const queryPars = queryString.parse(history.location.search);
  const isEdit = queryPars.aba === 'editar';
  const linkBase = history.location.pathname;
  const [profile] = useState(getUserProfile);
  const abas = ['perfil', 'tempo-real', 'historico'];

  const allTabs = abas.map((item) => (
    {
      title: t(item === 'tempo-real' ? 'tempoReal' : item),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: item })}`,
      visible: item !== 'editar' ? true : profile.manageAllClients,
      isActive: (queryPars.aba === item),
    }
  ));

  allTabs.push({
    title: t('editar'),
    link: match.url,
    visible: !!isEdit,
    isActive: (queryPars.aba === 'editar'),
  });

  return (
    <div>
      <Headers2 links={allTabs.filter((x) => x.visible)} />
    </div>
  );
}

export function ChillerDrisTabs(links) {
  return (
    <div style={{ marginTop: 20 }}>
      <Headers2 links={links} />
    </div>
  );
}

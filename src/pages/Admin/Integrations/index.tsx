import { useRef } from 'react';

import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router';
import { Headers2 } from 'pages/Analysis/Header';

import { AdminLayout } from '../AdminLayout';
import { CoolAutomation } from './CoolAutomation';
import { DRIUnits } from './DRIUnits';
import { GreenAntMeters } from './GreenAntMeters';
import { Water } from './Water';
import { withTransaction } from '@elastic/apm-rum-react';
import { ApiIntegrations } from './ApiIntegrations';
import { getUserProfile } from '~/helpers/userProfile';

export const Integrations = (): JSX.Element => {
  const profile = getUserProfile();
  const isAdmin = profile.permissions?.isAdminSistema;
  const history = useHistory();
  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;
  const allTabs = [
    {
      title: 'API',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'api' })}`,
      isActive: isAdmin && (queryPars.aba === 'api') || isAdmin && (!queryPars.aba),
      visible: isAdmin,
      ref: useRef(null),
    },
    {
      title: 'GreenAnt',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'greenant' })}`,
      isActive: (queryPars.aba === 'greenant') || !isAdmin && (!queryPars.aba),
      visible: true,
      ref: useRef(null),
    },
    {
      title: 'CoolAutomation',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'coolautomation' })}`,
      isActive: (queryPars.aba === 'coolautomation'),
      visible: true,
      ref: useRef(null),
    },
    {
      title: 'Água',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'water' })}`,
      isActive: (queryPars.aba === 'water'),
      visible: true,
      ref: useRef(null),
    },
    {
      title: 'DRI',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'dri' })}`,
      isActive: (queryPars.aba === 'dri'),
      visible: true,
      ref: useRef(null),
    },
  ];
  const tabs = allTabs.filter((x) => x.visible);

  return (
    <>
      <Helmet>
        <title>Diel Energia - Integrações</title>
      </Helmet>
      <AdminLayout />
      <div style={{ paddingTop: '20px' }}>
        <Headers2 links={tabs} />
        <br />
        {(allTabs[0].isActive) && <ApiIntegrations />}
        {(allTabs[1].isActive) && <GreenAntMeters />}
        {(allTabs[2].isActive) && <CoolAutomation />}
        {(allTabs[3].isActive) && <Water />}
        {(allTabs[4].isActive) && <DRIUnits />}
      </div>
    </>
  );
};

export default withTransaction('Integrations', 'component')(Integrations);

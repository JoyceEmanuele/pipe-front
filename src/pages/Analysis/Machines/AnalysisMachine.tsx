import queryString from 'query-string';
import { useHistory } from 'react-router-dom';
import { AnalysisLayout } from '../AnalysisLayout';
import { Helmet } from 'react-helmet';
import { useEffect, useRef } from 'react';
import { t } from 'i18next';
import { Headers2 } from '../Header';
import { generateNameFormatted } from '~/helpers/titleHelper';
import { MachinesAnalisys } from '.';
import { Machines } from 'pages/Analysis/DACs/Machines';

export const AnalysisMachines = (): JSX.Element => {
  const history = useHistory();
  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;
  const allTabs = [
    {
      title: t('geral'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, tipo: 'machines' })}`,
      isActive: (queryPars.tipo === 'machines' || !queryPars.tipo),
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('ativos'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, tipo: 'assets' })}`,
      isActive: (queryPars.tipo === 'assets'),
      visible: true,
      ref: useRef(null),
    },
  ];

  useEffect(() => {
    if (!queryPars.tipo) {
      history.push(`${linkBase}?tipo=machines`);
    }
  }, []);

  function returnAba() {
    if (queryPars.tipo === 'machines') {
      return t('energia');
    }
    if (queryPars.tipo === 'assets') {
      return t('comparativo');
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Helmet>
        <title>{generateNameFormatted('Celsius 360', returnAba())}</title>
      </Helmet>
      <AnalysisLayout />
      <div style={{ paddingTop: '10px' }}>
        <Headers2 links={allTabs} />
      </div>
      {
        queryPars.tipo === 'machines' && (
          <MachinesAnalisys />
        )
      }
      {
        queryPars.tipo === 'assets' && (
          <Machines history={history} />
        )
      }
    </div>
  );
};

import queryString from 'query-string';
import { useHistory } from 'react-router-dom';
import { AnalysisLayout } from '../AnalysisLayout';
import { Helmet } from 'react-helmet';
import { useEffect, useRef } from 'react';
import { t } from 'i18next';
import { Headers2 } from '../Header';
import { EnergyAnalisys } from '~/pages/General';
import { Comparative } from '~/pages/Analysis/Comparative';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const AnalysisEnergy = (): JSX.Element => {
  const history = useHistory();
  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;
  const allTabs = [
    {
      title: t('geral'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, tipo: 'energy' })}`,
      isActive: (queryPars.tipo === 'energy' || !queryPars.tipo),
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('comparativo'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, tipo: 'comparative' })}`,
      isActive: (queryPars.tipo === 'comparative'),
      visible: true,
      ref: useRef(null),
    },
  ];

  useEffect(() => {
    if (!queryPars.tipo) {
      history.push(`${linkBase}?tipo=energy`);
    }
  }, []);

  function returnAba() {
    if (queryPars.tipo === 'energy') {
      return t('energia');
    }
    if (queryPars.tipo === 'comparative') {
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
        queryPars.tipo === 'energy' && (
          <EnergyAnalisys />
        )
      }
      {
        queryPars.tipo === 'comparative' && (
          <Comparative />
        )
      }
    </div>
  );
};

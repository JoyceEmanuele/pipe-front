import { useEffect, useRef } from 'react';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { AnalysisLayout } from '../AnalysisLayout';
import { Headers2 } from '../Header';
import { useTranslation } from 'react-i18next';
import { withTransaction } from '@elastic/apm-rum-react';
import { IntegrsList } from 'pages/Analysis/Integrations/IntegrsList/index';
import { Utilities } from '.';

export const RedirectUtilities = (): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;

  const allTabs = [
    {
      title: t('agua'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, dispositivo: 'agua' })}`,
      isActive: (queryPars.dispositivo === 'agua' || !queryPars.dispositivo),
      visible: true,
      ref: useRef(null),
    },
    {
      title: 'Nobreaks',
      link: `${linkBase}?${queryString.stringify({ ...queryPars, dispositivo: 'nobreak' })}`,
      isActive: (queryPars.dispositivo === 'nobreak'),
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('iluminacao'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, dispositivo: 'iluminacao' })}`,
      isActive: (queryPars.dispositivo === 'iluminacao'),
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('integracoes'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, dispositivo: 'integracao' })}`,
      isActive: (queryPars.dispositivo === 'integracao'),
      visible: true,
      ref: useRef(null),
    },
  ];

  const tabs = allTabs.filter((x) => x.visible);

  useEffect(() => {
    if (!queryPars.dispositivo) {
      history.push(`${linkBase}?dispositivo=agua`);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaUtilitarios')}</title>
      </Helmet>
      <AnalysisLayout />
      <>
        <div style={{ paddingTop: '10px' }}>
          <Headers2 links={tabs} />
        </div>
        {
          queryPars.dispositivo === 'integracao' && (
            <IntegrsList />
          )
        }
        {
          (queryPars.dispositivo === 'nobreak' || queryPars.dispositivo === 'iluminacao') && (
            <Utilities />
          )
        }
        {
          queryPars.dispositivo === 'agua' && (
            <IntegrsList type="agua" />
          )
        }
      </>
    </>
  );
};

export default withTransaction('RedirectUtilities', 'component')(RedirectUtilities);

import { useEffect, useState } from 'react';

import { Helmet } from 'react-helmet';
import { useRouteMatch } from 'react-router';
import { toast } from 'react-toastify';

import { apiCall, ApiResps } from 'providers';
import {
  Loader,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import IntegrLayout, { IntegrBreadCrumbs } from '~/pages/Analysis/Integrations/IntegrLayout';

import { DriHistory } from './DriHistory';
import { WaterHistory } from './WaterHistory/WaterHistory';
import { useTranslation } from 'react-i18next';

import 'react-datepicker/dist/react-datepicker.css';
import { TimezoneWarn } from '~/components/TimezoneWarn';
import { getUserProfile } from '~/helpers/userProfile';

export default function IntegrHistory(): JSX.Element {
  const { t } = useTranslation();
  const match = useRouteMatch<{ integrType: string, integrId: string }>();
  const { integrType, integrId } = match.params;
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar(() => ({
    isLoading: true,
    devInfo: null as (null|ApiResps['/get-integration-info']),
  }));

  useEffect(() => {
    (async function () {
      try {
        setState({ isLoading: true });
        let response;
        if (integrId.startsWith('DMA')) {
          response = await apiCall('/get-integration-info', {
            supplier: 'diel-dma',
            integrId,
          });
        } else {
          response = await apiCall('/get-integration-info', {
            supplier: integrType as 'diel' | 'ness' | 'greenant' | 'coolautomation' | 'laager',
            integrId,
          });
        }
        state.devInfo = response;
      } catch (err) {
        toast.error(t('erro'));
        console.log(err);
      }
      setState({ isLoading: false });
    }());
  }, []);
  function returnHistory() {
    if (match.params.integrType === 'diel' && integrId.startsWith('DRI')) {
      return <DriHistory integrId={match.params.integrId} chillerModel={state.devInfo?.dri?.chillerModel} />;
    }
    return <div>{t('naoDisponivel')}</div>;
  }

  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaHistorico')}</title>
      </Helmet>
      <IntegrBreadCrumbs integrId={match.params.integrId} integrType={match.params.integrType} devInfo={state.devInfo && state.devInfo.info} />
      <IntegrLayout integrType={match.params.integrType} integrId={match.params.integrId} varsCfg={state.devInfo?.dri} />
      <div style={{ marginBottom: '15px' }} />
      {((match.params.integrType === 'water' || (match.params.integrType === 'diel' && integrId.startsWith('DMA'))) ? (
        <>
          <WaterHistory device_code={match.params.integrId} status={state.devInfo?.info.status} installationDate={state.devInfo?.info.installationDate} unitId={state.devInfo?.info.UNIT_ID} />
        </>
      ) : (
        <div>
          {state.isLoading && (
          <Loader />
          )}
          {(!state.isLoading) && (
          <>
            {returnHistory()}
          </>
          )}
        </div>
      ))}
    </>
  );
}

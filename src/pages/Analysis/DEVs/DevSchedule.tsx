import { useEffect } from 'react';
import { t } from 'i18next';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Loader } from '~/components';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { useStateVar } from '~/helpers/useStateVar';
import { DevLayout } from '~/pages/Analysis/DEVs/DevLayout';

import { DamSchedule } from '../DAMs/DamSchedule';
import { DutSchedule } from '../DUTs/DutSchedule';
import { withTransaction } from '@elastic/apm-rum-react';

export const DevSchedule = (): JSX.Element => {
  const routeParams = useParams<{ devId }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      devInfo: getCachedDevInfoSync(routeParams.devId),
    };
    state.isLoading = !state.devInfo;
    return state;
  });

  useEffect(() => {
    if (!state.devInfo) {
      (async function () {
        try {
          state.devInfo = await getCachedDevInfo(routeParams.devId, {});
        } catch (err) {
          console.log(err);
          toast.error(t('houveErro'));
        }
        setState({ isLoading: false });
      }());
    }
  }, []);

  return (
    (state.isLoading)
      ? (
        <>
          <Helmet>
            <title>{t('dielEnergiaProgramacao')}</title>
          </Helmet>
          <DevLayout devInfo={state.devInfo} />
          <div style={{ paddingTop: '10px', height: '30px' }} />
          <Loader />
        </>
      )
      : (state.devInfo && state.devInfo.dut_aut)
        ? <DutSchedule />
        : <DamSchedule />
  );
};

export default withTransaction('DevSchedule', 'component')(DevSchedule);

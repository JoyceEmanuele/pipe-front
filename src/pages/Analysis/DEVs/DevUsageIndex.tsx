import { useEffect } from 'react';
import i18n from '~/i18n';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Loader } from '~/components';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { useStateVar } from '~/helpers/useStateVar';
import { DevLayout } from '~/pages/Analysis/DEVs/DevLayout';
import { AssetLayout } from '~/pages/Analysis/Assets/AssetLayout';
import { useTranslation } from 'react-i18next';
import { Usage } from '../DACs/Usage';
import { DmtUsageIndex } from '../DMTs/DmtUsageIndex';
import { DalUsageIndex } from '../DALs/DalUsageIndex';
import { DutDuoUsage } from '../DUTs/DutDuoUsage';
import { Wrapper } from './styles';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const DevUsageIndex = (): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();
  const routeParams = useParams<{ devId }>();
  const [state, _render, setState] = useStateVar({
    isLoading: false,
    devInfo: getCachedDevInfoSync(routeParams.devId),
    assetLayout: false as boolean,
  });

  const { devInfo } = state;
  const isDmt = !!(devInfo?.dmt);
  const isDal = !!(devInfo?.dal);
  const isDac = !!(devInfo?.dac);
  const isDutDuo = devInfo?.dut?.PLACEMENT === 'DUO';

  async function getDeviceInfo() {
    if (state.devInfo) return;
    try {
      state.devInfo = await getCachedDevInfo(routeParams.devId, {});
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    getDeviceInfo();
  }, []);

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.devInfo?.DEV_ID, t('indiceUso'))}</title>
      </Helmet>
      <div
        style={{
          position: (isDmt || isDal) ? 'sticky' : 'unset', top: (isDmt || isDal) ? 0 : undefined, backgroundColor: 'white', zIndex: 1, width: '100%',
        }}
      >
        {!state.assetLayout ? (<DevLayout devInfo={state.devInfo} />) : (<AssetLayout devInfo={state.devInfo} />)}
      </div>
      <Wrapper>
        <div
          style={{
            overflowY: 'scroll', maxHeight: '100%', height: (isDmt || isDal) ? 'calc(100vh - 210px)' : undefined, padding: '0px 10px',
          }}
        >
          {(state.isLoading)
            && (
            <div style={{ paddingTop: '40px' }}>
              {' '}
              <Loader />
              {' '}
            </div>
            )}
          {(state.devInfo && !state.isLoading)
            && (
            <div>
              <div style={{ paddingBottom: '30px' }}>
                { isDmt
                && (
                  <DmtUsageIndex />
                )}
                { isDal
                && (
                  <DalUsageIndex />
                )}
                { isDac
                && (
                  <Usage />
                )}
                { isDutDuo
                && (
                  <DutDuoUsage />
                )}
                { (!isDmt && !isDac && !isDal && !isDutDuo)
                && (
                <>
                  (vazio)
                </>
                )}

              </div>
            </div>
            )}
        </div>
      </Wrapper>
    </>
  );
};

export default withTransaction('DevUsageIndex', 'component')(DevUsageIndex);

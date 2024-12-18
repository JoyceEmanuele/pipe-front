import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Loader, Card } from '~/components';
import { getCachedDevInfo, getCachedDevInfoSync } from '~/helpers/cachedStorage';
import { useStateVar } from '~/helpers/useStateVar';
import { DevLayout } from '~/pages/Analysis/DEVs/DevLayout';
import { AssetLayout } from '~/pages/Analysis/Assets/AssetLayout';
import { getUserProfile } from 'helpers/userProfile';
import { RealTimeContents } from '../DACs/RealTime';
import { DamRealTimeContents } from '../DAMs/DamRealTime';
import { DutAutRealTimeContents } from '../DUTs/DutAutRealTime';
import { EnvironmentRealTimeContents } from '../DUTs/EnvironmentRealTime';
import { Headers2 } from '../Header';
import { DmaRealTimeContents } from '../Integrations/IntegrRealTime/DmaRealTime';
import { DriRealTimeContents } from '../Integrations/IntegrRealTime/DriContents';
import { DmtRealTime } from '../DMTs/DmtRealTime/DmtRealTime';
import { DalRealTimeContent } from '../DALs/DalRealTime';
import { withTransaction } from '@elastic/apm-rum-react';
import { TimezoneWarn } from '~/components/TimezoneWarn';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const DevRealTime = (): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const history = useHistory();
  const routeParams = useParams<{ devId }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      devInfo: getCachedDevInfoSync(routeParams.devId),
      assetLayout: false,
    };
    state.isLoading = !state.devInfo;
    return state;
  });

  async function getDevInfo() {
    if (!state.devInfo) {
      try {
        state.devInfo = await getCachedDevInfo(routeParams.devId, {});
      } catch (err) {
        console.log(err);
        toast.error(t('houveErro'));
      }
    }
    setState({ isLoading: false });
  }

  const { devInfo } = state;
  const {
    isDam,
    isDutAut,
    isDri,
    isAutomationOnly,
    isDma,
    isDmt,
    isDal,
  } = setDevice();

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;

  state.assetLayout = linkBase.includes('/ativo');
  const allTabs = [
    {
      title: t('equipamento'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'equipamento' })}`,
      isActive: (queryPars.aba === 'equipamento') || (!queryPars.aba),
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('automacao'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'automacao' })}`,
      isActive: (queryPars.aba === 'automacao'),
      visible: (!isAutomationOnly) && (isDam) && !profile.permissions.isInstaller,
      ref: useRef(null),
    },
  ];
  const tabs = allTabs.filter((x) => x.visible);

  useEffect(() => {
    getDevInfo();
  }, []);

  function setDevice() {
    const { devInfo } = state;
    const isDac = !!(devInfo && devInfo.dac);
    let isDam = !!(devInfo && devInfo.dam);
    const isDut = !!(devInfo && devInfo.dut);
    const isDmt = !!(devInfo && devInfo.dmt);
    let isDutAut = !!(devInfo && devInfo.dut_aut);
    const isDri = !!(devInfo && devInfo.dri);
    const isDal = !!(devInfo?.dal);
    // @ts-ignore
    if (isDam && devInfo.dac && devInfo.dam.DAM_DISABLED === 1) isDam = false;
    // @ts-ignore
    if (isDutAut && devInfo.dut_aut.DUTAUT_DISABLED === 1) isDutAut = false;
    const isAutomationOnly = isDam && (!isDac) && (!isDut);
    const isDma = !!(devInfo && devInfo.dma);
    return {
      isDac,
      isDam,
      isDut,
      isDutAut,
      isDri,
      isAutomationOnly,
      isDma,
      isDmt,
      isDal,
    };
  }

  function setScreenDevice(devInfo?) {
    if (allTabs[1].isActive && isDutAut) {
      return <DutAutRealTimeContents devInfo={devInfo} />;
    }
    if (isAutomationOnly || (allTabs[1].isActive && state.devInfo.dam)) {
      return <DamRealTimeContents />;
    }
    if (isDri) {
      return <DriRealTimeContents devId={routeParams.devId} />;
    }
    if (allTabs[0].isActive && state.devInfo.dac) {
      return <RealTimeContents />;
    }
    if (allTabs[0].isActive && state.devInfo.dut) {
      return <EnvironmentRealTimeContents />;
    }
    if (isDmt) {
      return <DmtRealTime dmtId={routeParams.devId} />;
    }
    if (isDal) {
      return <DalRealTimeContent dalInfo={state.devInfo} />;
    }
    return t('vazio');
  }

  const dutSelected = () => state.devInfo?.dut?.PLACEMENT === 'DUO';

  function buildScreenInfoParams(): Parameters<(typeof AssetLayout)>[0]['screenInfo'] {
    return {
      forceHideHealthTab: false,
      groupSelected: true,
      hasNonDutDeviceInAssets: false,
      dutAutomationInfo: {},
      isDuoSelected: dutSelected(),
      assetRoleSelected: 0,
    };
  }

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.devInfo?.DEV_ID, t('tempoRealMaiusculo'))}</title>
      </Helmet>
      {!state.assetLayout ? (<DevLayout devInfo={state.devInfo} />) : (<AssetLayout devInfo={state.devInfo} screenInfo={buildScreenInfoParams()} />)}
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
        <div style={{ paddingTop: '30px' }}>
          {isDma ? <DmaRealTimeContents dmaId={routeParams.devId} /> : (
            <Card>
              {(tabs.length > 1)
                ? (
                  <div style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                    <Headers2 links={tabs} />
                  </div>
                ) : <> </>}
              <div style={{ paddingBottom: '30px' }}>
                {setScreenDevice(devInfo)}
              </div>
            </Card>
          )}
        </div>
        )}
    </>
  );
};

export default withTransaction('DevRealTime', 'component')(DevRealTime);

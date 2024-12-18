import { useEffect, useRef, useState } from 'react';
import i18n from '~/i18n';
import moment from 'moment';
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
import { DACHistoricContents } from '../DACs/DACHistoric';
import { DamHistoryContents } from '../DAMs/DamHistory';
import { DUTHistoryContents } from '../DUTs/DUTHistory';
import { DriHistory } from '../Integrations/IntegrHistory/DriHistory';
import { Headers2 } from '../Header';
import { useTranslation } from 'react-i18next';
import { withTransaction } from '@elastic/apm-rum-react';
import { TimezoneWarn } from '~/components/TimezoneWarn';
import { generateNameFormatted } from '~/helpers/titleHelper';
import { WaterHistory } from '../Integrations/IntegrHistory/WaterHistory/WaterHistory';

function localeTranslate() {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
}

export const DevHistory = (): JSX.Element => {
  localeTranslate();
  const [profile] = useState(getUserProfile);
  const { t } = useTranslation();
  const history = useHistory();
  const routeParams = useParams<{ devId }>();
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      devInfo: getCachedDevInfoSync(routeParams.devId),
      assetLayout: false as boolean,
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
  const isDac = !!(devInfo && devInfo.dac);
  let isDam = !!(devInfo && devInfo.dam);
  const isDut = !!(devInfo && devInfo.dut);
  let isDutAut = !!(devInfo && devInfo.dut_aut);
  const isDri = !!(devInfo && devInfo.dri);
  const isDma = !!(devInfo && devInfo.dma);
  // @ts-ignore
  if (isDam && devInfo.dac && devInfo.dam.DAM_DISABLED === 1) isDam = false;
  // @ts-ignore
  if (isDutAut && (devInfo.dut_aut.DUTAUT_DISABLED === 1)) isDutAut = false;
  const isAutomationOnly = isDam && (!isDac) && (!isDut);

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;
  state.assetLayout = linkBase.includes('/ativo');

  function visibilityAutomation() {
    if ((!isAutomationOnly) && (isDam || isDutAut) && !profile.permissions.isInstaller) {
      return true;
    }
    return false;
  }

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
      visible: visibilityAutomation(),
      ref: useRef(null),
    },
  ];
  const tabs = allTabs.filter((x) => x.visible);

  useEffect(() => {
    getDevInfo();
  }, []);

  function getScreen() {
    if (allTabs[1].isActive && isDutAut) {
      return <DamHistoryContents />;
    }
    if (isAutomationOnly || (allTabs[1].isActive && state.devInfo.dam)) {
      return <DamHistoryContents />;
    }
    if (isDri) {
      return <DriHistory integrId={routeParams.devId} />;
    }
    if (isDma) {
      return <WaterHistory device_code={state.devInfo.dma.DMA_ID} status={state.devInfo.status} installationDate={state.devInfo.dma.INSTALLATION_DATE} unitId={state.devInfo?.info?.UNIT_ID} />;
    }
    if (allTabs[0].isActive && state.devInfo.dut) {
      return <DUTHistoryContents />;
    }
    return '(vazio)';
  }

  function getNewScreens() {
    // adicionar dispositivos conforme telas forem refatoradas
    if (allTabs[0].isActive && state.devInfo.dac) {
      return <DACHistoricContents />;
    }
  }

  function isNewScreen() {
    if (allTabs[0].isActive && state.devInfo.dac) {
      return true;
    }

    return false;
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
        <title>{generateNameFormatted(state.devInfo?.DEV_ID, t('historico'))}</title>
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
          {getNewScreens()}
          { !isNewScreen() && (
            <Card>
              {(tabs.length > 1) && state.devInfo.dut?.operation_mode !== 5
                ? (
                  <div style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                    <Headers2 links={tabs} />
                  </div>
                ) : <> </>}
              <div style={{ paddingBottom: '30px' }}>
                {getScreen()}
              </div>
            </Card>
          )}
        </div>
        )}
    </>
  );
};

export default withTransaction('DevHistory', 'component')(DevHistory);

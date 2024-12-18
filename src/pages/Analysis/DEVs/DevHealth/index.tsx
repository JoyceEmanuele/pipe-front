import {
  useEffect,
  useRef,
  useState,
} from 'react';
import { t } from 'i18next';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Loader } from 'components';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';

import { Headers2 } from '../../Header';
import { getCachedDevInfo, DevInfo } from '~/helpers/cachedStorage';
import { AssetLayout } from '../../Assets/AssetLayout';
import { Health } from './Health';
import { ManagementFaults } from './ManagementFaults';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const DevHealth = (): JSX.Element => {
  const { devId } = useParams<{ devId: string }>();
  const history = useHistory();
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar({
    devInfo: {} as DevInfo,
    isLoading: false,
    assetLayout: false as boolean,
  });

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;

  const allTabs = [
    {
      title: t('geral'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'geral' })}`,
      isActive: (queryPars.aba === 'geral') || (!queryPars.aba),
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('gerenciamentoDeFalhas'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'gerenciamento-falhas' })}`,
      isActive: (queryPars.aba === 'gerenciamento-falhas'),
      visible: !!profile.manageAllClients,
      ref: useRef(null),
    },
  ];

  async function getDevInfo() {
    setState({ isLoading: true });
    try {
      state.devInfo = await getCachedDevInfo(devId, {});
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    getDevInfo();
  }, []);

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.devInfo?.DEV_ID, t('saude'))}</title>
      </Helmet>
      <AssetLayout
        devInfo={state.devInfo}
        screenInfo={{
          dutAutomationInfo: {
            dutId: (devId.substring(0, 3) === 'DUT') ? devId : undefined,
            placement: state.devInfo?.dut?.PLACEMENT,
          },
          hasNonDutDeviceInAssets: !devId?.startsWith('DUT'),
          groupSelected: false,
          /* asset role 1 é evaporadora selecionada */
          assetRoleSelected: (state.devInfo?.dut?.PLACEMENT === 'DUO') ? 1 : 0,
          isDuoSelected: state.devInfo?.dut?.PLACEMENT === 'DUO',
        }}
      />
      <br />
      {(allTabs.length > 1) && (
        <div style={{ width: 'fit-content' }}>
          <Headers2 links={allTabs} />
        </div>
      )}
      <br />
      {(state.isLoading) && (
        <Loader />
      )}
      {(!state.isLoading && allTabs[0].isActive && state.devInfo) && (
        <Health />
      )}
      {(!state.isLoading && allTabs[1].isActive && state.devInfo) && (
        <ManagementFaults devId={devId} unitId={state.devInfo.UNIT_ID} assetId={state.devInfo.ASSET_ID} />
      )}
    </>
  );
};

export default withTransaction('DevHealth', 'component')(DevHealth);

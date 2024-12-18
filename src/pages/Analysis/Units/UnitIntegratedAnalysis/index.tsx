import { useEffect, useState } from 'react';
import { t } from 'i18next';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import { Loader } from '~/components';
import { EnvGroupAnalysis } from '~/components/EnvGroupAnalysis';
import { useStateVar } from '~/helpers/useStateVar';
import { TUnitInfo, UnitLayout } from '~/pages/Analysis/Units/UnitLayout';
import { apiCall, ApiResps } from '~/providers';
import { getUserProfile } from '../../../../helpers/userProfile';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

interface DacItem {
  DAC_ID: string;
  DRI_ID?: string;
  GROUP_ID: number;
  GROUP_NAME: string;
  UNIT_ID: number;
  MEAN_USE?: string;
  usageHistory?: {
      DAY_HOURS_ON: number;
      DAT_REPORT: string;
  }[];
}
interface DutItem {
  UNIT_ID: number
  ROOM_NAME: string
  VARS?: string
  Temperature?: number|string
  Humidty?: number
  eCO2?: number|string
  PLACEMENT?: string
  isVav?: boolean
}

interface UtilItem {
  ID: number
  TYPE: string
  NAME: string
  PORT: number
  FEEDBACK: number
  DMT_CODE: string
  DAL_CODE: string
}

export const UnitIntegratedAnalysis = (): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const routeParams = useParams<{ unitId: string }>();
  const [state, render] = useStateVar({
    unitId: Number(routeParams.unitId),
    isMounted: true,
    isLoading: true,
    groups: [],
    duts: [],
    utilities: [] as UtilItem[],
    weatherStations: [] as {
      CD_ESTACAO: string
      DC_NOME: string
      DISTANCIA_EM_KM?: string
    }[],
    isScheduleModalOpen: true,
    switchProgOn: false,
    unitInfo: null as null | TUnitInfo,
    energyList: [] as (ApiResps['/energy/get-energy-list']['list']),
  });

  useEffect(() => {
    state.isLoading = true; render();
    handleGetUnitInfo().catch(console.log)
      .then(() => {
        state.isLoading = false; render();
      });
    return () => { state.isMounted = false; };
  }, []);

  function buildDacsItems(filteredByGroupName: {}, dacsList: DacItem[]) {
    for (const dac of dacsList) {
      if (dac.UNIT_ID !== state.unitId) continue;
      if (!dac.GROUP_NAME) continue;
      const groupName = dac.GROUP_NAME;
      const groupId = dac.GROUP_ID;
      if (!filteredByGroupName[groupId]) {
        filteredByGroupName[groupId] = {
          name: groupName, groupId, dacs: [], dris: [],
        };
      }
      const group = filteredByGroupName[groupId];
      group.dacs.push(dac);
    }
  }

  function buildDutsItems(dutsList: DutItem[]) {
    state.duts = []; render();
    for (const dut of dutsList) {
      if (dut.UNIT_ID !== state.unitId) continue;
      if (!dut.ROOM_NAME) continue;
      if (dut.Temperature == null) dut.Temperature = '-';
      if (dut.eCO2 == null) dut.eCO2 = '-';
      // if (dut.Humidity == null) dut.Humidity = '-'
      // @ts-ignore
      state.duts.push(dut);
    }
  }

  function buildVAVsItems(vavsList, groupsList, filteredByGroupName) {
    for (const vav of vavsList) {
      if (vav.UNIT_ID !== state.unitId) continue;
      if (vav.ROOM_NAME) {
        const vavEnv = {
          DEV_ID: vav.DEV_ID,
          UNIT_ID: vav.UNIT_ID,
          ROOM_NAME: vav.ROOM_NAME,
          VARS: 'T',
          Temperature: vav.Temperature,
          isVav: true,
        } as DutItem;
        // @ts-ignore
        state.duts.push(vavEnv);
      }
      const vavGroup = groupsList.find((group) => group.DEV_AUT === vav.DEV_ID);
      if (vavGroup) {
        if (!filteredByGroupName[vavGroup.GROUP_ID]) {
          filteredByGroupName[vavGroup.GROUP_ID] = {
            name: vavGroup.GROUP_NAME, groupId: vavGroup.GROUP_ID, dacs: [], dris: [],
          };
        }
        const vavGroupInfo = {
          DRI_ID: vav.DEV_ID,
          GROUP_ID: vavGroup.GROUP_ID,
          GROUP_NAME: vavGroup.GROUP_NAME,
          UNIT_ID: vav.UNIT_ID,
        } as DacItem;
        const group = filteredByGroupName[vavGroup.GROUP_ID];
        group.dris.push(vavGroupInfo);
      }
    }
  }

  function validateAndAddUtilItem(utility) {
    if (utility.UNIT_ID !== state.unitId) return false;
    if (utility.APPLICATION === 'Nobreak') {
      if (!utility.DMT_CODE || !utility.PORT || !utility.PORT_ELETRIC) return false;
      state.utilities.push({ ...utility, TYPE: 'nobreak' });
    }
    if (utility.APPLICATION === 'Iluminação') {
      if (!(utility.DAL_CODE && utility.FEEDBACK) && !(utility.DMT_CODE && utility.PORT)) return false;
      state.utilities.push({ ...utility, TYPE: 'illumination' });
    }
    return true;
  }

  function buildUtilitiesItems(utilitiesList) {
    state.utilities = []; render();
    for (const utility of utilitiesList) {
      const isValid = validateAndAddUtilItem(utility);
      if (!isValid) continue;
    }
  }

  async function handleGetUnitInfo() {
    try {
      const [_dacsList, _dutsList, unitInfo, weatherStations, _vavsList, _groupsList, nobreaksList, illuminationList] = await Promise.all([
        apiCall('/dac/get-dacs-list', { includeHealthDesc: true, unitId: state.unitId }).then((r) => r.list),
        apiCall('/dut/get-duts-list', { unitId: state.unitId }).then((r) => r.list),
        apiCall('/clients/get-unit-info', { unitId: state.unitId }),
        apiCall('/get-weather-stations-near-unit', { unitId: state.unitId }),
        apiCall('/dri/get-dri-vavs-list', { unitId: state.unitId }).then((r) => r.list),
        apiCall('/clients/get-groups-list', { unitIds: [state.unitId] }),
        apiCall('/dmt/get-dmt-nobreak-list-unit', { UNIT_ID: state.unitId }),
        apiCall('/dal/get-dal-illumination-list', { unitIds: [state.unitId] }),
        apiCall('/energy/get-energy-list', { unitIds: [state.unitId], filterByNull: true }).then(({ list }) => state.energyList = list),
      ]);
      // @ts-ignore
      state.unitInfo = unitInfo;
      state.weatherStations = weatherStations.list;

      const dacsList: DacItem[] = _dacsList;
      const dutsList: DutItem[] = profile.permissions.isAdminSistema ? _dutsList : _dutsList.filter((item) => item.ISVISIBLE === 1);
      const vavsList = profile.permissions.isAdminSistema ? _vavsList : _vavsList.filter((item) => item.ISVISIBLE === 1);
      const groupsList = _groupsList;
      const utilitiesList = [...nobreaksList, ...illuminationList];

      Promise.resolve().then(async () => {
        for (const dac of dacsList) {
          const { MEAN_USE, usageHistory } = await apiCall('/dac/get-dac-usage', { DAC_ID: dac.DAC_ID }).then((r) => r.info);
          if (!state.isMounted) return;
          dac.MEAN_USE = MEAN_USE;
          dac.usageHistory = usageHistory;
          render();
        }
      }).catch(console.log);

      const filteredByGroupName = {};
      buildDacsItems(filteredByGroupName, dacsList);
      buildDutsItems(dutsList);
      buildVAVsItems(vavsList, groupsList, filteredByGroupName);
      buildUtilitiesItems(utilitiesList);

      state.groups = Object.values(filteredByGroupName); render();
    } catch (err) {
      console.log(err);
      toast.error(t('erroInformacaoUnidade'));
    }
  }

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.unitInfo?.UNIT_NAME, t('analiseIntegrada'))}</title>
      </Helmet>
      <UnitLayout unitInfo={state.unitInfo} />
      <br />
      <Flex>
        <Box width="100%">
          {state.isLoading
            ? (
              <Flex alignItems="center" justifyContent="center">
                <Box width={1} alignItems="center" justifyContent="center">
                  <Loader />
                </Box>
              </Flex>
            )
            : (
              <>
                <EnvGroupAnalysis
                  ambientes={state.duts}
                  conjuntos={state.groups}
                  utilitarios={state.utilities}
                  unitId={state.unitId}
                  weatherStations={state.weatherStations}
                    // @ts-ignore
                  unitName={state.unitInfo && state.unitInfo.UNIT_NAME}
                    // @ts-ignore
                  includePower={state.unitInfo && state.unitInfo.hasEnergyInfo}
                  // @ts-ignore
                  includeDme={state.energyList}
                  // @ts-ignore
                  unitCoordinate={state.unitInfo && { lat: state.unitInfo.LAT, lon: state.unitInfo.LON }}
                />
              </>
            )}
        </Box>
      </Flex>
    </>
  );
};

export default withTransaction('UnitIntegratedAnalysis', 'component')(UnitIntegratedAnalysis);

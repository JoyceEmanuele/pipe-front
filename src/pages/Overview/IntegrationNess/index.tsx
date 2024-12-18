import { useEffect } from 'react';

import moment from 'moment';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { Flex, Box } from 'reflexbox';

import {
  MachineCard,
  EnvCard,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall2 } from '~/providers';

import {
  PageTitle,
} from './styles';

import { withTransaction } from '@elastic/apm-rum-react';

const KW_TO_TR = 0.28434517;
const specialClients = [1, 10]; // TODO: remove hard coded IDs, get special client IDs using API.

export const IntegrationNess = (): JSX.Element => {
  const history = useHistory();
  const [state, render, setState] = useStateVar(() => {
    const queryPars = queryString.parse(history.location.search);
    const state = {
      unitName: null as null|string,
      dacList: [] as {
        state: string
        city: string
        unitId: number
        unit: string
        id: string
        health: number
        healthHistory: string
      }[],
      machinesHealthNow: {
        green: 0, yellow: 0, orange: 0, red: 0, deactiv: 0, others: 0,
      },
      machinesHealthBefore: {
        green: 0, yellow: 0, orange: 0, red: 0, deactiv: 0, others: 0,
      },
      machinesTRs: 0,
      dutList: [] as {
        CLIENT_ID: number
        UNIT_ID: number
        UNIT_NAME: string
        DEV_ID: string
        ROOM_NAME: string
        ISVISIBLE: number
        Temperature?: number
        temprtAlert?: 'low'|'high'|'good'|null
        TUSEMIN?: number
        TUSEMAX?: number
      }[],
      dutsCount: 0,
      dutsTempOk: 0,
      dutsTempHigh: 0,
      dutsTempLow: 0,
      dutsNoTempData: 0,

      isLoading: false,

      unitId: (queryPars.unit as string) || null,
      apiAuth: (queryPars.token && `SUTK ${queryPars.token}`) || null,
      errorMessage: '',
    };
    if (!queryPars.token) state.errorMessage = 'Não foi possível carregar os dados (E46)';
    else if (!state.unitId) state.errorMessage = 'Não foi possível carregar os dados (E45)';
    return state;
  });

  async function loadData() {
    if ((!state.apiAuth) || (!state.unitId)) {
      if (!state.errorMessage) {
        state.errorMessage = 'Não foi possível carregar os dados (E27)';
      }
      return;
    }

    state.machinesHealthNow = {
      green: 0, yellow: 0, orange: 0, red: 0, deactiv: 0, others: 0,
    };
    state.machinesHealthBefore = {
      green: 0, yellow: 0, orange: 0, red: 0, deactiv: 0, others: 0,
    };
    state.dutsCount = 0;
    state.dutsTempOk = 0;
    state.dutsTempHigh = 0;
    state.dutsTempLow = 0;
    state.dutsNoTempData = 0;
    state.machinesTRs = 0;

    state.isLoading = true;
    render();

    try {
      const {
        unitName,
        dutsList,
        dacsList,
        machinesHealthNow,
        machinesHealthBefore,
      } = await apiCall2('/ness-get-overview-data/json', {
        unitId: state.unitId,
      }, state.apiAuth);

      state.unitName = unitName;
      state.machinesHealthNow = machinesHealthNow;
      state.machinesHealthBefore = machinesHealthBefore;
      state.dacList = dacsList
        .filter((dac) => (dac.CLIENT_ID && !specialClients.includes(dac.CLIENT_ID)))
        .map((dac) => {
          state.machinesTRs += ((dac.capacityKW || 0) * KW_TO_TR);

          let healthHistory = '-';
          let healthHistoryDuration = 0;

          if (dac.H_DATE) {
            const duration = moment.duration(moment().diff(moment(dac.H_DATE)));

            healthHistoryDuration = duration.asSeconds();

            if (duration.asMinutes() < 60) healthHistory = `Há ${Math.round(duration.asMinutes())} min.`;
            else if (duration.asHours() < 24) healthHistory = `Há ${Math.round(duration.asHours())} ${Math.round(duration.asHours()) === 1 ? 'hr' : 'hrs'}`;
            else if (duration.asDays() < 7) healthHistory = `Há ${Math.round(duration.asDays())} ${Math.round(duration.asDays()) === 1 ? 'dia' : 'dias'}`;
            else if (duration.asWeeks() < 4) healthHistory = `Há ${Math.round(duration.asWeeks())} sem.`;
            else healthHistory = `Há ${Math.round(duration.asMonths())} ${Math.round(duration.asMonths()) === 1 ? 'mês' : 'meses'}`;
          }

          return {
            id: dac.DAC_ID,
            name: dac.DAC_NAME,
            health: dac.H_INDEX,
            city: dac.CITY_NAME,
            state: dac.STATE_ID,
            unit: dac.UNIT_NAME,
            unitId: dac.UNIT_ID,
            healthHistory,
            healthHistoryDuration,
          };
        });

      dutsList.forEach((dut) => {
        if (dut.CLIENT_ID && !specialClients.includes(dut.CLIENT_ID)) {
          state.dutsCount++;

          if (dut.temprtAlert === 'high') state.dutsTempHigh++;
          else if (dut.temprtAlert === 'low') state.dutsTempLow++;
          else if (dut.temprtAlert === 'good') state.dutsTempOk++;
          else state.dutsNoTempData++;
        }
      });
      state.dutList = dutsList;

      state.errorMessage = '';
    } catch (err) {
      console.log(err);
      state.errorMessage = 'Houve erro ao buscar as informações';
    }
    state.isLoading = false;
    render();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Diel Energia - Visão geral</title>
      </Helmet>

      <Flex flexWrap="wrap" alignItems="center" width={1} mt={30}>
        <Box
          width={[1, 1, 1, 1, 25 / 51, 25 / 51]}
          mb={40}
        // ml={20}
        // mr={20}
        // style={{ maxWidth: 490 }}
        >
          <PageTitle>{state.unitName || 'Visão Geral'}</PageTitle>
        </Box>
      </Flex>

      {state.errorMessage && (
        <h3 style={{ padding: '0 0 20px 30px', color: 'red' }}>{state.errorMessage}</h3>
      )}

      <Flex flexWrap="wrap" justifyContent="space-around" alignItems="flex-start" width={1}>
        (temporariamente desativado)
      </Flex>
    </>
  );
};

export default withTransaction('IntegrationNess', 'component')(IntegrationNess);

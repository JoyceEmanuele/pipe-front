import { Flex, Box } from 'reflexbox';
import { ICard, useCard } from '../../contexts/CardContext';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card';
import { useStateVar } from '~/helpers/useStateVar';
import { OverLay, TopTitle } from '../MachineCard/styles';
import { CardManager } from '../CardManager';
import {
  useEffect, useState,
} from 'react';
import { toast } from 'react-toastify';
import { ApiParams, ApiResps, apiCall } from '~/providers';
import { BtnList } from '../EnergyEfficiencyCard/styles';
import { Loader } from '../Loader';
import i18n from '../../i18n';
import { getUserProfile } from '~/helpers/userProfile';
import { GenerateGraphWater } from './GraphCardWater';
import moment from 'moment';
import { CalendarWater } from './CalendarWaterCard';
import { CardWaterTable } from './CardWaterTable';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { TabOptionCard } from '../ItemCardTabOption/TabOption';

type FilterColumnsType = {
  cities: {
    list: {
      name: string,
      value: string | number,
    }[]
  }
  states: {
    list: {
      name: string,
      value: string | number,
    }[]
  }
  units: {
    list: {
      name: string,
      value: string | number,
    }[]
  }
}

const t = i18n.t.bind(i18n);

export function WaterCard(props: Readonly<{
  manageAllClients: boolean|undefined
  selectedFilter?: {
    unitIds?: string[],
    stateIds?: string[],
    cityIds?: string[],
  }
  paramsForLoadData: null|{
    selectedUnit: number[]
    selectedCity: string[]
    selectedState: number[]
    selectedTimeRange: string
    selectedClient: number[]
    date: moment.Moment
    endDate: moment.Moment
    monthDate: Date
    startDate: moment.Moment
  };
  saveOverviewFilters?: () => void,
}>) {
  const { t } = useTranslation();
  const { cards } = useCard();
  const [profile] = useState(getUserProfile);
  const waterCard = cards.find((card) => card.title === 'Agua');
  const [filterDataTable, setFilterDataTable] = useState<ApiResps['/dma/get-month-usage']['info']>([]);
  const [state, render, setState] = useStateVar(() => ({
    filter: 'Padrao',
    showList: false,
    showAsHistory: true,
    showEnergyEfficiencyInvoices: false,
    columnSort: {
      state_name: {
        column: 'state_name',
        desc: false,
      },
      city_name: {
        column: 'city_name',
        desc: false,
      },
      client_name: {
        column: 'client_name',
        desc: false,
      },
      unit_name: {
        column: 'unit_name',
        desc: false,
      },
      period_usage: {
        column: 'period_usage',
        desc: false,
      },
      usage_people: {
        column: 'usage_people',
        desc: false,
      },
      usage_area: {
        column: 'usage_area',
        desc: false,
      },
    },
    currentSort: {
      field: '',
      type: '',
    },
    filterColumns: {
      cities: { list: [] },
      states: { list: [] },
      units: { list: [] },
      clients: { list: [] },
    } as FilterColumnsType,
    historyData: [] as ApiResps['/dma/get-month-usage']['history'],
    infoTableData: [] as ApiResps['/dma/get-month-usage']['info'],
    waterPag: {
      tablePage: 1,
      tablePageSize: 6,
      totalItems: 0,
    },
    isLoading: false,
    selectedFilters: {
      states: {
        label: t('estado'),
        values: [],
      },
      cities: {
        label: t('cidade'),
        values: [],
      },
      units: {
        label: t('unidade'),
        values: [],
      },
      clients: {
        label: t('cliente'),
        values: [],
      },
    } as {
      [key: string]: {
        label: string;
        values: { value: string | number; name: string; }[]
      }
    },
    unitMeasure: 'cubic',
    period: 'year' as 'year' | 'month' | 'day',
    startDate: moment(props.paramsForLoadData?.date).subtract(1, 'y').set('date', 1),
    endDate: moment(props.paramsForLoadData?.date),
    currentYear: moment().year(),
    selected: moment().year(),
  }));
  function transformAndRemoveDuplicates(array, acessor, acessor2) {
    const unique: Set<string> = new Set();
    const transformedArray: {
      value: string | number;
      name: string;
    }[] = [];

    array.forEach((item) => {
      if (!unique.has(item[acessor])) {
        unique.add(item[acessor]);
        transformedArray.push({ value: item[acessor], name: item[acessor2] });
      }
    });
    return transformedArray;
  }

  function setParams(firstSearch, useFilters) {
    let params = {
      state_ids: undefined as string[] | undefined,
      city_ids: undefined as string[] | undefined,
      unit_ids: undefined as number[] | undefined,
      startDate: state.startDate.format('YYYY/MM/DD'),
      endDate: state.endDate.format('YYYY/MM/DD'),
    } as ApiParams['/dma/get-month-usage'];
    params = setParamsProps(params, firstSearch, useFilters);
    if (state.selectedFilters.states.values.length > 0) {
      params.state_ids = [...params.state_ids || [], ...state.selectedFilters.states.values.map((item) => item.value?.toString())];
    }
    if (state.selectedFilters.cities.values.length > 0) {
      params.city_ids = [...params.city_ids || [], ...state.selectedFilters.cities.values.map((item) => item.value?.toString())];
    }
    if (state.selectedFilters.units.values.length > 0) {
      params.unit_ids = [...params.unit_ids?.map((item) => Number(item)) || [], ...state.selectedFilters.units.values.map((item) => Number(item.value))];
    }
    if (state.selectedFilters.clients.values.length > 0) {
      params.client_ids = [...params.client_ids?.map((item) => Number(item)) || [], ...state.selectedFilters.clients.values.map((item) => Number(item.value))];
    }
    return params;
  }

  function setParamsProps(params, firstSearch, useFilters) {
    let paramsNew = params;
    if (firstSearch || useFilters) {
      paramsNew = {
        ...params,
        city_ids: (props.paramsForLoadData && props.paramsForLoadData.selectedCity?.length > 0) ? props.paramsForLoadData.selectedCity : undefined,
        state_ids: (props.paramsForLoadData && props.paramsForLoadData?.selectedState?.length > 0) ? props.paramsForLoadData.selectedState.map((item) => item?.toString()) : undefined,
        unit_ids: (props.paramsForLoadData && props.paramsForLoadData?.selectedUnit?.length > 0) ? props.paramsForLoadData?.selectedUnit : undefined,
        client_ids: (props.paramsForLoadData && props.paramsForLoadData?.selectedClient?.length) ? props.paramsForLoadData?.selectedClient : undefined,
      };
    }
    return paramsNew;
  }

  async function handleGetDevInfo(firstSearch?: boolean, useFilters?: boolean) {
    try {
      setState({ isLoading: true });
      const params = setParams(firstSearch, useFilters);
      const response = await apiCall('/dma/get-month-usage', params);
      setState({ infoTableData: response.info });
      setState({ waterPag: { ...state.waterPag, tablePage: 1 } });
      setState({ historyData: response.history });
      if (firstSearch) {
        setState({
          filterColumns: {
            cities: { list: transformAndRemoveDuplicates(response.info, 'city_id', 'city_name') },
            states: { list: transformAndRemoveDuplicates(response.info, 'state_id', 'state_name') },
            units: { list: response.info.map((item) => ({ name: item.unit_name, value: item.unit_id })) },
            clients: { list: transformAndRemoveDuplicates(response.info, 'client_id', 'client_name') },
          },
        });
      }
      setFilterDataTable(response.info);
      setState({ isLoading: false, unitMeasure: JSON.parse(profile?.prefs || '')?.water });
    } catch (err) {
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    setState({
      filterColumns: {
        cities: { list: [] },
        states: { list: [] },
        units: { list: [] },
        clients: { list: [] },
      },
    });
    setState({
      selectedFilters: {
        states: {
          label: t('estado'),
          values: [],
        },
        cities: {
          label: t('cidade'),
          values: [],
        },
        units: {
          label: t('unidade'),
          values: [],
        },
        clients: {
          label: t('cliente'),
          values: [],
        },
      },
    });
    handleGetDevInfo(true, true);
  }, [props.paramsForLoadData?.selectedCity, props.paramsForLoadData?.selectedState, props.paramsForLoadData?.selectedUnit, props.paramsForLoadData?.selectedClient, state.endDate, state.startDate]);

  function setDateCalendar(date: string) {
    if (state.period === 'year') {
      if (state.currentYear === Number(date)) {
        const now = moment();
        setState({ endDate: now });
        setState({ startDate: moment(`${now.year() - 1}/${now.month() + 1}/1`) });
      } else {
        const days = moment(`${Number(date) + 1}/1/1`).daysInMonth();
        setState({ startDate: moment(`${date}/1/1`) });
        setState({ endDate: moment(`${Number(date) + 1}/1/${days}`) });
      }
      state.selected = Number(date);
    }
  }

  const getUnitConsumptionWater = (consumption: number, isTable?: boolean) => {
    if (consumption) {
      if (!state.unitMeasure || state.unitMeasure === 'cubic') { return `${formatNumberWithFractionDigits((consumption / 1000).toFixed(2), { minimum: 0, maximum: 2 })}`; }
      if (state.unitMeasure === 'liters') { return `${formatNumberWithFractionDigits(consumption, { minimum: 0, maximum: 2 })}`; }
    }
    return isTable ? consumption : 0;
  };

  return (
    <Box width={waterCard?.isExpanded ? 1 : [1, 1, 1, 1, 25 / 51, 25 / 51]} mb={40} style={waterCard?.isExpanded ? { height: 'auto' } : { minHeight: 570 }}>
      <Card
        noPaddingRelative
        wrapperStyle={
        {
          minHeight: waterCard?.isExpanded ? 'auto' : 570,
          height: state.showList ? '900px' : 'auto',
        }
      }
      >
        <div style={{ padding: '10px 30px' }}>
          <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center">
            <TopTitle>{t('agua')}</TopTitle>
            <Flex alignItems="center" style={{ gap: 20 }}>
              <CalendarWater
                period={state.period}
                startDate={state.startDate}
                endDate={state.endDate}
                setDateCalendar={setDateCalendar}
                selectedYear={state.selected}
              />
              <CardManager card={waterCard as ICard} />
            </Flex>
          </Flex>
        </div>
        {state.isLoading ? (
          <OverLay>
            <Loader variant="primary" size="large" />
          </OverLay>
        ) : <></>}
        <TabOptionCard
          selected="historico"
          arrayItems={[{
            label: state.showAsHistory ? 'historico' : '',
            name: t('historico'),
            onClickFunc: () => {
              state.showAsHistory
                && setState({ showAsHistory: !state.showAsHistory });
            },
          }]}
        />
        <GenerateGraphWater arrayData={state.historyData} t={t} waterCard={waterCard} isExpanded={waterCard?.isExpanded} unitMeasuere={state.unitMeasure} getConsumptionWater={getUnitConsumptionWater} isHistory={false} />
        <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '12px' }}>
          <Flex flexWrap="wrap" flexDirection="row-reverse" justifyContent="space-between" alignItems="flex-end" width={1} pl={15}>
            <Box>
              <BtnList onClick={() => {
                state.showList = !state.showList;
                render();
              }}
              >
                {t('verLista')}
              </BtnList>
            </Box>
          </Flex>
        </div>
        { state.showList ? (
          <CardWaterTable handleGetDevInfo={handleGetDevInfo} infoTableData={state.infoTableData} filterDataTable={filterDataTable} state={state} setState={setState} render={render} getUnitConsumptionWater={getUnitConsumptionWater} />
        ) : (
          <></>
        )}
      </Card>
    </Box>
  );
}

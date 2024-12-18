import { useEffect, useRef } from 'react';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import {
  Button,
  Loader,
  Input,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';
import { AnalysisFilters, FilterItem } from '~/pages/Analysis/AnalysisFilters';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

export function MachineConsumption(): JSX.Element {
  const machinesCsvLinkEl = useRef();
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    CSVheader: [{
      label: t('cliente'),
      key: 'clientName',
    },
    {
      label: t('unidade'),
      key: 'unitName',
    },
    {
      label: t('maquinas'),
      key: 'name',
    },
    {
      label: 'DAC',
      key: 'id',
    },
    {
      label: 'TR',
      key: 'pot',
    },
    {
      label: t('data'),
      key: 'data',
    },
    {
      label: t('consumoKwh'),
      key: 'consumo',
    },
    {
      label: `${t('tempoDeUso')} - 0,0h/${t('dia')}`,
      key: 'usage',
    },
    ] as {}[],
    groupedMachines: [] as {
      clientName: string,
      unitName: string,
      id: number,
      name: string,
      dacs: {
        id: string,
        name: string,
        groupId: number,
        groupName: string,
        pot: number,
        health: number,
        kw: number,
        status: string,
        cons: object,
        sumCons: number,
        extTemp: object,
        extTempMax: object,
        extTempMin: object,
        coloredCons: null,
      }[],
      pot: number,
      consH: number,
      consKWH: number,
      rangeCons: string,
    }[],
    endDate: moment().subtract(1, 'days'),
    dateList: getDatesList(moment().startOf('month'), new Date(moment().startOf('month').year(), moment().startOf('month').month() + 1, 0).getDate()),
    isLoading: false,
    dayStart: new Date(Date.now() - 3 * (60 * 60 * 1000) - 60 * (24 * 60 * 60 * 1000)).toISOString().substring(0, 10),
    dayEnd: new Date(Date.now() - 3 * (60 * 60 * 1000) - 60 * (24 * 60 * 60 * 1000)).toISOString().substring(0, 10),
    clients: [] as { value: string, name: string }[],
    selectedClient: [] as string[],
    units: [] as { value: string, name: string }[],
    selectedUnits: [] as string[],
    filters: [] as FilterItem[],
    dacList: [] as {
      clientName: string,
      unitName: string,
      id: string,
      name: string,
      groupId: number,
      groupName: string,
      pot: number | undefined,
      health: number,
      kw: number | undefined,
      status: string,
      cons: any,
      sumCons: any,
      extTemp: any,
      extTempMax: any,
      extTempMin: any,
      coloredCons: any,
    }[],
    machinesCsvData: [] as {}[],
    async fetchServerData() {
      try {
        setState({ isLoading: true });
        const test = await apiCall('/clients/get-clients-list', {});
        state.clients = test.list.map((client) => ({
          value: client.CLIENT_ID.toString(),
          name: client.NAME,
        }));

        const { list } = await apiCall('/get-units-list-page', {
          clientIds: state.selectedClient.length ? state.selectedClient.map((x) => Number(x)) : undefined,
        });
        state.units = list.map((unit) => ({
          value: unit.UNIT_ID.toString(),
          name: unit.UNIT_NAME,
        }));
        setState({ isLoading: false });
      } catch (err) { console.log(err); toast.error(t('houveErro')); }
      setState({ isLoading: false });
    },
  });

  async function handleGetUnitInfo() {
    try {
      state.isLoading = true;
      const { list: dacsList } = await apiCall('/dac/get-dacs-list', {
        includeConsumption: true,
        unitIds: state.selectedUnits.map((unit) => Number(unit)),
        dateStart: state.dayStart,
        dateEnd: state.dayEnd,
      });

      state.dacList = dacsList.map((dac) => {
        const cons = {} as { [day: string]: number };
        const extTemp = {} as { [day: string]: number };
        const extTempMax = {} as { [day: string]: number };
        const extTempMin = {} as { [day: string]: number };

        for (const item of (dac.CONSUMPTION || [])) {
          if (item.DAY_HOURS_ON == null) continue;

          cons[item.DAT_REPORT] = item.DAY_HOURS_ON;
          extTemp[item.DAT_REPORT] = item.meanT;
          extTempMax[item.DAT_REPORT] = item.maxT;
          extTempMin[item.DAT_REPORT] = item.minT;

          const dayInfo = state.dateList.find((x) => x.YMD === item.DAT_REPORT);
          if (dayInfo) {
            dayInfo.totalAirCondCons = (dayInfo.totalAirCondCons || 0) + (item.DAY_HOURS_ON * (dac.DAC_KW || 0));
          }
        }

        let sumCons = 0;
        for (const item of Object.values(cons)) {
          sumCons = (sumCons || 0) + (item * (dac.DAC_KW || 0));
        }
        return {
          clientName: dac.CLIENT_NAME,
          unitName: dac.UNIT_NAME,
          id: dac.DAC_ID,
          name: dac.DAC_NAME,
          groupId: dac.GROUP_ID,
          groupName: dac.GROUP_NAME,
          pot: dac.DAC_KW,
          health: dac.H_INDEX,
          kw: dac.DAC_KW,
          status: dac.status,
          cons,
          sumCons,
          extTemp,
          extTempMax,
          extTempMin,
          coloredCons: null,
        };
      });
      render();

      const groupedMachines = {} as {
      clientName: string,
      unitName: string,
      id: string,
      name: string,
      groupId: string,
      groupName: string,
      pot: number
      health: number,
      kw: number,
      status: string,
      cons,
      sumCons,
      extTemp,
      extTempMax,
      extTempMin,
      coloredCons: null,
    };
      state.dacList.forEach((dac) => {
        if (!groupedMachines[dac.groupId]) {
          groupedMachines[dac.groupId] = {
            id: dac.groupId,
            name: dac.groupName,
            dacs: [],
          };
        }
        groupedMachines[dac.groupId].pot = (groupedMachines[dac.groupId].pot || 0) + dac.pot;
        groupedMachines[dac.groupId].consH = (groupedMachines[dac.groupId].consH || 0) + Object.values(dac.cons).reduce((a, b) => (a as number) + (b as number), 0);
        groupedMachines[dac.groupId].consKWH = dac.kw && (groupedMachines[dac.groupId].consKWH || 0) + (Object.values(dac.cons).reduce((a, b) => (a as number) + (b as number), 0) as number * dac.kw);
        groupedMachines[dac.groupId].dacs.push(dac);
        groupedMachines[dac.groupId].unitName = dac.unitName;
        groupedMachines[dac.groupId].clientName = dac.clientName;
      });
      state.groupedMachines = Object.values(groupedMachines);
      state.groupedMachines.sort((a, b) => b.consKWH - a.consKWH);
      setState({ isLoading: false });
      render();
    } catch (error) {
      console.log(error);
      toast.error(t('erroInformacaoUnidade'));
    }
    setState({ isLoading: false });
    render();
  }

  const getMachinesCsvData = async () => {
    setState({ isLoading: true });
    await handleGetUnitInfo();

    const formattedCSV = [] as {}[];
    try {
      render();
      if (state.groupedMachines && state.groupedMachines.length > 0) {
        for (const machine of state.groupedMachines) {
          for (let i = 0; i < machine.dacs.length; i++) {
            const usageData = Object.entries(machine.dacs[i].cons);
            usageData.forEach((entries) => {
              const data = {
                clientName: machine.clientName,
                unitName: machine.unitName,
                name: machine.name,
                id: machine.dacs[i].id,
                pot: machine.dacs[i].pot,
                data: moment(entries[0]).format('DD/MM/YYYY'),
                consumo: formatNumberWithFractionDigits((Number(entries[1]) * machine.dacs[i].kw).toFixed(2), { minimum: 0, maximum: 2 }),
                usage: formatNumberWithFractionDigits(Number(entries[1]).toFixed(2), { minimum: 0, maximum: 2 }),
              };
              formattedCSV.push(data);
            });
          }
        }

        setState({ ...state, machinesCsvData: formattedCSV });
        setTimeout(() => {
          (machinesCsvLinkEl as any).current.link.click();
        }, 1000);

        setState({ isLoading: false });
        render();
      }
      else {
        toast.info(t('erroExportarDadosGrafico')); setState({ isLoading: false });
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); setState({ isLoading: false });
    }
  };

  function getDatesList(date: moment.Moment, numDays: number) {
    const dateList = [] as {
      mdate: moment.Moment,
      YMD: string,
      DMY: string,
      totalGreenAntCons: number,
      totalGreenAntInvoice: number,
      totalAirCondCons: number,
      savings_kWh: number,
    }[];

    for (let i = 0; i < numDays; i++) {
      const mdate = moment(date).add(i, 'days');
      dateList.push({
        mdate,
        DMY: mdate.format('DD/MM/YYYY'),
        YMD: mdate.format('YYYY-MM-DD'),
        totalGreenAntCons: 0,
        totalGreenAntInvoice: 0,
        totalAirCondCons: 0,
        savings_kWh: 0,
      });
    }

    return dateList;
  }

  state.filters = [
    {
      label: t('cliente'),
      placeholder: t('cliente'),
      options: state.clients,
      value: state.selectedClient,
      onChange: (value) => { state.selectedClient = value; state.fetchServerData(); render(); },
      index: 1,
    },
    {
      label: t('unidade'),
      placeholder: t('unidade'),
      options: state.units,
      value: state.selectedUnits,
      onChange: (value) => { state.selectedUnits = value; render(); },
      index: 2,
    },
  ];

  useEffect(() => {
    state.fetchServerData();
  }, []);

  return (
    <>
      { state.isLoading ? <Loader /> : (
        <>
          <CSVLink
            headers={state.CSVheader}
            data={state.machinesCsvData}
            filename={t('eficienciaEnergeticaCsv')}
            separator=";"
            enclosingCharacter={"'"}
            ref={machinesCsvLinkEl}
          />
          <div style={{ display: 'flex' }}>
            <AnalysisFilters
              filters={state.filters}
              isLoading={state.isLoading}
              onApply={() => {}}
              dielTool
            />
            <div style={{ paddingLeft: '30px' }}>
              <Input
                value={state.dayStart}
                onChange={(e) => setState({ dayStart: e.target.value })}
                placeholder="YYYY-MM-DD"
                label={t('dataInicial')}
                style={{ width: '130px' }}
              />
            </div>
            <div style={{ paddingLeft: '30px' }}>
              <Input
                value={state.dayEnd}
                onChange={(e) => setState({ dayEnd: e.target.value })}
                placeholder="YYYY-MM-DD"
                label={t('dataFinal')}
                style={{ width: '130px' }}
              />
            </div>
            <div>
              <Button variant="blue" onClick={() => getMachinesCsvData()} style={{ width: '200px', marginLeft: '30px' }}>
                {t('botaoExportar')}
              </Button>
            </div>
          </div>
          <a id="downloadLink" href="#" />
          <div
            onClick={() => { state.selectedUnits = state.selectedUnits.length && state.selectedUnits.length > 0 ? [] : state.units.map((unit) => unit.value); render(); }}
            style={{
              paddingTop: '5px', marginLeft: '289px', textDecoration: 'underline', color: '#00008B', fontSize: '11px', cursor: 'pointer',
            }}
          >
            {t('selecionarTodas')}
          </div>
        </>
      )}
    </>
  );
}

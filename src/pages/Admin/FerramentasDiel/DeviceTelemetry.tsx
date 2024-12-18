import { useEffect, useRef } from 'react';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import {
  Button,
  Loader,
  Input,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, ApiResps } from 'providers';
import { AnalysisFilters, FilterItem } from '~/pages/Analysis/AnalysisFilters';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

export function DeviceTelemetry(): JSX.Element {
  const deviceTelemetryCsvLinkEl = useRef();
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
      label: t('maquina'),
      key: 'machine',
    },
    {
      label: t('idDispositivo'),
      key: 'id',
    },
    {
      label: t('dia'),
      key: 'date',
    },
    {
      label: t('hora'),
      key: 'hour',
    },
    {
      label: `DAC (${t('temperaturaAmbiente')})`,
      key: 'tamb_DAC',
    },
    {
      label: `DAC (${t('temperaturaLiquido')})`,
      key: 'tliq_DAC',
    },
    {
      label: `DAC (${t('temperaturaSuccao')})`,
      key: 'tsuc_DAC',
    },
    {
      label: `DAC (${t('pressaoLiquido')})`,
      key: 'pliq_DAC',
    },
    {
      label: `DAC (${t('pressaoSuccao')})`,
      key: 'psuc_DAC',
    },
    {
      label: `DAC (${t('sinalComando')})`,
      key: 'sinal_DAC',
    },
    {
      label: `DAC (${t('superaquecimento')})`,
      key: 'tsh_DAC',
    },
    {
      label: `DAC (${t('subresfriamento')})`,
      key: 'tsc_DAC',
    },
    {
      label: `DAC (${t('temperatura')})`,
      key: 'temp_DUT',
    },
    {
      label: 'DUT (Mode)',
      key: 'mode_DUT',
    },
    {
      label: 'DUT (State)',
      key: 'state_DUT',
    },
    {
      label: 'DUT (Prog)',
      key: 'prog_DUT',
    },
    {
      label: 'DAM (Mode)',
      key: 'mode_DAM',
    },
    {
      label: 'DAM (State)',
      key: 'state_DAM',
    },
    {
      label: 'DAM (Prog)',
      key: 'prog_DAM',
    },
    {
      label: `DRI - ${t('consumoAcumulado')}`,
      key: 'energy_DRI',
    },
    {
      label: `DRI - ${t('modoOperacao')}`,
      key: 'operationMode_DRI',
    },
    {
      label: 'DRI - Setpoint',
      key: 'setpoint_DRI',
    },
    {
      label: 'DRI - Status',
      key: 'status_DRI',
    },
    {
      label: `DRI - ${t('limiteMax')}`,
      key: 'limiteMax_DRI',
    },
    {
      label: `DRI - ${t('limiteMin')}`,
      key: 'limiteMin_DRI',
    },

    ] as {}[],
    groupedDevs: [] as {
      id: string,
      clientName?: string,
      unitName: string,
      machine?: string,
      selectedTime: number[],
      dacs?: {
        lcmp:number[], // Sinal de comando
        lcut:number[], // Bloqueio de comando
        levp:number[], // Sinal de comando
        tamb:number[], // Temperatura ambiente
        tliq:number[], // Temperatura de líquido
        tsuc:number[], // Temperatura de sucção
        pliq:number[], // Pressão de líquido
        psuc:number[], // Pressão de sucção
        tsh:number[], // Superaquecimento
        tsc:number[], // Subresfriamento
      },
      duts?: {
        State:any; // Estado
        Mode:any;// Modo
        prog:any; // Programação
        temp:number[]; // Temperatura
        labels_State:string[]; // Labels de Estado
      },
      dris?:{
        setpoint:number[], // SetPoint
        status:number[], // Status
        operationMode:number[], // Mode de Operação
        limiteMax:number, // Limite Max
        limiteMin:number, // Limite Min
        energy:number[], // Consumo Acumulado
      }
      dams?:{
        State:any; // Estado
        Mode:any;// Modo
        prog:any; // Programação
        labels_State:string[]; // Labels de Estado
      }
    }[],
    isLoading: false,
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().substr(0, 10),
    yesterday: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString().substr(0, 10),
    hourStart: `${new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().substr(11, 3)}00`,
    hourStartMilliSeconds: 1 as number,
    hourEnd: `${new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().substr(11, 3)}00`,
    hourEndMilliSeconds: 1 as number,
    commonX: [] as number[],
    dateStart: moment().subtract(0, 'days'),
    energyMeter: null as null | ApiResps['/energy/get-energy-list']['list'][0],
    energyApiResponse: null as null | ApiResps['/energy/get-hist'],
    groupsList: [] as any,
    assetsList: [] as any,
    initTimeSave: false as boolean,
    initTime: 0 as number,
    endTime: 0 as number,
    numMilliseconds: 1 as number,
    alertColor: false as boolean,
    clients: [] as { value: string, name: string }[],
    selectedClient: [] as string[],
    units: [] as { value: string, name: string }[],
    selectedUnits: [] as string[],
    filters: [] as FilterItem[],
    dacList: [] as {
      id: string,
      clientName: string,
      unitName: string,
      machine?: string,
      selectedTime: number[],
      dacs: {
        lcmp:number[],
        lcut:number[],
        levp:number[],
        tamb:number[],
        tliq:number[],
        tsuc:number[],
        pliq:number[],
        psuc:number[],
        tsh:number[],
        tsc:number[],
      },
    }[],
    dutList: [] as {
      id: string,
      clientName: string,
      unitName: string,
      machine?: string,
      selectedTime: number[],
      duts: {
        State:number[],
        Mode:number[],
        prog:number[],
        temp:number[],
        labels_State:string[],

      },
    }[],
    damList: [] as {
      id: string,
      clientName?: string,
      unitName: string,
      machine?: string,
      selectedTime: number[],
      dams:{
        Mode: any;
        State: any;
        labels_State: string[];
        prog: any;
      }
    }[],
    driList: [] as {
      id: string,
      clientName: string,
      unitName: string,
      machine?: string,
      selectedTime: number[],
      dris:{
        setpoint:number[],
        status:number[],
        operationMode:number[],
        limiteMax: number,
        limiteMin: number,
        energy:number[],
      }
    }[],
    deviceTelemetryCsvData: [] as {}[],
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

  const getData = async (unitIds: number[]) => {
    const [
      { list: dacsList },
      { list: dutsList },
      { list: damsList },
      { list: drisList },
      { list },
    ] = await Promise.all([
      apiCall('/dac/get-dacs-list', {
        includeConsumption: true,
        unitIds,
        dateStart: state.yesterday,
        dateEnd: state.date,
      }),
      apiCall('/dut/get-duts-list', {
        unitIds,
      }),
      apiCall('/dam/get-dams-list', {
        unitIds,
      }),
      apiCall('/dri/get-dris-list', {
        unitIds,
      }),
      apiCall('/energy/get-energy-list', { unitIds }),
      unitIds.forEach(async (unit) => {
        const groupsList = await apiCall('/clients/get-groups-list', { unitIds: [unit] });
        const { list: assetsList } = await apiCall('/clients/get-assets-list', { unitIds: [unit] });
        state.groupsList.push(groupsList);
        state.assetsList.push(assetsList);
      }),
    ]);
    return {
      dacsList, dutsList, damsList, drisList, list,
    };
  };

  const handleEnergyMeter = async (list: ApiResps['/energy/get-energy-list']['list']) => {
    const energyMeter = list[0];
    state.energyMeter = energyMeter;

    if (energyMeter) {
      state.energyApiResponse = await apiCall('/energy/get-hist', {
        energy_device_id: energyMeter.ENERGY_DEVICE_ID,
        serial: energyMeter.SERIAL,
        manufacturer: energyMeter.MANUFACTURER,
        model: energyMeter.MODEL,
        start_time: `${state.date}T${state.hourStart}:00`,
        end_time: `${state.date}T${state.hourEnd}:00`,
        params: ['en_at_tri'],
      });
    }
  };

  const updateDevsLists = (
    dacsList: ApiResps['/dac/get-dacs-list']['list'],
    dutsList: ApiResps['/dut/get-duts-list']['list'],
    damsList: ApiResps['/dam/get-dams-list']['list'],
    drisList: ApiResps['/dri/get-dris-list']['list'],
  ) => {
    state.dacList = dacsList.map((device) => ({
      id: device.DAC_ID,
      clientName: device.CLIENT_NAME,
      unitName: device.UNIT_NAME,
      selectedTime: state.commonX,
      dacs: {
        lcmp: [],
        lcut: [],
        levp: [],
        tamb: [],
        tliq: [],
        tsuc: [],
        pliq: [],
        psuc: [],
        tsh: [],
        tsc: [],
      },

    }));
    render();

    state.dutList = dutsList.map((device) => ({
      id: device.DEV_ID,
      clientName: device.CLIENT_NAME,
      unitName: device.UNIT_NAME,
      selectedTime: state.commonX,
      duts: {
        State: [],
        Mode: [],
        prog: [],
        temp: [],
        labels_State: [],
      },

    }));
    render();

    state.damList = damsList.map((device) => ({
      id: device.DAM_ID,
      clientName: device.CLIENT_NAME,
      unitName: device.UNIT_NAME,
      selectedTime: state.commonX,
      dams: {
        Mode: [],
        State: [],
        labels_State: [],
        prog: [],
      },
    }));
    render();

    state.driList = drisList.map((device) => ({
      id: device.DRI_ID,
      clientName: device.CLIENT_NAME,
      unitName: device.UNIT_NAME,
      selectedTime: [],
      dris: {
        setpoint: [],
        status: [],
        operationMode: [],
        limiteMax: 0,
        limiteMin: 0,
        energy: [],
      },
    }));
    render();

    state.dacList.forEach((device) => {
      state.groupedDevs.push(device);
    });
    state.dutList.forEach((device) => {
      state.groupedDevs.push(device);
    });
    state.damList.forEach((device) => {
      state.groupedDevs.push(device);
    });
    state.driList.forEach((device) => {
      state.groupedDevs.push(device);
    });
  };

  const handleDacData = (device: typeof state.groupedDevs[number], promises: Promise<void>[]) => {
    const paramsDac = {
      dacId: device.id,
      dayYMD: moment(state.date).format('YYYY-MM-DD'),
      selectedParams: ['Tamb', 'Tsuc', 'Tliq', 'Psuc', 'Pliq', 'Lcmp', 'Levp', 'Lcut', 'Tsc', 'Tsh'],
      numDays: 1,
    };

    const promise = apiCall('/dac/get-charts-data-common', paramsDac).then(
      async (websocketHistory) => {
        const {
          vars,
        } = websocketHistory;
        if (device.dacs) {
          device.dacs.tamb = vars.Tamb.y;
          device.dacs.tliq = vars.Tliq.y;
          device.dacs.tsuc = vars.Tsuc.y;
          device.dacs.tsc = vars.Tsc.y;
          device.dacs.tsh = vars.Tsh.y;
          device.dacs.psuc = vars.Psuc.y;
          device.dacs.lcmp = vars.Lcmp.L;
          device.dacs.lcut = vars.Lcut.L;
          device.dacs.levp = vars.Levp.L;
        }
      },
    );
    (promise !== undefined) && promises.push(promise);
  };

  const setDutsTemprt = (dutsTemprt: ApiResps['/get-autom-day-charts-data']['dutsTemprt'], device: typeof state.groupedDevs[number]) => {
    !dutsTemprt[0].isDutDuo && dutsTemprt[0].Temperature && dutsTemprt[0].Temperature.c.forEach((telemetry, index) => {
      if (device.duts) {
        for (let i = 0; i < telemetry; i++) {
          device.duts.temp.push(dutsTemprt[0].Temperature.v[index]);
        }
      }
    });
  };

  const setDutData = (websocketHistory: ApiResps['/get-autom-day-charts-data'], device: typeof state.groupedDevs[number]) => {
    const { asTable, dutsTemprt } = websocketHistory;
    device.duts && (device.duts.labels_State = asTable.labels_State);

    asTable?.c.forEach((telemetry, index) => {
      if (device.duts) {
        for (let i = 0; i < telemetry; i++) {
          asTable.State && device.duts.State.push(asTable.State[index]);
          asTable.Mode && device.duts.Mode.push(asTable.Mode[index]);
          asTable.prog && device.duts.prog.push(asTable.prog[index]);
        }
      }
    });
    if (dutsTemprt) {
      setDutsTemprt(dutsTemprt, device);
    }
  };

  const handleDutData = (device: typeof state.groupedDevs[number], promises: Promise<void>[]) => {
    const paramsDut = {
      devId: device.id,
      day: moment(state.date).format('YYYY-MM-DD'),
    };

    const promise = apiCall('/get-autom-day-charts-data', paramsDut).then(
      async (websocketHistory) => {
        setDutData(websocketHistory, device);
      },
    );
    (promise !== undefined) && promises.push(promise);
  };

  const handleDamData = (device: typeof state.groupedDevs[number], promises: Promise<void>[]) => {
    const paramsDam = {
      devId: device.id,
      day: moment(state.date).format('YYYY-MM-DD'),
    };

    const promise = apiCall('/get-autom-day-charts-data', paramsDam).then(
      async (websocketHistory) => {
        const { asTable } = websocketHistory;
        device.dams && (device.dams.labels_State = asTable.labels_State);

        asTable && asTable.c.forEach((telemetry, index) => {
          if (device.dams) {
            for (let i = 0; i < telemetry; i++) {
              device.dams.State.push(asTable.State[index]);
              device.dams.Mode.push(asTable.Mode[index]);
              device.dams.prog.push(asTable.prog[index]);
            }
          }
        });
      },
    );
    (promise !== undefined) && promises.push(promise);
  };

  const handleDriData = (device: typeof state.groupedDevs[number], promises: Promise<void>[]) => {
    const paramsDri = {
      driId: device.id,
      selectedParams: ['Setpoint', 'Status', 'Mode', 'DutTemp', 'ThermOn', 'Lock', 'TempAmb', 'ValveOn', 'Fanspeed'],
      dayYMD: moment(state.date).format('YYYY-MM-DD'),
      numDays: 1,
    };

    if (device.id === state.energyMeter?.ENERGY_DEVICE_ID) {
      state.energyApiResponse && state.energyApiResponse.data.forEach((telemetry) => {
        telemetry.en_at_tri && device.dris?.energy.push(telemetry.en_at_tri);
      });
    }
    if (device.id !== state.energyMeter?.ENERGY_DEVICE_ID) {
      const promise = apiCall('/dri/get-day-charts-data-common', paramsDri).then(
        async (websocketHistory) => {
          const {
            vars, limits,
          } = websocketHistory;

          device.selectedTime = state.commonX;
          if (device.dris) {
            vars.OperationMode && (device.dris.operationMode = vars.OperationMode.y);
            vars.Setpoint && (device.dris.setpoint = vars.Setpoint.y);
            vars.Status && (device.dris.status = vars.Status.y);
            device.dris.limiteMax = limits.maxTval;
            device.dris.limiteMin = limits.minTval;
          }
        },
      );
      promise && promises.push(promise);
    }
  };

  const validations = () => {
    if ((state.numMilliseconds >= 1) && (state.numMilliseconds <= 3600000)) return true;

    toast.error(t('periodoMenorOuIgual1Hora'));
    state.isLoading = false;
    render();
    return false;
  };

  const handleDevices = (device: typeof state.groupedDevs[number], promises: Promise<void>[]) => {
    if (device.id.startsWith('DAC')) {
      handleDacData(device, promises);
    }

    if (device.id.startsWith('DUT')) {
      handleDutData(device, promises);
    }

    if (device.id.startsWith('DRI')) {
      handleDriData(device, promises);
    }

    if (device.id.startsWith('DAM')) {
      handleDamData(device, promises);
    }
  };

  async function handleGetUnitInfo() {
    try {
      state.isLoading = true;
      const unitIds = state.selectedUnits.map((unit) => Number(unit));
      const {
        dacsList, dutsList, damsList, drisList, list,
      } = await getData(unitIds);

      const promises: Promise<void>[] = [];

      await handleEnergyMeter(list);

      if (!validations()) {
        return;
      }

      updateDevsLists(dacsList, dutsList, damsList, drisList);

      if (state.groupedDevs?.length) {
        state.groupedDevs.forEach(async (device) => {
          handleDevices(device, promises);
        });
      }

      await Promise.all(promises);

      toast.success(t('sucessoAguardeUmMomento'));
      setState({ isLoading: false });
      render();
    } catch (error) {
      console.log(error);
      toast.error(t('erroInformacaoUnidade'));
    }
    formatTelemetriesCurrent();
    setState({ isLoading: false });
    render();
  }

  const getMachinesCsvData = async () => {
    setState({ isLoading: true });
    await handleGetUnitInfo();

    const formattedCSV = [] as {}[];
    try {
      render();
      if (state.groupedDevs && state.groupedDevs.length > 0) {
        for (const device of state.groupedDevs) {
          if (device.id.startsWith('DAC')) {
            device.selectedTime.forEach((time, index) => {
              const data = {
                clientName: device.clientName,
                unitName: device.unitName,
                id: device.id,
                machine: device.machine,
                date: moment(state.date).format('DD.MM.YYYY'),
                hour: CsvLabelFromaterData(time),
                tamb_DAC: (device.dacs && device.dacs.tamb[index]) ? device.dacs.tamb[index].toFixed(1) : '-',
                tliq_DAC: (device.dacs && device.dacs.tliq[index]) ? device.dacs.tliq[index].toFixed(1) : '-',
                tsuc_DAC: (device.dacs && device.dacs.tsuc[index]) ? device.dacs.tsuc[index].toFixed(1) : '-',
                sinal_DAC: device.dacs && (device.dacs.lcmp[index] === 1 || device.dacs.lcut[index] === 1 || device.dacs.levp[index] === 1) ? 'LIGADO' : 'DESLIGADO',
                pliq_DAC: device.dacs && device.dacs.pliq[index] ? device.dacs.pliq[index].toFixed(1) : '-',
                psuc_DAC: (device.dacs && device.dacs.psuc[index]) ? device.dacs.psuc[index].toFixed(1) : '-',
                tsh_DAC: (device.dacs && device.dacs.tsh[index]) ? device.dacs.tsh[index].toFixed(1) : '-',
                tsc_DAC: (device.dacs && device.dacs.tsc[index]) ? device.dacs.tsc[index].toFixed(1) : '-',
              };
              formattedCSV.push(data);
            });
          }
          else if (device.id.startsWith('DUT')) {
            device.selectedTime.forEach((time, index) => {
              const data = {
                clientName: device.clientName,
                unitName: device.unitName,
                id: device.id,
                machine: device.machine,
                date: moment(state.date).format('DD.MM.YYYY'),
                hour: CsvLabelFromaterData(time),
                state_DUT: (device.duts && device.duts.State[index]) && device.duts.labels_State[device.duts.State[index]],
                mode_DUT: (device.duts && device.duts.Mode[index]) ? (device.duts.Mode[index] === 1 ? 'Manual' : 'Auto') : '-',
                prog_DUT: (device.duts && device.duts.State[index]) ? (device.duts.State[index] === 1 ? 'forbid' : 'allow') : '-',
                temp_DUT: (device.duts && device.duts.temp[index]) ? device.duts.temp[index].toFixed(1) : '-',
              };
              formattedCSV.push(data);
            });
          }
          else if (device.id.startsWith('DRI') && (device.id === state.energyMeter?.ENERGY_DEVICE_ID)) {
            state.energyApiResponse?.data.forEach((telemetry) => {
              const data = {
                clientName: device.clientName,
                unitName: device.unitName,
                id: device.id,
                machine: device.machine,
                date: moment(state.date).format('DD.MM.YYYY'),
                hour: telemetry.timestamp && telemetry.timestamp.substr(11, 9),
                energy_DRI: telemetry.en_at_tri && telemetry.en_at_tri.toFixed(1),
              };
              formattedCSV.push(data);
            });
          }
          else if (device.id.startsWith('DRI') && (device.id !== state.energyMeter?.ENERGY_DEVICE_ID)) {
            device.selectedTime.forEach((time, index) => {
              const data = {
                clientName: device.clientName,
                unitName: device.unitName,
                id: device.id,
                machine: device.machine,
                date: moment(state.date).format('DD.MM.YYYY'),
                hour: CsvLabelFromaterData(time),
                operationMode_DRI: (device.dris && device.dris.operationMode[index]) ? csvOperationModeFormatter(device.dris.operationMode[index]) : '-',
                setpoint_DRI: (device.dris && device.dris.setpoint[index]) ? device.dris.setpoint[index] : '-',
                status_DRI: (device.dris && device.dris.status[index]) ? device.dris.status[index].toFixed(1) : '-',
                limiteMax_DRI: (device.dris && device.dris.limiteMax) ? device.dris.limiteMax.toFixed(1) : '-',
                limiteMin_DRI: (device.dris && device.dris.limiteMin) ? device.dris.limiteMin.toFixed(1) : '-',
              };
              formattedCSV.push(data);
            });
          }
          else if (device.id.startsWith('DAM')) {
            device.selectedTime.forEach((time, index) => {
              const data = {
                clientName: device.clientName,
                unitName: device.unitName,
                id: device.id,
                machine: device.machine,
                date: moment(state.date).format('DD.MM.YYYY'),
                hour: CsvLabelFromaterData(time),
                state_DAM: (device.dams && device.dams.State[index]) && device.dams.labels_State[device.dams.State[index]],
                mode_DAM: (device.dams && device.dams.Mode[index]) ? (device.dams.Mode[index] === 1 ? 'Manual' : 'Auto') : '-',
                prog_DAM: (device.dams && device.dams.State[index]) ? (device.dams.State[index] === 1 ? 'forbid' : 'allow') : '-',
              };
              formattedCSV.push(data);
            });
          }
        }

        setState({ ...state, deviceTelemetryCsvData: formattedCSV });
        setTimeout(() => {
          (deviceTelemetryCsvLinkEl as any).current.link.click();
        }, 1000);

        setState({ isLoading: false });
        state.groupedDevs = [];
        state.assetsList = [];
        state.groupsList = [];
        state.initTimeSave = false;
        render();
      }
      else {
        toast.info(t('semDadosGraficoExportar')); setState({ isLoading: false });
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); setState({ isLoading: false });
    }
  };

  function formatTelemetriesCurrent() {
    for (const device of state.groupedDevs) {
      device.selectedTime = device.selectedTime.filter((time, index) =>
      {
        const currentTime = CsvLabelFromaterDataMilliSeconds(time);
        if (state.hourStartMilliSeconds <= currentTime && currentTime <= state.hourEndMilliSeconds) {
          if (!state.initTimeSave) {
            state.initTime = index;
            state.initTimeSave = true;
          }
          state.endTime = index;
          return time;
        }
      });

      if (device.id.startsWith('DAC') && device.dacs) {
        device.dacs.tamb = device.dacs.tamb.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dacs.lcmp = device.dacs.lcmp.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dacs.lcut = device.dacs.lcut.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dacs.levp = device.dacs.levp.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dacs.pliq = device.dacs.pliq.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dacs.psuc = device.dacs.psuc.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dacs.tliq = device.dacs.tliq.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dacs.tsc = device.dacs.tsc.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dacs.tsh = device.dacs.tsh.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dacs.tsuc = device.dacs.tsuc.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
      }
      if (device.id.startsWith('DUT') && device.duts) {
        device.duts.State = device.duts.State.filter((_telemetry, index) => (index % 5) === 0).filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.duts.Mode = device.duts.Mode.filter((_telemetry, index) => (index % 5) === 0).filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.duts.prog = device.duts.prog.filter((_telemetry, index) => (index % 5) === 0).filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.duts.temp = device.duts.temp.filter((_telemetry, index) => (index % 5) === 0).filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
      }
      if (device.id.startsWith('DRI') && (device.id !== state.energyMeter?.ENERGY_DEVICE_ID)) {
        if (device.dris) {
          device.dris.setpoint = device.dris.setpoint.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
          device.dris.status = device.dris.status.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
          device.dris.operationMode = device.dris.operationMode.filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        }
      }

      if (device.id.startsWith('DAM') && device.dams) {
        device.dams.State = device.dams.State.filter((_telemetry, index) => (index % 5) === 0).filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dams.Mode = device.dams.Mode.filter((_telemetry, index) => (index % 5) === 0).filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
        device.dams.prog = device.dams.prog.filter((_telemetry, index) => (index % 5) === 0).filter((_telemetry, index) => state.initTime <= index && index <= state.endTime);
      }
      state.assetsList.filter((assets) => {
        assets.filter((asset) => {
          if (asset.DEV_ID === device.id) {
            device.machine = asset.GROUP_NAME;
          }
        });
      });

      state.groupsList.filter((groups) => {
        groups.filter((group) => {
          if (group.DEV_AUT === device.id || group.DUT_ID === device.id) {
            device.machine = group.GROUP_NAME;
          }
        });
      });
    }
  }

  function csvOperationModeFormatter(value: any) {
    if (value === 0) return 'DESLIGADO';
    if (value === 1) return 'VENTILAR';
    if (value === 2) return 'REFRIGERAR';
    return '-';
  }

  function CsvLabelFromaterDataMilliSeconds(hour: number) {
    const numDays = Math.floor(hour / 24);

    const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
    const min = Math.floor((Math.abs(hour) * 60) % 60);
    const ss = Math.floor((Math.abs(hour) * 60 * 60) % 60);

    const timeMilliseconds = (hh * 60 * 60 * 1000) + (min * 60 * 1000) + (ss * 1000);

    return timeMilliseconds;
  }

  function CsvLabelFromaterData(hour: number) {
    const numDays = Math.floor(hour / 24);

    const hh = Math.floor(Math.abs(hour)) - 24 * numDays;
    const min = Math.floor((Math.abs(hour) * 60) % 60);
    const ss = Math.floor((Math.abs(hour) * 60 * 60) % 60);

    return `${String(hh).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }

  state.filters = [
    {
      label: t('cliente'),
      placeholder: t('cliente'),
      options: state.clients,
      value: state.selectedClient,
      onChange: (value) => { state.selectedClient[0] = value; state.fetchServerData(); render(); },
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

  useEffect(() => {
    let addFiveSeconds = 0;
    for (let i = 0; i <= 17280; i++) {
      state.commonX[i] = addFiveSeconds;
      addFiveSeconds += 0.00138888888;
    }
  }, []);

  useEffect(() => {
    state.hourStartMilliSeconds = parseInt(state.hourStart.substr(0, 2), 10) * 60 * 60 * 1000 + parseInt(state.hourStart.substr(3, 2), 10) * 60 * 1000;
    state.hourEndMilliSeconds = parseInt(state.hourEnd.substr(0, 2), 10) * 60 * 60 * 1000 + parseInt(state.hourEnd.substr(3, 2), 10) * 60 * 1000;

    state.numMilliseconds = (state.hourEndMilliSeconds - state.hourStartMilliSeconds);
    if ((state.numMilliseconds >= 1) && (state.numMilliseconds <= 3600000)) {
      state.alertColor = false;
      render();
    }
    else {
      state.alertColor = true;
      render();
    }
  }, [state.hourStart, state.hourEnd]);

  return (
    <>
      { state.isLoading ? <Loader /> : (
        <>
          <CSVLink
            headers={state.CSVheader}
            data={state.deviceTelemetryCsvData}
            filename="TelemetriasDispositivos.csv"
            separator=";"
            enclosingCharacter={"'"}
            ref={deviceTelemetryCsvLinkEl}
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
                value={state.date}
                onChange={(e) => setState({ date: e.target.value })}
                placeholder="YYYY-MM-DD"
                label={t('data')}
                style={{ width: '130px' }}
              />
            </div>
            <div style={{ paddingLeft: '30px' }}>
              <Input
                value={state.hourStart}
                onChange={(e) => setState({ hourStart: e.target.value })}
                placeholder="00:00"
                label={t('horaInicial')}
                style={{ width: '130px' }}
              />

            </div>
            <div style={{ paddingLeft: '30px' }}>
              <Input
                value={state.hourEnd}
                onChange={(e) => setState({ hourEnd: e.target.value })}
                placeholder="00:00"
                label={t('horaFinal')}
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
          <div style={{
            display: 'flex',
          }}
          >
            <div
              onClick={() => { state.selectedUnits.length && state.selectedUnits.length > 0 ? state.selectedUnits = [] : state.selectedUnits = state.units.map((unit) => unit.value); render(); }}
              style={{
                paddingTop: '5px', marginLeft: '289px', textDecoration: 'underline', color: '#00008B', fontSize: '11px', cursor: 'pointer',
              }}
            >
              {t('selecionarTodas')}
            </div>
            <span style={
                {
                  color: `${state.alertColor ? 'red' : 'green'}`, fontSize: '14px', marginLeft: '440px',
                }
              }
            >
              {t('intervaloTempoAte1Hora')}
            </span>
          </div>

        </>
      )}
    </>
  );
}

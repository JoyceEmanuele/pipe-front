import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import {
  Loader,
  Input,
  Button,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, apiCallDownload } from '~/providers';
import { ChartLine, colorPalete } from '~/components/ChartRecharts';
import { LegendaGroup } from '~/components/ChartRecharts/Legenda';
import { AdminLayout } from '../AdminLayout';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment';
import i18n from '~/i18n';
import { withTransaction } from '@elastic/apm-rum-react';

interface ChartData {
  commonX: number[]
  lines: {
    id: string
    name: string
    unit?: string
    color: string
    axisId: string
    y: (number|null)[]
    checked?: boolean
    type?: 'linear'|'step'
  }[]
  axisInfo: {
    x: {
      domain: [number|string, number|string] // [minX, maxX], ['dataMin', 'dataMax+50']
    }
    y: {
      [axisId: string]: {
        domain: [number|string, number|string] // [minY, maxY]
        orientation?: 'right'
      }
    }
  }
  numDays?: number
  tooltipXLabelFormater?: (x: number) => string
  formaterXTick?: (x: number) => string
  tickSecondX?: (x: any) => JSX.Element
}

export const ServersMonitoring = (): JSX.Element => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const [state, render, setState] = useStateVar(() => {
    const state = {
      loadingOtherCharts: true,
      loadingBrokersMonit: true,
      formExport: {
        timespan: '10',
        tsStart: new Date(Date.now() - 3 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString().substring(0, 19).replace('T', ' '),
        exporting: false,
      },
      serversList: [] as {
        address: string // "::ffff:172.31.94.63"
        isBroker2Dynamo: boolean
        isIotRelay: boolean
        firstTs: Date
        charts: { [id: string]: ChartData }
      }[],
      brokersMonit: null as null|{
        firstTs: Date
        charts: { [id: string]: ChartData }
      },
      selectedDay: moment(moment().format('YYYY-MM-DD')),
      tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
      datePickerFocused: false,
    };
    return state;
  });

  useEffect(() => {
    fetchData();
  }, []);
  async function fetchData() {
    try {
      setState({ loadingOtherCharts: true });
      // const { list2 } = await apiCall('/realtime/devtools/getServersStatus', {});
      const list2: any[] = [];
      state.serversList = [];
      for (const serverData of list2) {
        const serverItem: typeof state.serversList[number] = {
          ...serverData,
          isBrokerDiel: !!(serverData.records.some((x) => x.payload.origin === 'broker-diel-v1')),
          isBroker2Dynamo: !!(serverData.records.some((x) => x.payload.disk_info)),
          isIotRelay: !!(serverData.records.some((x) => x.payload.origin === 'iotrelay-v1')),
          firstTs: (serverData.records[0] && new Date(serverData.records[0].payload_ts)) || new Date(),
          charts: {},
        };
        if (serverItem.isBroker2Dynamo) {
          const flatRecords = flattenRecords(serverData.records);
          serverItem.charts = createChartsBroker2Dynamo(flatRecords.filter((x) => x.origin === 'broker2dynamo-v1'), serverItem.firstTs);
          state.serversList.push(serverItem);
        } else if (serverItem.isIotRelay) {
          const flatRecords = flattenRecords(serverData.records);
          serverItem.charts = createChartsIotRelay(flatRecords.filter((x) => x.origin === 'iotrelay-v1'), serverItem.firstTs);
          state.serversList.push(serverItem);
        }
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    setState({ loadingOtherCharts: false });
  }

  useEffect(() => {
    fetchBrokersMonit();
  }, [state.selectedDay]);
  async function fetchBrokersMonit() {
    try {
      setState({ loadingBrokersMonit: true });

      state.brokersMonit = null;
      const dayYMD = state.selectedDay.format('YYYY-MM-DD');
      await new Promise((r) => setTimeout(r, 3000));
      const brokersMonHist1 = await apiCall('/devtools/brokers-monitor-hist-v1', { dayYMD });
      state.brokersMonit = {
        firstTs: new Date(`${dayYMD}T00:00:00-0300`),
        charts: createChartsBrokerDiel2(brokersMonHist1.records, brokersMonHist1.commonx.map((x) => x * 1000)),
      };
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    setState({ loadingBrokersMonit: false });
  }

  async function exportDisconnectedDevs() {
    try {
      if (state.formExport.tsStart.length !== 19) {
        toast.error('Horário de início em formato inválido');
        return;
      }

      const tsStart = new Date(`${state.formExport.tsStart.substring(0, 10)}T${state.formExport.tsStart.substring(11)}-0300`);
      const tsEnd = new Date(tsStart.getTime() + Number(state.formExport.timespan.trim()) * 60 * 1000);

      state.formExport.exporting = true;
      render();

      const exportResponse = await apiCallDownload('/devtools/brokers-monitor-disconnected-devs', {
        tsStart: tsStart.toISOString(),
        tsEnd: tsEnd.toISOString(),
      });
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || 'Export.xlsx';
      link.click();
      toast.success('Exportado com sucesso.');
    } catch (err) { console.log(err); toast.error('Houve erro'); }

    state.formExport.exporting = false;
    render();
  }

  return (
    <>
      <Helmet>
        <title>Diel Energia - Servidores</title>
      </Helmet>
      <AdminLayout />

      {state.loadingBrokersMonit && <Loader variant="primary" />}
      {(!state.loadingBrokersMonit) && state.brokersMonit && (
        <>
          <h1>broker-connections-sniffing</h1>
          <div>
            <div>
              <SingleDatePicker
                disabled={state.loadingBrokersMonit}
                date={state.selectedDay}
                onDateChange={(value) => { setState({ selectedDay: value }); }}
                focused={state.datePickerFocused}
                onFocusChange={({ focused }) => setState({ datePickerFocused: focused })}
                id="datepicker"
                numberOfMonths={1}
                isOutsideRange={(d) => !d.isBefore(state.tomorrow)}
              />
            </div>
            {Object.entries(state.brokersMonit.charts).map(([chartId, chartData]) => (
              <div key={chartId} style={{ display: 'flex' }}>
                <LegendaGroup
                  style={{ minWidth: '250px', maxWidth: '450px' }}
                  groups={[{ name: chartId, lines: chartData.lines }]}
                  onCheckboxChanging={() => { render(); }}
                  onColorChanging={(color, line) => { line.color = color.hex; render(); }}
                />
                <ChartLine
                  commonX={chartData.commonX}
                  varsInfo={chartData.lines.filter((line) => line.checked)}
                  axisInfo={chartData.axisInfo}
                  formaterXTick={(x) => new Date(state.brokersMonit!.firstTs.getTime() + x).toLocaleTimeString()}
                  tooltipXLabelFormater={(x) => new Date(state.brokersMonit!.firstTs.getTime() + x).toLocaleString()}
                />
              </div>
            ))}
            <br />
            <div>Existem 2 brokers em operação, que nas variáveis são chamados de b0 e b1. Abaixo vou listar só as do b0 para não ficar repetindo texto.</div>
            <ul>
              <li>b0_conn_arr: conexões que chegaram e foram (ou seriam) encaminhadas para o b0. Pode ser que a conexão seja fechada antes mesmo de ser encaminhada para o broker, caso ocorra erro no estabelecimento da criptografia.</li>
              <li>b0_conn_closed: conexões fechadas. Pode ser fechamento por erro em estabelecer a criptografia, ou o dispositivo quis fechar, ou o broker fechou ou qualquer outro motivo.</li>
              <li>b0_tls_err: erro ao abrir a conexão, geralmente por erro ao estabelecer a criptografia (TLS).</li>
              <li>b0_pub_brtodv: mensagens trafegando do broker para o dispositivo. Como o iotrelay se conecta diretamente aos brokers, as conexões monitoradas aqui são sempre de dispositivos. Então essas mensagens devem ser comandos que o dash envia.</li>
              <li>b0_pub_others: mensagens trafegando dos dispositivos para o broker, que são as telemetrias e as mensagens de controle.</li>
              <li>b0_subscr: quantidade de pacotes de subscribe.</li>
              <li>b0_est_conn: estimativa de quantas conexões estão abertas com o broker. Eu chamo de estimativa porque por enquanto eu considero que existe uma possibilidade de uma conexão ser fechada sem decrementar esse contador.</li>
              <li>est_conn: total de conexões abertas sendo monitoradas, é a soma de b0 e b1.</li>
            </ul>
            <br />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>Exportar lista dos dispostivos que desconectaram nos &nbsp;</span>
              <Input
                type="text"
                value={state.formExport.timespan}
                placeholder="minutos"
                onChange={(event) => { state.formExport.timespan = event.target.value; render(); }}
                style={{ width: '80px' }}
              />
              <span>&nbsp; minutos após &nbsp;</span>
              <Input
                type="text"
                value={state.formExport.tsStart}
                placeholder="início"
                onChange={(event) => { state.formExport.tsStart = event.target.value; render(); }}
                style={{ width: '200px' }}
              />
              <span>&nbsp; &nbsp;</span>
              <Button
                variant="primary"
                onClick={exportDisconnectedDevs}
                style={{ width: '160px' }}
                disabled={state.formExport.exporting}
              >
                {
                  state.formExport.exporting
                    ? <Loader size="small" variant="secondary" />
                    : 'Exportar'
                }
              </Button>
              <a id="downloadLink" href="#" />
            </div>
          </div>
        </>
      )}
      <br />

      {state.loadingOtherCharts && <Loader variant="primary" />}
      {(!state.loadingOtherCharts) && (
        <>
          <h1>Brokers Instances</h1>
          {state.serversList.filter((x) => x.isBroker2Dynamo).map((serverData) => (
            <div key={serverData.address}>
              <h3>{serverData.address}</h3>
              {Object.entries(serverData.charts).map(([chartId, chartData]) => (
                <div key={chartId} style={{ display: 'flex' }}>
                  <LegendaGroup
                    style={{ minWidth: '250px', maxWidth: '450px' }}
                    groups={[{ name: chartId, lines: chartData.lines }]}
                    onCheckboxChanging={() => { render(); }}
                    onColorChanging={(color, line) => { line.color = color.hex; render(); }}
                  />
                  <ChartLine
                    commonX={chartData.commonX}
                    varsInfo={chartData.lines.filter((line) => line.checked)}
                    axisInfo={chartData.axisInfo}
                    formaterXTick={(x) => new Date(serverData.firstTs.getTime() + x).toLocaleTimeString()}
                    tooltipXLabelFormater={(x) => new Date(serverData.firstTs.getTime() + x).toLocaleString()}
                  />
                </div>
              ))}
            </div>
          ))}
          <br />
          <h1>IotRelay</h1>
          {state.serversList.filter((x) => x.isIotRelay).map((serverData) => (
            <div key={serverData.address}>
              <h3>{serverData.address}</h3>
              {Object.entries(serverData.charts).map(([chartId, chartData]) => (
                <div key={chartId} style={{ display: 'flex' }}>
                  <LegendaGroup
                    style={{ minWidth: '250px', maxWidth: '450px' }}
                    groups={[{ name: chartId, lines: chartData.lines }]}
                    onCheckboxChanging={() => { render(); }}
                    onColorChanging={(color, line) => { line.color = color.hex; render(); }}
                  />
                  <ChartLine
                    commonX={chartData.commonX}
                    varsInfo={chartData.lines.filter((line) => line.checked)}
                    axisInfo={chartData.axisInfo}
                    formaterXTick={(x) => new Date(serverData.firstTs.getTime() + x).toLocaleTimeString()}
                    tooltipXLabelFormater={(x) => new Date(serverData.firstTs.getTime() + x).toLocaleString()}
                  />
                </div>
              ))}
            </div>
          ))}
        </>
      )}
      <br />
      <div>Em construção. Falta mostrar validade de certificados.</div>
    </>
  );
};

function flattenRecords(records: { payload_ts: string, payload: any }[]) {
  return records.map((telm) => {
    if (telm.payload.origin === 'broker-diel-v1') {
      return {
        ts: telm.payload_ts,
        origin: telm.payload.origin,
        interval: telm.payload.interval,
        est_conn: telm.payload.est_conn,
        b0_conn_arr: Math.round((telm.payload.brokers_stats[0].conn_arr * 60 / telm.payload.interval) * 10) / 10,
        b0_conn_closed: Math.round((telm.payload.brokers_stats[0].conn_closed * 60 / telm.payload.interval) * 10) / 10,
        b0_est_conn: telm.payload.brokers_stats[0].est_conn,
        b0_pub_brtodv: Math.round((telm.payload.brokers_stats[0].pub_brtodv * 60 / telm.payload.interval) * 10) / 10,
        b0_pub_others: Math.round((telm.payload.brokers_stats[0].pub_others * 60 / telm.payload.interval) * 10) / 10,
        b0_subscr: Math.round((telm.payload.brokers_stats[0].subscr * 60 / telm.payload.interval) * 10) / 10,
        b0_tls_err: Math.round((telm.payload.brokers_stats[0].tls_err * 60 / telm.payload.interval) * 10) / 10,
        b1_conn_arr: (telm.payload.brokers_stats[1] || null) && Math.round((telm.payload.brokers_stats[1].conn_arr * 60 / telm.payload.interval) * 10) / 10,
        b1_conn_closed: (telm.payload.brokers_stats[1] || null) && Math.round((telm.payload.brokers_stats[1].conn_closed * 60 / telm.payload.interval) * 10) / 10,
        b1_est_conn: (telm.payload.brokers_stats[1] || null) && telm.payload.brokers_stats[1].est_conn,
        b1_pub_brtodv: (telm.payload.brokers_stats[1] || null) && Math.round((telm.payload.brokers_stats[1].pub_brtodv * 60 / telm.payload.interval) * 10) / 10,
        b1_pub_others: (telm.payload.brokers_stats[1] || null) && Math.round((telm.payload.brokers_stats[1].pub_others * 60 / telm.payload.interval) * 10) / 10,
        b1_subscr: (telm.payload.brokers_stats[1] || null) && Math.round((telm.payload.brokers_stats[1].subscr * 60 / telm.payload.interval) * 10) / 10,
        b1_tls_err: (telm.payload.brokers_stats[1] || null) && Math.round((telm.payload.brokers_stats[1].tls_err * 60 / telm.payload.interval) * 10) / 10,
      };
    }
    if (telm.payload.disk_info) {
      return {
        ts: telm.payload_ts,
        origin: 'broker2dynamo-v1',
        disk_info_free: Math.round(telm.payload.disk_info.free / 1000 / 100) / 10,
        disk_info_total: Math.round(telm.payload.disk_info.total / 1000 / 100) / 10,
        loadavg_fifteen: Math.round(telm.payload.loadavg.fifteen * 1000) / 10,
        loadavg_five: Math.round(telm.payload.loadavg.five * 1000) / 10,
        loadavg_one: Math.round(telm.payload.loadavg.one * 1000) / 10,
        mem_info_avail: Math.round(telm.payload.mem_info.avail / 1000 / 100) / 10,
        mem_info_buffers: Math.round(telm.payload.mem_info.buffers / 1000 / 100) / 10,
        mem_info_cached: Math.round(telm.payload.mem_info.cached / 1000 / 100) / 10,
        mem_info_free: Math.round(telm.payload.mem_info.free / 1000 / 100) / 10,
        mem_info_swap_free: Math.round(telm.payload.mem_info.swap_free / 1000 / 100) / 10,
        mem_info_swap_total: Math.round(telm.payload.mem_info.swap_total / 1000 / 100) / 10,
        mem_info_total: Math.round(telm.payload.mem_info.total / 1000 / 100) / 10,
      };
    }
    if (telm.payload.origin === 'iotrelay-v1') {
      return {
        ts: telm.payload_ts,
        origin: telm.payload.origin,
        interval: telm.payload.interval,
        http_reqs: telm.payload.http_reqs,
        command_reqs: telm.payload.command_reqs,
        b0_commands_sent: Math.round((telm.payload.brokers_stats[0].commands_sent * 60 / telm.payload.interval) * 10) / 10,
        b0_commands_error: Math.round((telm.payload.brokers_stats[0].commands_error * 60 / telm.payload.interval) * 10) / 10,
        b1_commands_sent: (telm.payload.brokers_stats[1] || null) && Math.round((telm.payload.brokers_stats[1].commands_sent * 60 / telm.payload.interval) * 10) / 10,
        b1_commands_error: (telm.payload.brokers_stats[1] || null) && Math.round((telm.payload.brokers_stats[1].commands_error * 60 / telm.payload.interval) * 10) / 10,
      };
    }
    return {
      ...telm.payload,
      ts: telm.payload_ts,
    };
  });
}

interface BrokerMonitorRecord {
  // origin: "broker-diel-v1",
  interval: number,
  est_conn: number,
  brokers_stats: {
    conn_arr: number,
    conn_closed: number,
    est_conn: number,
    pub_brtodv: number,
    pub_others: number,
    subscr: number,
    tls_err: number,
  }[],
}
function createChartsBrokerDiel2(records: BrokerMonitorRecord[], commonX: number[]) {
  let numBrokers = 0;
  for (const record of records) {
    if (record.brokers_stats.length > numBrokers) {
      numBrokers = record.brokers_stats.length;
    }
  }
  const axisInfo: ChartData['axisInfo'] = {
    x: { domain: [0, 86400 * 1000] },
    y: {
      y: { domain: [0, 'dataMax'] },
    },
  };
  const charts: { [id: string]: ChartData } = {
    clientes: {
      commonX,
      lines: [
        {
          id: 'est_conn',
          name: 'est_conn',
          color: colorPalete[0],
          axisId: 'y',
          checked: true,
          type: 'linear',
          y: records.map((x) => x.est_conn),
        },
      ],
      axisInfo,
    },
    mqttAct: {
      commonX,
      lines: [],
      axisInfo,
    },
    conexoes: {
      commonX,
      lines: [],
      axisInfo,
    },
  };
  let nColor = 1;
  for (let b = 0; b < numBrokers; b++) {
    charts.clientes.lines.push({
      id: `est_conn_b${b}`,
      name: `est_conn_b${b}`,
      color: colorPalete[(nColor++) % colorPalete.length],
      axisId: 'y',
      checked: true,
      type: 'linear',
      y: records.map((rec) => (rec.brokers_stats[b] || null) && rec.brokers_stats[b].est_conn),
    });
  }
  nColor = 0;
  for (let b = 0; b < numBrokers; b++) {
    charts.mqttAct.lines.push({
      id: `pub_brtodv_b${b}`,
      name: `pub_brtodv_b${b}`,
      color: colorPalete[(nColor++) % colorPalete.length],
      axisId: 'y',
      checked: true,
      type: 'linear',
      y: records.map((rec) => ((rec.brokers_stats[b] || null) && Math.round((rec.brokers_stats[b].pub_brtodv * 60 / rec.interval) * 10) / 10)),
    });
    charts.mqttAct.lines.push({
      id: `pub_others_b${b}`,
      name: `pub_others_b${b}`,
      color: colorPalete[(nColor++) % colorPalete.length],
      axisId: 'y',
      checked: true,
      type: 'linear',
      y: records.map((rec) => ((rec.brokers_stats[b] || null) && Math.round((rec.brokers_stats[b].pub_others * 60 / rec.interval) * 10) / 10)),
    });
  }
  for (let b = 0; b < numBrokers; b++) {
    charts.mqttAct.lines.push({
      id: `subscr_b${b}`,
      name: `subscr_b${b}`,
      color: colorPalete[(nColor++) % colorPalete.length],
      axisId: 'y',
      checked: true,
      type: 'linear',
      y: records.map((rec) => ((rec.brokers_stats[b] || null) && Math.round((rec.brokers_stats[b].subscr * 60 / rec.interval) * 10) / 10)),
    });
  }
  nColor = 0;
  for (let b = 0; b < numBrokers; b++) {
    charts.conexoes.lines.push({
      id: `conn_arr_b${b}`,
      name: `conn_arr_b${b}`,
      color: colorPalete[(nColor++) % colorPalete.length],
      axisId: 'y',
      checked: true,
      type: 'linear',
      y: records.map((rec) => ((rec.brokers_stats[b] || null) && Math.round((rec.brokers_stats[b].conn_arr * 60 / rec.interval) * 10) / 10)),
    });
  }
  for (let b = 0; b < numBrokers; b++) {
    charts.conexoes.lines.push({
      id: `conn_closed_b${b}`,
      name: `conn_closed_b${b}`,
      color: colorPalete[(nColor++) % colorPalete.length],
      axisId: 'y',
      checked: true,
      type: 'linear',
      y: records.map((rec) => ((rec.brokers_stats[b] || null) && Math.round((rec.brokers_stats[b].conn_closed * 60 / rec.interval) * 10) / 10)),
    });
  }
  for (let b = 0; b < numBrokers; b++) {
    charts.conexoes.lines.push({
      id: `tls_err_b${b}`,
      name: `tls_err_b${b}`,
      color: colorPalete[(nColor++) % colorPalete.length],
      axisId: 'y',
      checked: true,
      type: 'linear',
      y: records.map((rec) => ((rec.brokers_stats[b] || null) && Math.round((rec.brokers_stats[b].tls_err * 60 / rec.interval) * 10) / 10)),
    });
  }
  return charts;
}

function createChartsBroker2Dynamo(records: any[], refTs: Date) {
  const commonX = records.map((x) => ((new Date(x.ts)).getTime() - refTs.getTime()));
  const axisInfo: ChartData['axisInfo'] = {
    x: { domain: ['dataMin', 'dataMax'] },
    y: {
      y: { domain: [0, 'dataMax'] },
    },
  };
  const charts: { [id: string]: ChartData } = {
    unico: {
      commonX,
      lines: [
        {
          id: 'disk_info_free',
          name: 'disk_info_free',
          unit: 'GB',
          color: colorPalete[0 % colorPalete.length],
          axisId: 'y',
          checked: true,
          type: 'linear',
          y: records.map((x) => x.disk_info_free),
        },
        {
          id: 'disk_info_total',
          name: 'disk_info_total',
          unit: 'GB',
          color: colorPalete[1 % colorPalete.length],
          axisId: 'y',
          checked: false,
          type: 'linear',
          y: records.map((x) => x.disk_info_total),
        },
        {
          id: 'loadavg_fifteen',
          name: 'loadavg_fifteen',
          unit: '%',
          color: colorPalete[2 % colorPalete.length],
          axisId: 'y',
          checked: true,
          type: 'linear',
          y: records.map((x) => x.loadavg_fifteen),
        },
        {
          id: 'loadavg_five',
          name: 'loadavg_five',
          unit: '%',
          color: colorPalete[2 % colorPalete.length],
          axisId: 'y',
          checked: false,
          type: 'linear',
          y: records.map((x) => x.loadavg_five),
        },
        {
          id: 'loadavg_one',
          name: 'loadavg_one',
          unit: '%',
          color: colorPalete[2 % colorPalete.length],
          axisId: 'y',
          checked: false,
          type: 'linear',
          y: records.map((x) => x.loadavg_one),
        },
        {
          id: 'mem_info_avail',
          name: 'mem_info_avail',
          unit: 'GB',
          color: colorPalete[3 % colorPalete.length],
          axisId: 'y',
          checked: true,
          type: 'linear',
          y: records.map((x) => x.mem_info_avail),
        },
        {
          id: 'mem_info_buffers',
          name: 'mem_info_buffers',
          unit: 'GB',
          color: colorPalete[4 % colorPalete.length],
          axisId: 'y',
          checked: false,
          type: 'linear',
          y: records.map((x) => x.mem_info_buffers),
        },
        {
          id: 'mem_info_cached',
          name: 'mem_info_cached',
          unit: 'GB',
          color: colorPalete[5 % colorPalete.length],
          axisId: 'y',
          checked: false,
          type: 'linear',
          y: records.map((x) => x.mem_info_cached),
        },
        {
          id: 'mem_info_free',
          name: 'mem_info_free',
          unit: 'GB',
          color: colorPalete[6 % colorPalete.length],
          axisId: 'y',
          checked: false,
          type: 'linear',
          y: records.map((x) => x.mem_info_free),
        },
        {
          id: 'mem_info_swap_free',
          name: 'mem_info_swap_free',
          unit: 'GB',
          color: colorPalete[7 % colorPalete.length],
          axisId: 'y',
          checked: false,
          type: 'linear',
          y: records.map((x) => x.mem_info_swap_free),
        },
        {
          id: 'mem_info_swap_total',
          name: 'mem_info_swap_total',
          unit: 'GB',
          color: colorPalete[8 % colorPalete.length],
          axisId: 'y',
          checked: false,
          type: 'linear',
          y: records.map((x) => x.mem_info_swap_total),
        },
        {
          id: 'mem_info_total',
          name: 'mem_info_total',
          unit: 'GB',
          color: colorPalete[9 % colorPalete.length],
          axisId: 'y',
          checked: false,
          type: 'linear',
          y: records.map((x) => x.mem_info_total),
        },
      ],
      axisInfo,
    },
  };
  return charts;
}

function createChartsIotRelay(records: any[], refTs: Date) {
  const commonX = records.map((x) => ((new Date(x.ts)).getTime() - refTs.getTime()));
  const axisInfo: ChartData['axisInfo'] = {
    x: { domain: ['dataMin', 'dataMax'] },
    y: {
      y: { domain: [0, 'dataMax'] },
    },
  };
  const charts: { [id: string]: ChartData } = {
    unico: {
      commonX,
      lines: [
        {
          id: 'http_reqs',
          name: 'http_reqs',
          color: colorPalete[0],
          axisId: 'y',
          checked: true,
          type: 'linear',
          y: records.map((x) => x.http_reqs),
        },
        {
          id: 'command_reqs',
          name: 'command_reqs',
          color: colorPalete[1],
          axisId: 'y',
          checked: true,
          type: 'linear',
          y: records.map((x) => x.command_reqs),
        },
        {
          id: 'b0_commands_sent',
          name: 'b0_commands_sent',
          color: colorPalete[2],
          axisId: 'y',
          checked: true,
          type: 'linear',
          y: records.map((x) => x.b0_commands_sent),
        },
        {
          id: 'b0_commands_error',
          name: 'b0_commands_error',
          color: colorPalete[3],
          axisId: 'y',
          checked: true,
          type: 'linear',
          y: records.map((x) => x.b0_commands_error),
        },
        {
          id: 'b1_commands_sent',
          name: 'b1_commands_sent',
          color: colorPalete[4],
          axisId: 'y',
          checked: true,
          type: 'linear',
          y: records.map((x) => x.b1_commands_sent),
        },
        {
          id: 'b1_commands_error',
          name: 'b1_commands_error',
          color: colorPalete[5],
          axisId: 'y',
          checked: true,
          type: 'linear',
          y: records.map((x) => x.b1_commands_error),
        },
      ],
      axisInfo,
    },
  };
  return charts;
}

export default withTransaction('ServersMonitoring', 'component')(ServersMonitoring);

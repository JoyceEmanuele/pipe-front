import { useEffect } from 'react';
import {
  Button,
  Loader,
  Input,
} from 'components';
import { toast } from 'react-toastify';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, apiCallDownload } from 'providers';
import { AnalysisFilters } from '../../../Analysis/AnalysisFilters';
import moment from 'moment';
import { InputNumber, StyleSelect, CustomAnalysis } from '../styles';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { useTranslation } from 'react-i18next';

export function MedicaoTempDuts(): JSX.Element {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    endDate: moment().subtract(1, 'days'),
    periodTelemetria: '',
    isLoading: false,
    dayStart: new Date(Date.now() - 30 * (24 * 60 * 60 * 1000)).toISOString().substring(0, 10),
    workPeriod: {},
    dayEnd: new Date(Date.now()).toISOString().substring(0, 10),
    clients: [] as { value: string, name: string }[],
    selectedClient: [] as any | any[],
    units: [] as { value: string, name: string }[],
    duts: [] as { value: string, name: string }[],
    dutsInfo: {},
    selectedDuts: [] as string[],
    selectedUnits: [] as any | any[],
    usageData: [] as { id: string, clientName: string, unitName: string, namb: string, telemetry: string[][], temperature: number[], typeAmbHour: any }[],
    async fetchServerData() {
      try {
        setState({ isLoading: true });
        const test = await apiCall('/clients/get-clients-list', {});
        state.clients = test.list.map((client) => ({
          value: client.CLIENT_ID.toString(),
          name: client.NAME,
        }));
        if (state.selectedClient.length > 0) {
          const getWorksPeriod = await apiCall('/clients/get-roomtypes-list', { CLIENT_ID: state.selectedClient });
          getWorksPeriod.rtypes.forEach((item) => { state.workPeriod[item.RTYPE_ID] = { work: item.workPeriods }; });
          const { list } = await apiCall('/get-units-list-page', {
            clientIds: [Number(state.selectedClient)],
          });
          state.units = list.map((unit) => ({
            value: unit.UNIT_ID.toString(),
            name: unit.UNIT_NAME,
          }));
        }
        if (state.selectedUnits.length > 0) {
          const { list: dutsList } = await apiCall('/dut/get-duts-list', {
            unitId: Number(state.selectedUnits),
          });
          state.duts = dutsList.map((dut) => ({ value: dut.DEV_ID, name: dut.ROOM_NAME || dut.DEV_ID }));
          dutsList.forEach((item) => state.dutsInfo[item.DEV_ID] = {
            name: item.ROOM_NAME, unitName: item.UNIT_NAME, clientName: item.CLIENT_NAME, work: state.workPeriod[item.RTYPE_ID]?.work,
          });
          state.selectedDuts = dutsList.map((dut) => (
            dut.DEV_ID
          ));
        }
        setState({ isLoading: false });
        render();
      } catch (err) { console.log(err); toast.error(t('houveErro')); }
      setState({ isLoading: false });
    },
  });

  async function handleGetUnitInfo() {
    render();
    try {
      const params = {
        dutsInfo: state.dutsInfo,
        duts: state.selectedDuts,
        telemetriaFilter: state.periodTelemetria,
        dayStart: state.dayStart,
        dayEnd: state.dayEnd,
      };
      const exportResponse = await apiCallDownload('/devtools/export-duts-temperatures', params);
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || 'DUTsTemperatures.xlsx';
      link.click();
      toast.success(t('sucessoExportacao'));
      setState({ isLoading: false });
    } catch (error) {
      toast.error(t('houveErro'));
      setState({ isLoading: false });
    }
  }

  const getTempsCsvData = async () => {
    state.isLoading = true;
    render();
    const currentDate = new Date();
    const initialDate = new Date(state.dayStart);
    const finalDate = new Date(state.dayEnd);
    const timeDiff = Math.abs(finalDate.getTime() - initialDate.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (diffDays > 31) { toast.error(t('erroQuantidadeDias')); state.isLoading = false; return; }
    if (currentDate.getTime() < finalDate.getTime() || currentDate.getTime() < initialDate.getTime()) { toast.error(t('dataInvalida')); state.isLoading = false; return; }
    if (state.selectedDuts.length === 0) { toast.error(t('erroSelecionePeloMenosUmDut')); state.isLoading = false; return; }
    if (Number(state.periodTelemetria) < 5) { toast.error(t('erroPeriodicidadePeloMenos5min')); state.isLoading = false; return; }
    if (Number(state.periodTelemetria) > 43800) { toast.error(t('erroPeriodicidade')); state.isLoading = false; return; }
    await handleGetUnitInfo();
    state.isLoading = false;
  };

  useEffect(() => {
    state.fetchServerData();
  }, [state.selectedUnits, state.selectedClient]);

  return (
    <>
      { state.isLoading ? (
        <>
          <Loader />
          <a id="downloadLink" href="#" />
        </>
      ) : (
        <>
          <div
            style={{
              display: 'flex', flexWrap: 'wrap', position: 'relative', gap: '20px',
            }}
          >
            <CustomAnalysis>
              <StyleSelect>
                <label>{t('cliente')}</label>
                <SelectSearch
                  options={state.clients}
                  value={state.selectedClient}
                  search
                  printOptions="on-focus"
                  filterOptions={fuzzySearch}
                  closeOnSelect
                  onChange={(value, index) => { setState({
                    selectedClient: value, selectedDuts: [], selectedUnits: [], dutsInfo: {}, duts: [],
                  }); render(); }}
                  placeholder={t('selecioneCliente')}
                  label={t('cliente')}
                />
              </StyleSelect>
              <StyleSelect>
                <label>{t('unidade')}</label>
                <SelectSearch
                  options={state.units}
                  value={state.selectedUnits}
                  search
                  printOptions="on-focus"
                  filterOptions={fuzzySearch}
                  closeOnSelect
                  onChange={(value, index) => { setState({ selectedDuts: [], duts: [], selectedUnits: value }); render(); }}
                  placeholder={t('selecioneUnidade')}
                  label={t('unidade')}
                />
              </StyleSelect>
              <AnalysisFilters
                filters={[{
                  label: `DUTs - ${state.selectedDuts.length} ${t('selecionados')}`,
                  placeholder: t('selecioneDuts'),
                  options: state.duts,
                  value: state.selectedDuts,
                  onChange: (value) => { state.selectedDuts = value; render(); },
                  index: 2,
                }]}
                isLoading={state.isLoading}
                onApply={() => {}}
                dielTool
              />
            </CustomAnalysis>
            <div>
              <InputNumber>
                <label>{t('periodicidadeTelemetria')}</label>
                <input type="number" id="telemetria" min="5" placeholder={t('minutos')} value={state.periodTelemetria} onChange={(e) => setState({ periodTelemetria: e.target.value })} />
              </InputNumber>
              <p
                style={{
                  padding: '5px 0 0 38px', fontSize: '11px', position: 'absolute', zIndex: '1',
                }}
              >
                { Number(state.periodTelemetria) >= 5
                  ? ''
                  : t('peloMenos5Minutos')}
              </p>
            </div>
            <div>
              <Input
                value={state.dayStart}
                onChange={(e) => setState({ dayStart: e.target.value })}
                placeholder="YYYY-MM-DD"
                label={t('dataInicial')}
                style={{ width: '130px' }}
              />
            </div>
            <div>
              <Input
                value={state.dayEnd}
                onChange={(e) => setState({ dayEnd: e.target.value })}
                placeholder="YYYY-MM-DD"
                label={t('dataFinal')}
                style={{ width: '130px' }}
              />
            </div>
            <div>
              <Button variant="blue" onClick={() => getTempsCsvData()} style={{ width: '200px' }}>
                {t('botaoExportar')}
              </Button>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            {Number(state.periodTelemetria) >= 5
            && (
            <>
              <strong>{t('informacaoExportacao')}</strong>
              <p>
                {t('seraCalculadaMediaTemperaturas')}
                {' '}
                {state.periodTelemetria}
                {` ${t('em')} `}
                {state.periodTelemetria}
                {' '}
                {`${t('minutos')}.`}
              </p>
            </>
            )}
          </div>
          <a id="downloadLink" href="#" />
        </>
      )}
    </>
  );
}

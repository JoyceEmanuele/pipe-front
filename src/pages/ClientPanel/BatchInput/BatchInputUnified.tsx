import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Loader, Button, Checkbox } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import {
  apiCall,
  ApiResps,
  apiCallFormData,
  apiCallDownload,
} from 'providers';
import { CustomizedButton } from '~/components/CutomizedButton';
import {
  FileInput,
  BottonTypeSolution,
  PreFillGuideArea,
  ContainerExportationAndDowload,
  StyleSelect,
  Label,
  Table,
} from './styles';
import { useTranslation } from 'react-i18next';
import { colors } from '~/styles/colors';
import { Option, stateObject } from '../../../helpers/batchInputHelpers';
import { PreFillGuide } from './PreFillGuide';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { AxiosError } from 'axios';
import { LoaderWithText } from '~/components/LoaderWithText';
import { formatNumber } from '~/helpers/formatNumber';

export const BatchInputUnified = ({ clientId }): JSX.Element => {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar(stateObject());
  const [typesOfSolutions, setTypesOfSolutions] = useState([
    { name: t('energia'), value: 'energy', checked: false },
    { name: t('maquina'), value: 'machine', checked: false },
    { name: t('agua'), value: 'water', checked: false },
    { name: t('ambiente'), value: 'environment', checked: false },
    { name: t('unidade'), value: 'unit', checked: false },
    { name: t('iluminacao'), value: 'illumination', checked: false },
    { name: 'Nobreak', value: 'nobreak', checked: false },
  ]);

  useEffect(() => {
    fetchServerData();
  }, []);

  function generateFancoilOptions(comboOpts: ApiResps['/dev/dev-info-combo-options']) {
    if (!comboOpts.fancoils) return;

    const thermManufOpts: Option[] = [];
    const fancoilManufOpts: Option[] = [];
    const valveManufOpts: Option[] = [];

    for (const fancoil of comboOpts.fancoils) {
      if (fancoil.label === 'Outro (digitar)') continue;
      if (fancoil.type === 'THERM_MANUF') thermManufOpts.push({ value: fancoil.value, label: fancoil.label });
      if (fancoil.type === 'VALVE_MANUF') valveManufOpts.push({ value: fancoil.value, label: fancoil.label });
      if (fancoil.type === 'FANCOIL_MANUF') fancoilManufOpts.push({ value: fancoil.value, label: fancoil.label });
    }

    state.comboOpts = {
      ...comboOpts,
      fancoilsManuf: fancoilManufOpts,
      fancoilsThermManuf: thermManufOpts,
      fancoilsValveManuf: valveManufOpts,
    };
  }

  async function fetchServerData() {
    try {
      const [
        { unified: fetchedColumns },
        comboOpts,
        energyOpts,
      ] = await Promise.all([
        apiCall('/batch-input-columns', { unified: true }),
        apiCall('/dev/dev-info-combo-options', {
          CLIENT_ID: clientId,
          units: true,
          groups: true,
          fluids: true,
          applics: true,
          types: true,
          envs: true,
          vavs: true,
          brands: true,
          roles: true,
          psens: true,
          rtypes: true,
          dutPlacement: true,
          evaporatorModels: true,
          fancoils: true,
        }),
        await apiCall('/energy/get-energy-combo-opts', {}),
      ]);
      const dielManufInfo = energyOpts.manufacturersList.find((x) => x.NAME === 'Diel Energia');
      const filteredModels = energyOpts.modelsList.filter((x) => x.MANUFACTURER_ID === dielManufInfo!.MANUFACTURER_ID);
      if (comboOpts.applics) {
        comboOpts.applics.push({ value: 'Medidor de Energia', label: 'Medidor de Energia' }, { value: 'Carrier ECOSPLIT', label: 'Carrier ECOSPLIT' });
      }
      state.comboOpts = comboOpts;
      generateFancoilOptions(comboOpts);
      state.energyOpts = filteredModels;
      state.columns = fetchedColumns;
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.isLoading = false; render();
  }

  async function exportUnitUnified() {
    if (state.isLoading) return;
    state.isExporting = true;
    render();
    try {
      const exportResponse = await apiCallDownload('/export-client-unified-batch-input', {
        clientId,
        units: state.selectedUnit.map((item) => Number(item)),
        typeOfSolutions: state.selectedTypeOfSolution,
      });
      state.isExporting = false;
      render();
      const link: any = document.getElementById('downloadLink');
      if (link?.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || 'Unificada.xlsx';
      link.click();
      toast.success(t('sucessoExportacao'));
    } catch (err) {
      console.log(err);
      state.isExporting = false;
      render();
      toast.error(t('naoFoiPossivelExportar'));
    }
  }

  async function exportExempleFileUnified() {
    if (state.isLoading) return;
    try {
      const exportResponse = await apiCallDownload('/unified/export-unified-example', {});
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || 'Exemplo-Unificado.xlsx';
      link.click();
      toast.success(t('sucessoExportacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('naoFoiPossivelExportar'));
    }
  }

  async function onChange_textAreaUnidades(fileRef: any) {
    setState({ isSending: true, parsedRows: [] });
    try {
      const { list, tableCols, tableColsAdditionalParameters } = await apiCallFormData('/check-client-unified-batch', {
        CLIENT_ID: clientId,
      }, {
        file: fileRef,
      });
      state.parsedColsAdditionalParameters = tableColsAdditionalParameters;
      state.parsedRows = list;
      state.parsedCols = tableCols;
    } catch (err) {
      console.log(err);
      const error = err as AxiosError;
      if (error.response && error.response.status !== 500) {
        toast.error(error.response.data, { closeOnClick: false, draggable: false, duration: 10000 });
      } else {
        toast.error(t('erroAnalisarDadosInseridos'));
      }
      state.parsedRows = [];
    }
    setState({ isSending: false });
  }

  async function confirmouEnviar() {
    try {
      setState({ isSending: true, resultadoEnvio: {} });
      const response = await apiCall('/add-client-unified-batch', {
        CLIENT_ID: clientId,
        datas: state.parsedRows as ApiResps['/check-client-unified-batch']['list'],
      });
      for (const row of (response.added || [])) {
        if (!row.key) continue;
        state.resultadoEnvio[row.key] = t('sucessoSalvar');
      }
      for (const row of (response.ignored || [])) {
        if ((!row.key) || (!row.reason)) continue;
        state.resultadoEnvio[row.key] = state.resultadoEnvio[row.key] ? `${state.resultadoEnvio[row.key]}\n${row.reason}` : row.reason;
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    setState({ isSending: false, sended: true });
  }

  function onFilterUnitChange(units) {
    state.selectedUnit = units;
    render();
  }

  function onFilterSolutionChange(solutions) {
    state.selectedTypeOfSolution = solutions;

    render();
  }

  function selectAll() {
    const newTypeChecked = [...typesOfSolutions];
    newTypeChecked.forEach((item) => item.checked = true);
    setTypesOfSolutions(newTypeChecked);
    const newTypeSolutionSelect = newTypeChecked.map((item) => item.value);
    setState({ selectedTypeOfSolution: [...newTypeSolutionSelect] });
  }

  function clearAll() {
    typesOfSolutions.every((item) => item.checked = false);
    setState({ selectedTypeOfSolution: [] });
  }

  function selectAllUnit() {
    const allOptions = (state.comboOpts.units || []).map((unit) => ({ name: unit.label, value: unit.value }));
    setState({ selectedUnit: allOptions.map((item) => (item.value).toString()) });
  }

  function verifyColumn(parsedCols: string[], label: string, columns: { label: string, exampleList: string[] } | undefined) {
    if ((!parsedCols) || parsedCols.includes(label)) {
      return <td>{(columns || {}).label}</td>;
    }
  }

  function verifyColumnsAdditionalParameter(additionalColumns) {
    return additionalColumns.map((x, i) => <td key={i}>{x}</td>);
  }

  function verifyRowsAdditionalParameter(additionalColumns, rowAdditionalParams) {
    if (additionalColumns.length) {
      return additionalColumns.map((columnName, i) => {
        const value = rowAdditionalParams && rowAdditionalParams[columnName];
        return <td key={i}>{value || ''}</td>;
      });
    }
  }

  function verifyColumnWithoutLabel(parsedCols: string[], label: string, row: any) {
    if ((!parsedCols) || parsedCols.includes(label)) {
      return <td>{row}</td>;
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedData = event.clipboardData.getData('Text');
    const pastedItems = pastedData.split(/\r?\n/).map((item) => item.trim());
    const matchingUnits = (state.comboOpts.units || []).filter((unit) => pastedItems.includes(unit.label)).map((unit) => String(unit.value));
    const newSelectedUnits = [...new Set([...matchingUnits])];
    setState({ selectedUnit: newSelectedUnits });
    onFilterUnitChange(newSelectedUnits);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  if (state.isLoading || state.isSending) return <Loader />;
  if (state.isExporting) return <LoaderWithText text={t('exportandoPlanilha')} />;
  const columns = state.columns as ApiResps['/batch-input-columns']['unified'];

  return (
    <div>
      <h4 style={{ fontSize: '18px', padding: '20px 0px 0px 20px' }}>{t('unificado')}</h4>
      <ContainerExportationAndDowload style={{ padding: '20px' }}>
        <a href="#" style={{ display: 'none' }} id="downloadLink" />
        <h3><b>{t('exportacaodados')}</b></h3>
        <div style={{
          marginTop: '17px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: '20px',
          justifyContent: 'space-between',
          gap: '10px',
        }}
        >
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: '5px',
            }}
            >
              <StyleSelect>
                <div style={{ width: '100%', paddingTop: 3 }} onPaste={handlePaste}>
                  <Label>{t('unidades')}</Label>
                  <SelectSearch
                    options={(state.comboOpts.units || []).map((unit) => ({ name: unit.label, value: unit.value }))}
                    value={(state.selectedUnit || [])}
                    multiple
                    closeOnSelect={false}
                    printOptions="on-focus"
                    search
                    filterOptions={fuzzySearch}
                    placeholder={`${t('selecioneAsUnidades')}`}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={onFilterUnitChange}
                    // onBlur={onFilterUnitBlur}
                    disabled={state.isLoading}
                  />
                </div>
              </StyleSelect>
              <Checkbox
                style={{ justifyContent: 'unset', cursor: 'auto' }}
                label={t('Selecionar todos')}
                size={20}
                checked={(state.selectedUnit?.length === state.comboOpts.units?.length)}
                onClick={() => { (state.selectedUnit?.length === state.comboOpts.units?.length) ? setState({ selectedUnit: [] }) : selectAllUnit(); render(); }}
              />
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: '5px',
            }}
            >
              <StyleSelect>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('tiposDeSolucao')}</Label>
                  <SelectSearch
                    options={typesOfSolutions}
                    value={state.selectedTypeOfSolution}
                    multiple
                    closeOnSelect={false}
                    printOptions="on-focus"
                    search
                    filterOptions={fuzzySearch}
                    placeholder={`${t('selecioneSolucao')}`}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={(value) => onFilterSolutionChange(value)}
                    // onBlur={onFilterUnitBlur}
                    disabled={state.isLoading}
                  />
                </div>
              </StyleSelect>
              <Checkbox
                style={{ justifyContent: 'unset', cursor: 'auto' }}
                label={t('Selecionar todos')}
                size={20}
                checked={typesOfSolutions.every((item) => item.checked)}
                onClick={() => { typesOfSolutions.every((item) => item.checked) ? clearAll() : selectAll(); render(); }}
              />
            </div>
          </div>
          <CustomizedButton
            description="Exportar"
            variant="download"
            style={{ maxWidth: '130px' }}
            onClick={(_item) => exportUnitUnified()}
          />
        </div>
        {
          (state.parsedRows.length === 0) && (
            <>
              <h3><b>Upload de Dados</b></h3>
              <section style={{ marginBottom: '20px' }}>
                <CustomizedButton
                  style={{
                    backgroundColor: '#363BC4',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    width: '150px',
                    cursor: 'pointer',
                  }}
                  colorIcon="#FFFFFF"
                  description="DOWNLOAD"
                  variant="download"
                  onClick={() => exportExempleFileUnified()}
                />
                <p>
                  <b>{t('orientacoes')}</b>
                  <br />
                  {t('baixeEUtilizeComoModelo')}
                  <br />
                  {t('preenchaTabelaXlsx')}
                  <br />
                  {t('obsData')}
                  <br />
                  {t('obsParametroAdicional')}
                  <br />
                </p>
                <FileInput
                  onChange={(e: any) => { onChange_textAreaUnidades(e.target.files[0]); }}
                  style={{
                    backgroundColor: '#363BC4',
                    borderColor: colors.Blue300,
                    borderRadius: '5px',
                    boxShadow: 'unset',
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    width: '200px',
                    textAlign: 'center',
                    marginTop: '15px',
                  }}
                  >
                    {t('selecionarArquivo')}
                  </span>
                  <input type="file" hidden />
                </FileInput>
              </section>
            </>
          )
        }
        {(state.parsedRows.length > 0) && (
          <>
            <h3><b>{t('previsualizacaoEnvio')}</b></h3>
            <div style={{ overflow: 'auto' }}>
              <Table>
                <thead>
                  <tr>
                    <th>{t('status')}</th>
                    {verifyColumn(state.parsedCols, 'SOLUTION_TYPE', columns?.SOLUTION_TYPE)}
                    {verifyColumn(state.parsedCols, 'UNIT_NAME', columns?.UNIT_NAME)}
                    {verifyColumn(state.parsedCols, 'UNIT_ID', columns?.UNIT_ID)}
                    {verifyColumn(state.parsedCols, 'UNIT_CODE_CELSIUS', columns?.UNIT_CODE_CELSIUS)}
                    {verifyColumn(state.parsedCols, 'UNIT_CODE_API', columns?.UNIT_CODE_API)}
                    {verifyColumn(state.parsedCols, 'COUNTRY', columns?.COUNTRY)}
                    {verifyColumn(state.parsedCols, 'STATE_ID', columns?.STATE_ID)}
                    {verifyColumn(state.parsedCols, 'CITY_NAME', columns?.CITY_NAME)}
                    {verifyColumn(state.parsedCols, 'TIME_ZONE', columns?.TIME_ZONE)}
                    {verifyColumn(state.parsedCols, 'CONSTRUCTED_AREA', columns?.CONSTRUCTED_AREA)}
                    {verifyColumn(state.parsedCols, 'UNIT_STATUS', columns?.UNIT_STATUS)}
                    {verifyColumn(state.parsedCols, 'LATLONG', columns?.LATLONG)}
                    {verifyColumn(state.parsedCols, 'ADDRESS', columns?.ADDRESS)}
                    {verifyColumn(state.parsedCols, 'AMOUNT_PEOPLE', columns?.AMOUNT_PEOPLE)}
                    {verifyColumn(state.parsedCols, 'ICCID', columns?.ICCID)}
                    {verifyColumn(state.parsedCols, 'ACCESSPOINT', columns?.ACCESSPOINT)}
                    {verifyColumn(state.parsedCols, 'MODEM', columns?.MODEM)}
                    {verifyColumn(state.parsedCols, 'MACACCESSPOINT', columns?.MACACCESSPOINT)}
                    {verifyColumn(state.parsedCols, 'MACREPEATER', columns?.MACREPEATER)}
                    {verifyColumn(state.parsedCols, 'SIMCARD_PHOTO1', columns?.SIMCARD_PHOTO1)}
                    {verifyColumn(state.parsedCols, 'SIMCARD_PHOTO2', columns?.SIMCARD_PHOTO2)}
                    {verifyColumn(state.parsedCols, 'SIMCARD_PHOTO3', columns?.SIMCARD_PHOTO3)}
                    {verifyColumn(state.parsedCols, 'SKETCH_1', columns?.SKETCH_1)}
                    {verifyColumn(state.parsedCols, 'SKETCH_2', columns?.SKETCH_2)}
                    {verifyColumn(state.parsedCols, 'SKETCH_3', columns?.SKETCH_3)}
                    {verifyColumn(state.parsedCols, 'SKETCH_4', columns?.SKETCH_4)}
                    {verifyColumn(state.parsedCols, 'SKETCH_5', columns?.SKETCH_5)}
                    {verifyColumn(state.parsedCols, 'GROUP_ID', columns?.GROUP_ID)}
                    {verifyColumn(state.parsedCols, 'GROUP_NAME', columns?.GROUP_NAME)}
                    {verifyColumn(state.parsedCols, 'INSTALLATION_DATE', columns?.INSTALLATION_DATE)}
                    {verifyColumn(state.parsedCols, 'MCHN_APPL', columns?.MCHN_APPL)}
                    {verifyColumn(state.parsedCols, 'GROUP_TYPE', columns?.GROUP_TYPE)}
                    {verifyColumn(state.parsedCols, 'MCHN_BRAND', columns?.MCHN_BRAND)}
                    {verifyColumn(state.parsedCols, 'FLUID_TYPE', columns?.FLUID_TYPE)}
                    {verifyColumn(state.parsedCols, 'MACHINE_RATED_POWER', columns?.MACHINE_RATED_POWER)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DEVGROUPS_1', columns?.PHOTO_DEVGROUPS_1)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DEVGROUPS_2', columns?.PHOTO_DEVGROUPS_2)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DEVGROUPS_3', columns?.PHOTO_DEVGROUPS_3)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DEVGROUPS_4', columns?.PHOTO_DEVGROUPS_4)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DEVGROUPS_5', columns?.PHOTO_DEVGROUPS_5)}
                    {verifyColumn(state.parsedCols, 'DEV_AUTOM_ID', columns?.DEV_AUTOM_ID)}
                    {verifyColumn(state.parsedCols, 'PLACEMENT', columns?.PLACEMENT)}
                    {verifyColumn(state.parsedCols, 'SENSORS_DUT_DUO', columns?.SENSORS_DUT_DUO)}
                    {verifyColumn(state.parsedCols, 'DAM_INSTALLATION_LOCATION', columns?.DAM_INSTALLATION_LOCATION)}
                    {verifyColumn(state.parsedCols, 'DAM_PLACEMENT', columns?.DAM_PLACEMENT)}
                    {verifyColumn(state.parsedCols, 'DAM_T0_POSITION', columns?.DAM_T0_POSITION)}
                    {verifyColumn(state.parsedCols, 'DAM_T1_POSITION', columns?.DAM_T1_POSITION)}
                    {verifyColumn(state.parsedCols, 'PHOTO_AUTOM_DEV_1', columns?.PHOTO_AUTOM_DEV_1)}
                    {verifyColumn(state.parsedCols, 'PHOTO_AUTOM_DEV_2', columns?.PHOTO_AUTOM_DEV_2)}
                    {verifyColumn(state.parsedCols, 'PHOTO_AUTOM_DEV_3', columns?.PHOTO_AUTOM_DEV_3)}
                    {verifyColumn(state.parsedCols, 'PHOTO_AUTOM_DEV_4', columns?.PHOTO_AUTOM_DEV_4)}
                    {verifyColumn(state.parsedCols, 'PHOTO_AUTOM_DEV_5', columns?.PHOTO_AUTOM_DEV_5)}
                    {verifyColumn(state.parsedCols, 'DUT_ID', columns?.DUT_ID)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DUT_1', columns?.PHOTO_DUT_1)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DUT_2', columns?.PHOTO_DUT_2)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DUT_3', columns?.PHOTO_DUT_3)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DUT_4', columns?.PHOTO_DUT_4)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DUT_5', columns?.PHOTO_DUT_5)}
                    {verifyColumn(state.parsedCols, 'ROOM_NAME', columns?.ROOM_NAME)}
                    {verifyColumn(state.parsedCols, 'RTYPE_NAME', columns?.RTYPE_NAME)}
                    {verifyColumn(state.parsedCols, 'DAT_ID', columns?.DAT_ID)}
                    {verifyColumn(state.parsedCols, 'AST_DESC', columns?.AST_DESC)}
                    {verifyColumn(state.parsedCols, 'AST_ROLE_NAME', columns?.AST_ROLE_NAME)}
                    {verifyColumn(state.parsedCols, 'MCHN_MODEL', columns?.MCHN_MODEL)}
                    {verifyColumn(state.parsedCols, 'CAPACITY_PWR', columns?.CAPACITY_PWR)}
                    {verifyColumn(state.parsedCols, 'DAC_COP', columns?.DAC_COP)}
                    {verifyColumn(state.parsedCols, 'MCHN_KW', columns?.MCHN_KW)}
                    {verifyColumn(state.parsedCols, 'EVAPORATOR_MODEL', columns?.EVAPORATOR_MODEL)}
                    {verifyColumn(state.parsedCols, 'INSUFFLATION_SPEED', columns?.INSUFFLATION_SPEED)}
                    {verifyColumn(state.parsedCols, 'COMPRESSOR_RLA', columns?.COMPRESSOR_RLA)}
                    {verifyColumn(state.parsedCols, 'EQUIPMENT_POWER', columns?.EQUIPMENT_POWER)}
                    {verifyColumn(state.parsedCols, 'PHOTO_ASSET_1', columns?.PHOTO_ASSET_1)}
                    {verifyColumn(state.parsedCols, 'PHOTO_ASSET_2', columns?.PHOTO_ASSET_2)}
                    {verifyColumn(state.parsedCols, 'PHOTO_ASSET_3', columns?.PHOTO_ASSET_3)}
                    {verifyColumn(state.parsedCols, 'PHOTO_ASSET_4', columns?.PHOTO_ASSET_4)}
                    {verifyColumn(state.parsedCols, 'PHOTO_ASSET_5', columns?.PHOTO_ASSET_5)}
                    {verifyColumn(state.parsedCols, 'DEV_ID', columns?.DEV_ID)}
                    {verifyColumn(state.parsedCols, 'DAC_COMIS', columns?.DAC_COMIS)}
                    {verifyColumn(state.parsedCols, 'P0_SENSOR', columns?.P0_SENSOR)}
                    {verifyColumn(state.parsedCols, 'P0_POSITN', columns?.P0_POSITN)}
                    {verifyColumn(state.parsedCols, 'P1_SENSOR', columns?.P1_SENSOR)}
                    {verifyColumn(state.parsedCols, 'P1_POSITN', columns?.P1_POSITN)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DAC_1', columns?.PHOTO_DAC_1)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DAC_2', columns?.PHOTO_DAC_2)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DAC_3', columns?.PHOTO_DAC_3)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DAC_4', columns?.PHOTO_DAC_4)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DAC_5', columns?.PHOTO_DAC_5)}
                    {verifyColumn(state.parsedCols, 'ELECTRIC_CIRCUIT_ID', columns?.ELECTRIC_CIRCUIT_ID)}
                    {verifyColumn(state.parsedCols, 'ELECTRIC_CIRCUIT_NAME', columns?.ELECTRIC_CIRCUIT_NAME)}
                    {verifyColumn(state.parsedCols, 'ENERGY_DEVICES_INFO_ID', columns?.ENERGY_DEVICES_INFO_ID)}
                    {verifyColumn(state.parsedCols, 'ID_MED_ENERGY', columns?.ID_MED_ENERGY)}
                    {verifyColumn(state.parsedCols, 'NUM_SERIE_MED_ENERGY', columns?.NUM_SERIE_MED_ENERGY)}
                    {verifyColumn(state.parsedCols, 'MODEL_MED_ENERGY', columns?.MODEL_MED_ENERGY)}
                    {verifyColumn(state.parsedCols, 'CAPACITY_TCA', columns?.CAPACITY_TCA)}
                    {verifyColumn(state.parsedCols, 'INSTALLATION_ELETRICAL_TYPE', columns?.INSTALLATION_ELETRICAL_TYPE)}
                    {verifyColumn(state.parsedCols, 'SHIPPING_INTERVAL', columns?.SHIPPING_INTERVAL)}
                    {verifyColumn(state.parsedCols, 'ROOM_VAV', columns?.ROOM_VAV)}
                    {verifyColumn(state.parsedCols, 'THERM_MANUF', columns?.THERM_MANUF)}
                    {verifyColumn(state.parsedCols, 'THERM_MODEL', columns?.THERM_MODEL)}
                    {verifyColumn(state.parsedCols, 'VALVE_MANUF', columns?.VALVE_MANUF)}
                    {verifyColumn(state.parsedCols, 'VALVE_MODEL', columns?.VALVE_MODEL)}
                    {verifyColumn(state.parsedCols, 'VALVE_TYPE', columns?.VALVE_TYPE)}
                    {verifyColumn(state.parsedCols, 'BOX_MANUF', columns?.BOX_MANUF)}
                    {verifyColumn(state.parsedCols, 'BOX_MODEL', columns?.BOX_MODEL)}
                    {verifyColumn(state.parsedCols, 'FANCOIL_MANUF', columns?.FANCOIL_MANUF)}
                    {verifyColumn(state.parsedCols, 'FANCOIL_MODEL', columns?.FANCOIL_MODEL)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DRI_1', columns?.PHOTO_DRI_1)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DRI_2', columns?.PHOTO_DRI_2)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DRI_3', columns?.PHOTO_DRI_3)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DRI_4', columns?.PHOTO_DRI_4)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DRI_5', columns?.PHOTO_DRI_5)}
                    {verifyColumn(state.parsedCols, 'DMA_ID', columns?.DMA_ID)}
                    {verifyColumn(state.parsedCols, 'HYDROMETER_MODEL', columns?.HYDROMETER_MODEL)}
                    {verifyColumn(state.parsedCols, 'INSTALLATION_LOCATION', columns?.INSTALLATION_LOCATION)}
                    {verifyColumn(state.parsedCols, 'WATER_INSTALLATION_DATE', columns?.WATER_INSTALLATION_DATE)}
                    {verifyColumn(state.parsedCols, 'TOTAL_CAPACITY', columns?.TOTAL_CAPACITY)}
                    {verifyColumn(state.parsedCols, 'TOTAL_RESERVOIRS', columns?.TOTAL_RESERVOIRS)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DMA_1', columns?.PHOTO_DMA_1)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DMA_2', columns?.PHOTO_DMA_2)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DMA_3', columns?.PHOTO_DMA_3)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DMA_4', columns?.PHOTO_DMA_4)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DMA_5', columns?.PHOTO_DMA_5)}
                    {verifyColumn(state.parsedCols, 'UTILITY_ID', columns?.UTILITY_ID)}
                    {verifyColumn(state.parsedCols, 'UTILITY_NAME', columns?.UTILITY_NAME)}
                    {verifyColumn(state.parsedCols, 'INSTALLATION_DATE_UTIL', columns?.INSTALLATION_DATE_UTIL)}
                    {verifyColumn(state.parsedCols, 'DISTRIBUTOR', columns?.DISTRIBUTOR)}
                    {verifyColumn(state.parsedCols, 'MODEL', columns?.MODEL)}
                    {verifyColumn(state.parsedCols, 'ENTRY_VOLTAGE', columns?.ENTRY_VOLTAGE)}
                    {verifyColumn(state.parsedCols, 'OUT_VOLTAGE', columns?.OUT_VOLTAGE)}
                    {verifyColumn(state.parsedCols, 'POT_NOMINAL', columns?.POT_NOMINAL)}
                    {verifyColumn(state.parsedCols, 'AUTON_NOMINAL', columns?.AUTON_NOMINAL)}
                    {verifyColumn(state.parsedCols, 'INPUT_ELECTRIC_CURRENT', columns?.INPUT_ELECTRIC_CURRENT)}
                    {verifyColumn(state.parsedCols, 'OUTPUT_ELECTRIC_CURRENT', columns?.OUTPUT_ELECTRIC_CURRENT)}
                    {verifyColumn(state.parsedCols, 'NOMINAL_BATTERY_CAPACITY', columns?.NOMINAL_BATTERY_CAPACITY)}
                    {verifyColumn(state.parsedCols, 'GRID_VOLTAGE', columns?.GRID_VOLTAGE)}
                    {verifyColumn(state.parsedCols, 'MAINS_CURRENT', columns?.MAINS_CURRENT)}
                    {verifyColumn(state.parsedCols, 'ASSOCIATE_DEV', columns?.ASSOCIATE_DEV)}
                    {verifyColumn(state.parsedCols, 'ASSOCIATE_DEV_PORT', columns?.ASSOCIATE_DEV_PORT)}
                    {verifyColumn(state.parsedCols, 'FEEDBACK_DAL', columns?.FEEDBACK_DAL)}
                    {verifyColumn(state.parsedCols, 'ASSOCIATE_ASSET', columns?.ASSOCIATE_ASSET)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DMT', columns?.PHOTO_DMT)}
                    {verifyColumn(state.parsedCols, 'PHOTO_DAL', columns?.PHOTO_DAL)}
                    {verifyColumn(state.parsedCols, 'PHOTO_UTILITY', columns?.PHOTO_UTILITY)}
                    {verifyColumnsAdditionalParameter(state.parsedColsAdditionalParameters)}
                  </tr>
                </thead>
                <tbody>
                  {state.parsedRows.map((row) => (
                    <tr key={row.key}>
                      <td>
                        <pre style={{ margin: '0' }}>{row.errors.map((e) => e.message).join('\n') || 'OK'}</pre>
                        {state.resultadoEnvio[row.key] && <div><pre>{state.resultadoEnvio[row.key]}</pre></div>}
                      </td>
                      {verifyColumnWithoutLabel(state.parsedCols, 'SOLUTION_TYPE', row.SOLUTION_TYPE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'UNIT_NAME', row.UNIT_NAME)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'UNIT_ID', row.UNIT_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'UNIT_CODE_CELSIUS', row.UNIT_CODE_CELSIUS)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'UNIT_CODE_API', row.UNIT_CODE_API)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'COUNTRY', row.COUNTRY)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'STATE_ID', row.STATE_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'CITY_NAME', row.CITY_NAME)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'TIME_ZONE', row.TIME_ZONE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'CONSTRUCTED_AREA', row.CONSTRUCTED_AREA && formatNumber(row.CONSTRUCTED_AREA))}
                      {verifyColumnWithoutLabel(state.parsedCols, 'UNIT_STATUS', row.UNIT_STATUS)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'LATLONG', row.LATLONG)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ADDRESS', row.ADDRESS)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'AMOUNT_PEOPLE', row.AMOUNT_PEOPLE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ICCID', row.ICCID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ACCESSPOINT', row.ACCESSPOINT)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MODEM', row.MODEM)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MACACCESSPOINT', row.MACACCESSPOINT)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MACREPEATER', row.MACREPEATER)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'SIMCARD_PHOTO1', row.SIMCARD_PHOTO1)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'SIMCARD_PHOTO2', row.SIMCARD_PHOTO2)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'SIMCARD_PHOTO3', row.SIMCARD_PHOTO3)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'SKETCH_1', row.SKETCH_1)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'SKETCH_2', row.SKETCH_2)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'SKETCH_3', row.SKETCH_3)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'SKETCH_4', row.SKETCH_4)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'SKETCH_5', row.SKETCH_5)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'GROUP_ID', row.GROUP_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'GROUP_NAME', row.GROUP_NAME)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'INSTALLATION_DATE', row.INSTALLATION_DATE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MCHN_APPL', row.MCHN_APPL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'GROUP_TYPE', row.GROUP_TYPE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MCHN_BRAND', row.MCHN_BRAND)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'FLUID_TYPE', row.FLUID_TYPE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MACHINE_RATED_POWER', row.MACHINE_RATED_POWER)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DEVGROUPS_1', row.PHOTO_DEVGROUPS_1)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DEVGROUPS_2', row.PHOTO_DEVGROUPS_2)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DEVGROUPS_3', row.PHOTO_DEVGROUPS_3)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DEVGROUPS_4', row.PHOTO_DEVGROUPS_4)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DEVGROUPS_5', row.PHOTO_DEVGROUPS_5)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DEV_AUTOM_ID', row.DEV_AUTOM_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PLACEMENT', row.PLACEMENT)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'SENSORS_DUT_DUO', row.SENSORS_DUT_DUO)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DAM_INSTALLATION_LOCATION', row.DAM_INSTALLATION_LOCATION)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DAM_PLACEMENT', row.DAM_PLACEMENT)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DAM_T0_POSITION', row.DAM_T0_POSITION)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DAM_T1_POSITION', row.DAM_T1_POSITION)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_AUTOM_DEV_1', row.PHOTO_AUTOM_DEV_1)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_AUTOM_DEV_2', row.PHOTO_AUTOM_DEV_2)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_AUTOM_DEV_3', row.PHOTO_AUTOM_DEV_3)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_AUTOM_DEV_4', row.PHOTO_AUTOM_DEV_4)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_AUTOM_DEV_5', row.PHOTO_AUTOM_DEV_5)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DUT_ID', row.DUT_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DUT_1', row.PHOTO_DUT_1)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DUT_2', row.PHOTO_DUT_2)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DUT_3', row.PHOTO_DUT_3)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DUT_4', row.PHOTO_DUT_4)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DUT_5', row.PHOTO_DUT_5)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ROOM_NAME', row.ROOM_NAME)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'RTYPE_NAME', row.RTYPE_NAME)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DAT_ID', row.DAT_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'AST_DESC', row.AST_DESC)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'AST_ROLE_NAME', row.AST_ROLE_NAME)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MCHN_MODEL', row.MCHN_MODEL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'CAPACITY_PWR', row.CAPACITY_PWR)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DAC_COP', row.DAC_COP)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MCHN_KW', row.MCHN_KW)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'EVAPORATOR_MODEL', row.EVAPORATOR_MODEL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'INSUFFLATION_SPEED', row.INSUFFLATION_SPEED)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'COMPRESSOR_RLA', row.COMPRESSOR_RLA)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'EQUIPMENT_POWER', row.EQUIPMENT_POWER)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_ASSET_1', row.PHOTO_ASSET_1)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_ASSET_2', row.PHOTO_ASSET_2)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_ASSET_3', row.PHOTO_ASSET_3)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_ASSET_4', row.PHOTO_ASSET_4)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_ASSET_5', row.PHOTO_ASSET_5)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DEV_ID', row.DEV_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DAC_COMIS', row.DAC_COMIS)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'P0_SENSOR', row.P0_SENSOR)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'P0_POSITN', row.P0_POSITN)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'P1_SENSOR', row.P1_SENSOR)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'P1_POSITN', row.P1_POSITN)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DAC_1', row.PHOTO_DAC_1)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DAC_2', row.PHOTO_DAC_2)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DAC_3', row.PHOTO_DAC_3)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DAC_4', row.PHOTO_DAC_4)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DAC_5', row.PHOTO_DAC_5)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ELECTRIC_CIRCUIT_ID', row.ELECTRIC_CIRCUIT_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ELECTRIC_CIRCUIT_NAME', row.ELECTRIC_CIRCUIT_NAME)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ENERGY_DEVICES_INFO_ID', row.ENERGY_DEVICES_INFO_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ID_MED_ENERGY', row.ID_MED_ENERGY)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'NUM_SERIE_MED_ENERGY', row.NUM_SERIE_MED_ENERGY)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MODEL_MED_ENERGY', row.MODEL_MED_ENERGY)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'CAPACITY_TCA', row.CAPACITY_TCA)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'INSTALLATION_ELETRICAL_TYPE', row.INSTALLATION_ELETRICAL_TYPE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'SHIPPING_INTERVAL', row.SHIPPING_INTERVAL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ROOM_VAV', row.ROOM_VAV)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'THERM_MANUF', row.THERM_MANUF)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'THERM_MODEL', row.THERM_MODEL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'VALVE_MANUF', row.VALVE_MANUF)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'VALVE_MODEL', row.VALVE_MODEL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'VALVE_TYPE', row.VALVE_TYPE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'BOX_MANUF', row.BOX_MANUF)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'BOX_MODEL', row.BOX_MODEL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'FANCOIL_MANUF', row.FANCOIL_MANUF)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'FANCOIL_MODEL', row.FANCOIL_MODEL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DRI_1', row.PHOTO_DRI_1)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DRI_2', row.PHOTO_DRI_2)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DRI_3', row.PHOTO_DRI_3)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DRI_4', row.PHOTO_DRI_4)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DRI_5', row.PHOTO_DRI_5)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DMA_ID', row.DMA_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'HYDROMETER_MODEL', row.HYDROMETER_MODEL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'INSTALLATION_LOCATION', row.INSTALLATION_LOCATION)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'WATER_INSTALLATION_DATE', row.WATER_INSTALLATION_DATE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'TOTAL_CAPACITY', row.TOTAL_CAPACITY)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'TOTAL_RESERVOIRS', row.TOTAL_RESERVOIRS)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DMA_1', row.PHOTO_DMA_1)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DMA_2', row.PHOTO_DMA_2)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DMA_3', row.PHOTO_DMA_3)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DMA_4', row.PHOTO_DMA_4)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DMA_5', row.PHOTO_DMA_5)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'UTILITY_ID', row.UTILITY_ID)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'UTILITY_NAME', row.UTILITY_NAME)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'INSTALLATION_DATE_UTIL', row.INSTALLATION_DATE_UTIL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'DISTRIBUTOR', row.DISTRIBUTOR)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MODEL', row.MODEL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ENTRY_VOLTAGE', row.ENTRY_VOLTAGE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'OUT_VOLTAGE', row.OUT_VOLTAGE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'POT_NOMINAL', row.POT_NOMINAL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'AUTON_NOMINAL', row.AUTON_NOMINAL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'INPUT_ELECTRIC_CURRENT', row.INPUT_ELECTRIC_CURRENT)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'OUTPUT_ELECTRIC_CURRENT', row.OUTPUT_ELECTRIC_CURRENT)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'NOMINAL_BATTERY_CAPACITY', row.NOMINAL_BATTERY_CAPACITY)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'GRID_VOLTAGE', row.GRID_VOLTAGE)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'MAINS_CURRENT', row.MAINS_CURRENT)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ASSOCIATE_DEV', row.ASSOCIATE_DEV)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ASSOCIATE_DEV_PORT', row.ASSOCIATE_DEV_PORT)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'FEEDBACK_DAL', row.FEEDBACK_DAL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'ASSOCIATE_ASSET', row.ASSOCIATE_ASSET)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DMT', row.PHOTO_DMT)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_DAL', row.PHOTO_DAL)}
                      {verifyColumnWithoutLabel(state.parsedCols, 'PHOTO_UTILITY', row.PHOTO_UTILITY)}
                      {verifyRowsAdditionalParameter(state.parsedColsAdditionalParameters, row.ADDITIONAL_PARAMETERS)}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div style={{ display: 'flex', paddingTop: '30px' }}>
              {!state.sended
                && (
                <Button style={{ width: '140px' }} onClick={confirmouEnviar} variant="primary">
                  {t('botaoEnviar')}
                </Button>
                )}
              {!state.sended
                && (
                  <Button style={{ width: '140px', margin: '0 20px' }} onClick={() => setState({ parsedRows: [], sended: false })} variant="grey">
                    {t('cancelar')}
                  </Button>
                )}
              {state.sended && (
                <Link to={`/painel/clientes/editar-cliente/${clientId}`}>
                  <Button style={{ width: '140px', color: 'black' }} variant="grey">
                    {t('voltar')}
                  </Button>
                </Link>
              )}

            </div>
          </>
        )}
      </ContainerExportationAndDowload>
      <h3 style={{ paddingLeft: '20px', paddingBottom: '35px' }}><b>{t('guiadePreenchimento')}</b></h3>
      <PreFillGuideArea>
        <div style={{
          display: 'flex',
          gap: '5px',
          position: 'inherit',
          top: '-35px',
        }}
        >
          <BottonTypeSolution
            onClick={() => setState({ selectedTypeSolution: 'unit' })}
            isClicked={state.selectedTypeSolution === 'unit'}
            style={{ borderLeft: '0px', cursor: 'pointer' }}
          >
            Unidade
          </BottonTypeSolution>
          <BottonTypeSolution
            onClick={() => setState({ selectedTypeSolution: 'machine' })}
            isClicked={state.selectedTypeSolution === 'machine'}
            style={{ cursor: 'pointer' }}
          >
            Máquina
          </BottonTypeSolution>
          <BottonTypeSolution
            onClick={() => setState({ selectedTypeSolution: 'environment' })}
            isClicked={state.selectedTypeSolution === 'environment'}
            style={{ cursor: 'pointer' }}
          >
            Ambientes
          </BottonTypeSolution>
          <BottonTypeSolution
            onClick={() => setState({ selectedTypeSolution: 'energy' })}
            isClicked={state.selectedTypeSolution === 'energy'}
            style={{ cursor: 'pointer' }}
          >
            Energia
          </BottonTypeSolution>
          <BottonTypeSolution
            onClick={() => setState({ selectedTypeSolution: 'water' })}
            isClicked={state.selectedTypeSolution === 'water'}
            style={{ cursor: 'pointer' }}
          >
            Água
          </BottonTypeSolution>
          <BottonTypeSolution
            onClick={() => setState({ selectedTypeSolution: 'illumination' })}
            isClicked={state.selectedTypeSolution === 'illumination'}
            style={{ cursor: 'pointer' }}
          >
            Iluminação
          </BottonTypeSolution>
          <BottonTypeSolution
            onClick={() => setState({ selectedTypeSolution: 'nobreak' })}
            isClicked={state.selectedTypeSolution === 'nobreak'}
            style={{ cursor: 'pointer' }}
          >
            Nobreak
          </BottonTypeSolution>
        </div>
        <div style={{ padding: '0px 30px 30px', backgroundColor: '#FFFFFF' }}>
          <PreFillGuide
            typeOfSolution={state.selectedTypeSolution}
            comboOpts={state.comboOpts}
            energyOpts={state.energyOpts}
          />
        </div>
      </PreFillGuideArea>
    </div>
  );
};

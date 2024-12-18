import { useState, useEffect, useMemo } from 'react';

import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import IconLate from 'assets/img/status_late.svg';
import IconOffline from 'assets/img/status_offline.svg';
import IconOnline from 'assets/img/status_online.svg';
import {
  Button,
  InputSearch,
  Loader,
  Checkbox,
  Select,
  RadioButton,
  ModalWindow,
} from 'components';
import { filterByColumns, orderByColumns } from 'helpers/filterByColumns';
import { useStateVar } from 'helpers/useStateVar';
import { getUserProfile } from 'helpers/userProfile';
import { ArrowIcon } from 'icons';
import { apiCall, apiCallFormData } from 'providers';
import { colors } from 'styles/colors';

import { AdminLayout } from '../AdminLayout';
import {
  StyledLink,
  ModalContent,
  FileInput,
  FwVersTable,
  ViewMoreArrow,
  TableNew2,
} from './styles';
import { useHistory } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { withTransaction } from '@elastic/apm-rum-react';

interface FirmwareRow {
  path: string
  date: string
  fwType: 'prod' | 'test'
  fwFamily: string // dac4, dut3, dal0...
  fwVers: string
  versionNumber?: {
    vMajor: number
    vMinor: number
    vPatch: number
    vExtra?: string
  }
  fDate?: string
  fPath?: string
}

interface DeviceRow {
  DEV_ID: string
  STATE_ID: string
  CITY_NAME: string
  UNIT_NAME: string
  UNIT_ID: number
  status: string
  machineName: string
  CLIENT_NAME: string
  OTAPROCSTATUS: string
  FWVERSSTATUS: string

  devIdFamily?: string
  firmwareText?: string
  checked?: boolean
  rowKey?: string
  last_update_result?: string

  col_firmware_s?: string

  fwInfo?: {
    hardware_type: string
    firmware_version: string
    last_update_result?: string
  }
  versionNumber?: {
    vMajor: number
    vMinor: number
    vPatch: number
    vExtra?: string
  }
}

const exceptionsToRule = ['dac2', 'dac3', 'dac4', 'dut', 'dut3', 'dam2', 'dam3', 'dal'];

export interface PageState {
  allDevs: DeviceRow[],
  filteredMachines: DeviceRow[],
  isLoading: boolean,
  waitingRequest: boolean,
  csvData: {}[],
  searchState: string
  fwVersionsAllTypes: FirmwareRow[],
  fwVersionsRows: FirmwareRow[],
  fwCols: string[],
  fwFolders: string[],
  limitItems: number
  lastScrollTop: number
  openModal: null|'ModalAddFirmware'|'ModalSendOtaUpdate'|'ModalUpdateResult'|'ModalReqVersResult'|'ModalReqCertResult'
  modalReqUpdate: {
    fw: {
      [hwRev: string]: FirmwareRow|null
    }
    sending: boolean
  },
  modalUpdateResult: {
    devs: { devId: string, fwPath: string, status?: string }[]
  },
  modalReqVersResult: {
    devs: { devId: string }[]
  },
  modalReqCertResult: {
    devs: { devId: string }[]
  },
  fwStageFilter: 'prod'|'test'
  renderUpper: () => void
  renderDevsTable: () => void
}

export const AdmFirmware = () => {
  const history = useHistory();
  const [state, render, setState] = useStateVar(() => {
    const { preFiltered } = queryString.parse(history.location.search);
    const state: PageState = {
      allDevs: [],
      filteredMachines: [],
      isLoading: true,
      waitingRequest: false,
      csvData: [],
      searchState: (preFiltered || '').toString(),
      fwVersionsAllTypes: [],
      fwVersionsRows: [],
      fwCols: [],
      fwFolders: [],
      limitItems: 50,
      lastScrollTop: 0,
      openModal: null,
      modalReqUpdate: {
        fw: {},
        sending: false,
      },
      modalUpdateResult: {
        devs: [],
      },
      modalReqVersResult: {
        devs: [],
      },
      modalReqCertResult: {
        devs: [],
      },
      fwStageFilter: 'prod',
      renderUpper: () => {}, // will be replaced
      renderDevsTable: () => {}, // will be replaced
    };

    return state;
  });

  async function handleGetData() {
    try {
      setState({ isLoading: true });

      const [
        { list: _fwsList, fwHwRevs: fwFamilies },
        { list: devsList },
      ] = await Promise.all([
        apiCall('/devs/get-firmware-versions-v2', {}),
        apiCall('/devs/get-devs-fwinfo-v2', {}),
      ]);
      const fwsList: FirmwareRow[] = _fwsList;

      const fwColumns: string[] = (fwFamilies || []).map((x) => x.toUpperCase());
      for (const fw of fwsList) {
        fw.fDate = new Date(new Date(fw.date).getTime() - 3 * 60 * 60 * 1000).toISOString().substr(0, 19).replace('T', ' ');
        if (!fw.fwFamily) continue;
        const fCol = fw.fwFamily.toUpperCase();
        if (!fwColumns.includes(fCol)) {
          fwColumns.push(fCol);
        }
        fw.fPath = `[${fw.fwFamily}] ${fw.fwVers}`;
      }
      state.fwCols = fwColumns.sort();
      state.fwVersionsAllTypes = fwsList;
      state.fwVersionsRows = state.fwVersionsAllTypes.filter((item) => (!state.fwStageFilter) || (item.fwType === state.fwStageFilter));

      const fwFolders: { [type: string]: true } = {};
      for (const fwFolder of fwColumns) {
        fwFolders[fwFolder.toLowerCase()] = true;
      }

      const allDevs: DeviceRow[] = devsList;

      for (const dev of allDevs) {
        const { fwInfo, versionNumber } = dev;

        if (fwInfo && fwInfo.hardware_type) {
          fwFolders[fwInfo.hardware_type] = true;
        }
        const devIdFamily = dev.DEV_ID.substring(0, 4).toLowerCase();
        if ((devIdFamily.length === 4) && (devIdFamily[0] === 'd') && (devIdFamily[3] >= '0') && (devIdFamily[3] <= '9')) {
          dev.devIdFamily = devIdFamily;
        }

        dev.firmwareText = fwInfo ? `[${fwInfo.hardware_type}] ${fwInfo.firmware_version}` : '-';
        dev.checked = false;
        dev.rowKey = dev.DEV_ID;
        dev.last_update_result = fwInfo && fwInfo.last_update_result;

        dev.col_firmware_s = fwInfo && `[${fwInfo.hardware_type}] ${fwInfo.firmware_version}`;
        dev.versionNumber = versionNumber || { vMajor: 0, vMinor: 0, vPatch: 0 };
      }
      state.allDevs = allDevs;
      state.fwFolders = Object.keys(fwFolders);
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível carregar os dados das máquinas');
    }
    state.isLoading = false;
    render();
  }

  useEffect(() => {
    handleGetData();
  }, []);

  useEffect(() => {
    function onScroll() {
      if (!state.limitItems) return;
      if (state.limitItems >= state.filteredMachines.length) return;
      const scrollBottom = document.documentElement.scrollTop + window.innerHeight;
      const distanceToEnd = document.documentElement.scrollHeight - scrollBottom;
      if (!(distanceToEnd < 500)) return;
      if (state.lastScrollTop >= document.documentElement.scrollTop) return;
      setState({
        limitItems: state.limitItems + 200,
        lastScrollTop: document.documentElement.scrollTop,
      });
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Helmet>
        <title>Diel Energia - Máquinas</title>
      </Helmet>
      <AdminLayout />
      {state.isLoading && <Loader variant="primary" />}
      {(!state.isLoading) && (
        <>
          {/* Parte superior da página e modais (tudo que não é a tabela de dispositivos). Renderização mais leve. */}
          <UpperControls pageState={state} />

          {/* Tabela dos dispositivos. Renderização pesada. */}
          <DevsTable pageState={state} />
        </>
      )}
    </>
  );
};

function UpperControls(props: { pageState: PageState }) {
  const [profile] = useState(getUserProfile);
  const { pageState: state } = props;
  const [localState, renderUpper, setLocalState] = useStateVar({
    viewMoreFws: false,
    debounceTimer: null as null|NodeJS.Timeout,
    availableActions: [
      { label: 'Enviar Atualização', value: 'update' },
      { label: 'Solicitar Versão', value: 'fw-info' },
      { label: 'Solicitar Certificado', value: 'cert-info' },
    ],
    firmwareFamilies: {} as {
      // Tem que ter todos os hardwares que serão usados como título das colunas
      // Embaixo vai ter uma coluna por major
      [fwColName: string]: {
        [vMajorName: string]: {
          fwVers: string
          fPath: string
          fDate: string
        }[]
      }
    },
  });
  state.renderUpper = renderUpper;

  const moreThanTen = state.fwVersionsRows.length > 10;
  const checkedDevs = state.filteredMachines.filter((dev) => dev.checked);

  function wantUploadFirmware() {
    state.openModal = 'ModalAddFirmware';
    state.renderUpper();
  }

  function debounceRenderTable() {
    if (localState.debounceTimer) clearTimeout(localState.debounceTimer);
    localState.debounceTimer = setTimeout(() => state.renderDevsTable(), 200);
  }

  async function applyActionToSelected(action: string) {
    if (state.waitingRequest) return;
    if (!checkedDevs.length) return;
    if (action === 'update') {
      wantUpate();
    }
    if (action === 'fw-info') {
      wantGetFwInfo();
    }
    if (action === 'cert-info') {
      wantGetCertInfo();
    }
  }

  function wantUpate() {
    if (!checkedDevs.length) return;
    state.openModal = 'ModalSendOtaUpdate';
    state.renderUpper();
  }

  function wantGetFwInfo() {
    state.modalReqVersResult.devs = checkedDevs.map((dev) => ({
      devId: dev.DEV_ID,
    }));
    state.openModal = 'ModalReqVersResult';
    state.renderUpper();
  }

  function wantGetCertInfo() {
    state.modalReqCertResult.devs = checkedDevs.map((dev) => ({
      devId: dev.DEV_ID,
    }));
    state.openModal = 'ModalReqCertResult';
    state.renderUpper();
  }

  useEffect(() => {
    state.fwVersionsRows = state.fwVersionsAllTypes.filter((item) => (!state.fwStageFilter) || (item.fwType === state.fwStageFilter));
    renderUpper();
  }, [state.fwStageFilter]);

  useEffect(() => {
    localState.firmwareFamilies = {};
    for (const fwRow of state.fwVersionsRows) {
      const fwColName = fwRow.fwFamily.toUpperCase();
      const vMajorName = fwRow.versionNumber!.vMajor.toString();
      if (!localState.firmwareFamilies[fwColName]) {
        localState.firmwareFamilies[fwColName] = {};
      }
      const hwFirmwares = localState.firmwareFamilies[fwColName];
      if (!hwFirmwares[vMajorName]) {
        hwFirmwares[vMajorName] = [];
      }
      hwFirmwares[vMajorName].push({
        fwVers: fwRow.fwVers,
        fPath: fwRow.fPath!,
        fDate: fwRow.fDate!,
      });
    }
    renderUpper();
  }, [state.fwVersionsRows]);

  return (
    <>
      {/* Tabela de versões de firmware existentes, botão de upload e explicação das colunas */}
      <Flex flexWrap="wrap">
        {profile.permissions.isAdminSistema && (
          <div style={{ paddingTop: '30px', paddingRight: '30px' }}>
            <div>
              <Button style={{ width: '160px' }} onClick={wantUploadFirmware} variant="primary">Enviar Novo FW</Button>
            </div>
            <div style={{ marginTop: '15px' }}>
              <RadioButton checked={state.fwStageFilter === 'prod'} onClick={() => { state.fwStageFilter = 'prod'; renderUpper(); }} label="Produção" />
            </div>
            <div style={{ marginTop: '8px' }}>
              <RadioButton checked={state.fwStageFilter === 'test'} onClick={() => { state.fwStageFilter = 'test'; renderUpper(); }} label="Teste" />
            </div>
          </div>
        )}
        <div>
          <FwVersTable limitSize={moreThanTen && !localState.viewMoreFws}>
            {state.fwCols.map((fwColName) => (
              <div
                key={fwColName}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRight: '1px solid lightgrey',
                  padding: '0 6px',
                }}
              >
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>{fwColName}</div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  {Object.keys(localState.firmwareFamilies[fwColName] || {}).map((vMajorName) => (
                    <div key={vMajorName} style={{ display: 'flex', flexDirection: 'column' }}>
                      {localState.firmwareFamilies[fwColName][vMajorName].map((fw) => (
                        <div key={fw.fPath}>
                          <div style={{ marginTop: '6px', fontSize: '95%' }} data-tip data-for={fw.fPath}>
                            {fw.fwVers}
                          </div>
                          <ReactTooltip
                            id={fw.fPath}
                            place="top"
                            effect="solid"
                            delayHide={100}
                            offset={{ top: 0, left: 10 }}
                            textColor="#000000"
                            border
                            backgroundColor="white"
                          >
                            <span style={{ fontWeight: 'bold' }}>
                              {fw.fDate}
                            </span>
                          </ReactTooltip>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </FwVersTable>
          {(!state.fwVersionsRows.length)
            && <div>(nenhum)</div>}
          {(moreThanTen)
            && (
            <Flex justifyContent="center">
              <Box>
                <ViewMoreArrow viewMore={localState.viewMoreFws} onClick={() => setLocalState({ viewMoreFws: !localState.viewMoreFws })}>
                  <span>{localState.viewMoreFws ? 'Ver menos' : 'Ver mais'}</span>
                  <ArrowIcon />
                </ViewMoreArrow>
              </Box>
            </Flex>
            )}
        </div>
        <div style={{ paddingTop: '30px', marginLeft: '30px', maxWidth: '740px' }}>
          <p>
            A coluna &quot;Status OTA&quot; é uma mensagem que o firmware envia pelo broker sobre o processo de OTA dele.
          </p>
          <p>
            A coluna &quot;Versão Correta&quot; indica se o dispositivo está com a versão de firmware esperada.
            <br />
            Se um usuário vai nessa tela e solicita OTA para a versão 2_0_15, por exemplo, e o dispositivo informa que está nessa mesma versão, a coluna vai mostrar &quot;OK&quot;.
            <br />
            Se o dispositivo não estiver na versão solicitada, vai aparecer &quot;DIFF&quot;.
            <br />
            Se não for uma versão limpa, vai aparecer &quot;DIRTY&quot;.
            <br />
            E qualquer outro caso, por exemplo quando se exclui um firmware do sistema, vai aparecer &quot;ERR&quot;.
          </p>
          <p>
            A coluna &quot;Comando OTA&quot; se refere ao estado da estratégia do DAP de reenvio de comandos de OTA. As etapas são:
            <br />
            0 - Ninguém solicitou OTA ainda;
            <br />
            1 - Algum usuário solicitou OTA mas o dispositivo ainda não recebeu o comando;
            <br />
            2 - O dispositivo recebeu o comando mas ainda não baixou o arquivo;
            <br />
            3 - O dispositivo já solicitou o arquivo mas não está na versão certa ainda;
            <br />
            4 - O dispositivo já solicitou o arquivo e já está na versão certa;
            <br />
          </p>
          <p>
            A estratégia de reenvios só opera nos estados 1 e 2 e só para versões &quot;limpas&quot;, incluindo as de teste.
          </p>
          <p>
            Se o dispositivo já começou a fazer o download e por algum motivo ainda não está na versão certa (estado 3) a estratégia não tenta novamente pelo risco de fazer o dispositivo entrar em um loop infinito de ficar baixando firmware.
          </p>
          <p>
            Hoje esta tela mostra a versão atual do firmware mas não mostra a versão que o usuário solicitou para enviar.
          </p>
        </div>
      </Flex>

      {/* Campo de busca/filtro e combo-box de ações para os dispositivos selecionados */}
      <Flex>
        <Box width={1} pt={24} mb={24}>
          <Flex flexWrap="wrap" justifyContent="space-between">
            <Box minWidth="200px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
              <Flex>
                <InputSearch
                  id="search"
                  name="search"
                  placeholder="Pesquisar"
                  value={state.searchState}
                  onChange={(e) => { state.searchState = e.target.value; state.limitItems = 200; state.lastScrollTop = 0; state.renderUpper(); debounceRenderTable(); }}
                />
              </Flex>
            </Box>
            <Box width={[1, 1, 1, 1, 1, 1 / 5]} minWidth="280px">
              {(checkedDevs.length > 0) && (
                state.waitingRequest
                  ? <Loader size="small" />
                  : (
                    <Select
                      options={localState.availableActions}
                      value={null}
                      placeholder={`${checkedDevs.length} selecionado(s)`}
                      onSelect={(opt) => applyActionToSelected(opt.value)}
                    />
                  )
              )}
            </Box>
            <div>&nbsp;</div>
          </Flex>
        </Box>
      </Flex>

      {/* Modais */}
      {(state.openModal === 'ModalAddFirmware') && <ModalAddFirmware pageState={state} />}
      {(state.openModal === 'ModalSendOtaUpdate') && <ModalSendOtaUpdate pageState={state} fwVersionsRows={state.fwVersionsRows} checkedDevs={checkedDevs} />}
      {(state.openModal === 'ModalUpdateResult') && <ModalUpdateResult pageState={state} />}
      {(state.openModal === 'ModalReqVersResult') && <ModalReqVersResult pageState={state} />}
      {(state.openModal === 'ModalReqCertResult') && <ModalReqCertResult pageState={state} />}
    </>
  );
}

function DevsTable(props: { pageState: PageState }) {
  const { pageState: state } = props;
  const [localState, renderDevsTable, setLocalState] = useStateVar({
    sortBy: 'CLIENT_NAME',
  });
  state.renderDevsTable = renderDevsTable;

  state.filteredMachines = useMemo(() => {
    const columns: (keyof typeof state.allDevs[0])[] = ['STATE_ID', 'CITY_NAME', 'UNIT_NAME', 'CLIENT_NAME', 'machineName', 'DEV_ID', 'firmwareText', 'status', 'last_update_result', 'OTAPROCSTATUS', 'FWVERSSTATUS'];
    const filtered = filterByColumns(state.allDevs, columns, state.searchState);
    if (localState.sortBy) {
      orderByColumns(filtered, localState.sortBy, false);
    }
    return filtered;
  }, [state.searchState, state.allDevs]);

  function toggleCheckAll() {
    const checkState = !(state.filteredMachines[0] && state.filteredMachines[0].checked);
    for (const dev of state.filteredMachines) {
      dev.checked = checkState;
    }
    state.renderUpper();
    state.renderDevsTable();
  }

  function setSorting(column: string) {
    setLocalState({ sortBy: column });
  }

  return (
    <Flex flexWrap="wrap">
      <Box width={1}>
        <TableNew2 style={{ color: colors.Grey400 }}>
          <thead>
            <tr>
              <th onClick={() => setSorting('STATE_ID')}>Estado</th>
              <th onClick={() => setSorting('CITY_NAME')}>Cidade</th>
              <th onClick={() => setSorting('CLIENT_NAME')}>Cliente</th>
              <th onClick={() => setSorting('UNIT_NAME')}>Unidade</th>
              <th onClick={() => setSorting('machineName')}>Grupo</th>
              <th onClick={() => setSorting('DEV_ID')}>Dispositivo</th>
              <th onClick={() => setSorting('status')}>Status</th>
              <th onClick={() => setSorting('col_firmware_s')}>Firmware</th>
              <th onClick={() => setSorting('last_update_result')}>Status OTA</th>
              <th onClick={() => setSorting('FWVERSSTATUS')}>Versão Correta</th>
              <th onClick={() => setSorting('OTAPROCSTATUS')}>Comando OTA</th>
              <th><Checkbox checked={false} onClick={toggleCheckAll} style={{ display: 'inline-flex' }} /></th>
            </tr>
          </thead>
          <tbody>
            {state.filteredMachines.filter((x, i) => (i < state.limitItems)).map((dev) => (
              <tr key={dev.DEV_ID}>
                <td>{dev.STATE_ID || '-'}</td>
                <td>{dev.CITY_NAME || '-'}</td>
                <td>{dev.CLIENT_NAME || '-'}</td>
                <td>{dev.UNIT_ID ? <StyledLink to={`/analise/unidades/${dev.UNIT_ID}`}>{dev.UNIT_NAME}</StyledLink> : '-'}</td>
                <td>{dev.machineName || '-'}</td>
                <td><StyledLink to={`/analise/dispositivo/${dev.DEV_ID}/informacoes`}>{dev.DEV_ID}</StyledLink></td>
                <td>{(dev.status === 'ONLINE') ? <img src={IconOnline} /> : (dev.status === 'OFFLINE') ? <img src={IconOffline} /> : (dev.status === 'LATE') ? <img src={IconLate} /> : (dev.status || '-')}</td>
                <td>{(dev.col_firmware_s || '-')}</td>
                <td>{dev.last_update_result || '-'}</td>
                <td>{dev.FWVERSSTATUS || '-'}</td>
                <td>{dev.OTAPROCSTATUS || '-'}</td>
                <td><RowCheckbox pageState={state} dev={dev} /></td>
              </tr>
            ))}
          </tbody>
        </TableNew2>
        {(state.limitItems < state.filteredMachines.length)
          && (
          <p>
            Carregando mais itens... (
            {state.limitItems}
            {' '}
            /
            {' '}
            {state.filteredMachines.length}
            )
          </p>
          )}
      </Box>
    </Flex>
  );
}

function RowCheckbox(props: { dev: DeviceRow, pageState: PageState }) {
  const { dev, pageState: state } = props;
  const [, renderCheckbox] = useState({});
  return <Checkbox checked={dev.checked} onClick={() => { dev.checked = !dev.checked; renderCheckbox({}); state.renderUpper(); }} />;
}

function ModalAddFirmware(props: { pageState: PageState }) {
  const pageState = props.pageState;
  const [state, render, setState] = useStateVar({
    selectedFwFolder: null as null|string,
    file: null as null|(Blob&{name: string}),
    sending: false,
  });
  async function confirmAddFirmware() {
    if (!state.file) {
      toast.error('Selecione um arquivo');
      return;
    }
    if (!state.selectedFwFolder) {
      toast.error('Selecione uma pasta');
      return;
    }
    if (!pageState.fwStageFilter) {
      toast.error('Não foi possível identificar o tipo de firmware');
      return;
    }
    try {
      setState({ sending: true });
      await apiCallFormData('/devs/upload-new-firmware-version', {
        fileName: state.file.name,
        fwStage: pageState.fwStageFilter,
        fwFamily: state.selectedFwFolder,
      }, {
        file: state.file,
      });
      window.location.reload();
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.sending = false;
    render();
  }

  return (
    <ModalWindow onClickOutside={() => { pageState.openModal = null; pageState.renderUpper(); }}>
      <ModalContent>
        <div>
          <Select
            options={pageState.fwFolders}
            value={state.selectedFwFolder}
            placeholder="Pasta"
            onSelect={(item) => { state.selectedFwFolder = item; render(); }}
            notNull
          />
        </div>
        <div>&nbsp;</div>
        <div style={{ marginTop: '15px' }}>
          <span style={{ paddingRight: '15px' }}>{(state.file && state.file.name) || ''}</span>
          <FileInput onChange={(e: any) => { state.file = e.target.files[0]; render(); }}>
            <span style={{ display: 'inline-block', width: '200px', textAlign: 'center' }}>
              Selecionar Arquivo
            </span>
            <input type="file" hidden />
          </FileInput>
        </div>
        <div>&nbsp;</div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px',
        }}
        >
          {state.sending
            ? <Loader size="small" />
            : <Button style={{ width: '120px' }} onClick={confirmAddFirmware} variant="primary">Enviar</Button>}
          <Button
            style={{ width: '120px', margin: '0 20px' }}
            onClick={() => { pageState.openModal = null; pageState.renderUpper(); }}
            variant="grey"
          >
            Cancelar
          </Button>
        </div>
      </ModalContent>
    </ModalWindow>
  );
}

function ModalSendOtaUpdate(props: { fwVersionsRows: FirmwareRow[], checkedDevs: DeviceRow[], pageState: PageState }) {
  const { fwVersionsRows, checkedDevs, pageState } = props;

  const [state, render, setState] = useStateVar({
    devIdFamilies: {} as {
      [devIdFamily: string]: {
        options: FirmwareRow[]
        selected: FirmwareRow
      }
    },
    invalidDevices: {} as {
      [devId: string]: string,
    },
    sending: false,
  });

  useEffect(() => {
    for (const dev of checkedDevs) {
      if ((!dev.devIdFamily) || (!dev.versionNumber)) {
        state.invalidDevices[dev.DEV_ID] = 'Firmware não identificado';
        continue;
      }
      if (!state.devIdFamilies[dev.devIdFamily]) {
        const compatibleVersions = pageState.fwVersionsRows.filter((fw) => {
          const { canUpdate } = checkCanUpdate(dev, fw);
          return !!canUpdate;
        });
        if (compatibleVersions.length === 0) {
          state.invalidDevices[dev.DEV_ID] = 'Nenhuma versão compatível';
          continue;
        }
        state.devIdFamilies[dev.devIdFamily] = {
          options: compatibleVersions,
          selected: compatibleVersions[0],
        };
      }
      const { canUpdate } = checkCanUpdate(dev, state.devIdFamilies[dev.devIdFamily].selected);
      if (!canUpdate) {
        state.invalidDevices[dev.DEV_ID] = 'Versão não compatível';
        continue;
      }
    }
    render();
  }, []);

  async function confirmRequestUpdate() {
    const devs: typeof pageState.modalUpdateResult.devs = [];

    const msgCantUpdate: string[] = [];

    for (const dev of checkedDevs) {
      if (state.invalidDevices[dev.DEV_ID]) continue;
      const fw = state.devIdFamilies[dev.devIdFamily!].selected;
      const { canUpdate, outMsg } = checkCanUpdate(dev, fw);
      if (!canUpdate) {
        msgCantUpdate.push(outMsg);
        continue;
      }
      devs.push({
        devId: dev.DEV_ID,
        fwPath: fw.path,
      });
    }

    if (msgCantUpdate.length > 0) {
      toast.error(`Os seguintes dispositivos não podem ser alterados para outra família: \n${msgCantUpdate.join(';\n')}`);
      return;
    }

    if (!window.confirm(`Deseja atualizar o firmware de ${devs.length} equipamento(s)?`)) {
      return;
    }

    pageState.modalUpdateResult.devs = devs;
    pageState.openModal = 'ModalUpdateResult';
    pageState.renderUpper();
  }

  return (
    <ModalWindow onClickOutside={() => { pageState.openModal = null; pageState.renderUpper(); }}>
      <ModalContent>
        {Object.keys(state.devIdFamilies).map((devIdFamily) => (
          <div key={devIdFamily} style={{ paddingBottom: '12px' }}>
            <Select
              options={state.devIdFamilies[devIdFamily].options}
              value={state.devIdFamilies[devIdFamily].selected}
              placeholder={devIdFamily}
              propLabel="fwVers"
              onSelect={(item: FirmwareRow) => { state.devIdFamilies[devIdFamily].selected = item; render(); }}
              notNull
            />
          </div>
        ))}
        <div style={{ maxHeight: '115px', overflowY: 'auto' }}>
          {checkedDevs.map((dev) => (
            <div key={dev.DEV_ID} style={state.invalidDevices[dev.DEV_ID] ? { textDecoration: 'line-through' } : {}}>
              [
              {dev.devIdFamily}
              ]&nbsp;
              {dev.DEV_ID}
            </div>
          ))}
        </div>
        <div>&nbsp;</div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
        }}
        >
          {state.sending
            ? <Loader size="small" />
            : <Button style={{ width: '120px' }} onClick={confirmRequestUpdate} variant="primary">Enviar</Button>}
          <Button
            style={{ width: '120px', margin: '0 20px' }}
            onClick={() => { pageState.openModal = null; pageState.renderUpper(); }}
            variant="grey"
          >
            Cancelar
          </Button>
        </div>
      </ModalContent>
    </ModalWindow>
  );
}

function ModalUpdateResult(props: { pageState: PageState }) {
  const state = props.pageState;
  const [, render_modal] = useStateVar(() => {
    sendAll();
    return {};
  });

  function sendAll(isRetry?: boolean) {
    for (const dev of state.modalUpdateResult.devs) {
      sendCommand(dev, isRetry);
    }
  }

  function sendCommand(dev, isRetry) {
    if (dev.status === 'Comando enviado!') return;
    dev.status = 'Aguardando resposta...';
    Promise.resolve().then(async () => {
      try {
        if (dev.fwPath) {
          const pars = { devId: dev.devId, path: dev.fwPath, waitLonger: isRetry };
          await apiCall('/dev/command-ota', pars);
          dev.status = 'Comando enviado!';
        } else {
          dev.status = 'Não foi possível identificar o firmware!';
        }
      } catch (err) {
        console.log(err);
        dev.status = 'Houve erro';
      }
      render_modal();
    });
  }

  const thereWasErr = state.modalUpdateResult.devs.some((dev) => (dev.status === 'Houve erro'));

  return (
    <ModalWindow onClickOutside={() => { state.openModal = null; state.renderUpper(); }}>
      <ModalContent>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {state.modalUpdateResult.devs.map((dev) => (
            <div>
              {dev.devId}
              :
              {' '}
              {dev.status}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
          {(thereWasErr)
            && (
            <Button style={{ width: '160px', margin: '0 20px' }} onClick={() => { sendAll(true); render_modal(); }} variant="secondary">
              Tentar de novo
            </Button>
            )}
          <Button style={{ width: '120px' }} onClick={() => { window.location.reload(); }} variant="primary">
            Concluir
          </Button>
        </div>
      </ModalContent>
    </ModalWindow>
  );
}

function ModalReqVersResult(props: { pageState: PageState }) {
  const state = props.pageState;
  type SubProps = {
    dev: {
      devId: string
      status?: string
    }
  };
  function DevLine(subProps: SubProps) {
    const { dev } = subProps;
    const [, renderLine] = useState(() => {
      dev.status = 'Aguardando resposta...';
      return {};
    });
    useEffect(() => {
      Promise.resolve().then(async () => {
        try {
          const pars = { devId: dev.devId };
          await apiCall('/dev/request-firmware-info', pars);
          dev.status = 'Recebido!';
        } catch (err) {
          console.log(err);
          dev.status = 'Houve erro';
        }
        renderLine({});
      });
    }, []);
    return (
      <div>
        {dev.devId}
        :
        {' '}
        {dev.status}
      </div>
    );
  }

  return (
    <ModalWindow onClickOutside={() => { state.openModal = null; state.renderUpper(); }}>
      <ModalContent>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {state.modalReqVersResult.devs.map((dev) => <DevLine dev={dev} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
          <Button style={{ width: '120px' }} onClick={() => { window.location.reload(); }} variant="primary">
            Concluir
          </Button>
        </div>
      </ModalContent>
    </ModalWindow>
  );
}

function ModalReqCertResult(props: { pageState: PageState }) {
  const state = props.pageState;
  function DevLine({ dev }) {
    const [, renderLine] = useState(() => {
      dev.status = 'Aguardando resposta...';
      return {};
    });
    useEffect(() => {
      Promise.resolve().then(async () => {
        try {
          await apiCall('/request-dev-cert-check', { devId: dev.devId });
          dev.status = 'Recebido!';
        } catch (err) {
          console.log(err);
          dev.status = 'Houve erro';
        }
        renderLine({});
      });
    }, []);
    return (
      <div>
        {dev.devId}
        :
        {' '}
        {dev.status}
      </div>
    );
  }

  return (
    <ModalWindow onClickOutside={() => { state.openModal = null; state.renderUpper(); }}>
      <ModalContent>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {state.modalReqCertResult.devs.map((dev) => <DevLine dev={dev} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
          <Button style={{ width: '120px' }} onClick={() => { window.location.reload(); }} variant="primary">
            Concluir
          </Button>
        </div>
      </ModalContent>
    </ModalWindow>
  );
}

// Não é permitido atualização de versão de uma major para outra; tanto downgrade quanto upgrade (ex: 2.x.x para 3.x.x ou vice versa)
// com exceção para famílias 1 e 2 dos dispositivos 'dac2', 'dac3', 'dac4', 'dut', 'dut3', 'dam2' e 'dam3' (ex: 1.x.x para a 2.x.x)
// e dispositivos sem versão (tageados), em que nesse caso podem atualizar apenas para versão que seja refatorada
function checkCanUpdate(currFwInfo: DeviceRow, wantedFwInfo: FirmwareRow) {
  const devId = currFwInfo.DEV_ID;

  // Se não soubermos a versão atual do dispositivo, não permite atualizar
  const currMajor = currFwInfo.versionNumber?.vMajor || null;
  const newMajor = wantedFwInfo.versionNumber?.vMajor || null;
  if ((!currMajor) || (!currFwInfo.fwInfo)) {
    return { canUpdate: false, outMsg: `${devId} com versão desconhecida` };
  }

  // Restrição pelo DEVID e coluna. Dispositivos só devem ser capazes de atualizar suas versões de acordo com a coluna certa com as iniciais igual ao DEVID.
  // "fwFamily" é a pasta (do S3) que contém o arquivo de firmware e é também o nome da coluna na tela de firmwares.
  if ((wantedFwInfo.fwFamily.length === 4) && devId.toLowerCase().startsWith(wantedFwInfo.fwFamily.toLowerCase())) {
    // OK, caso padrão
  } else if ((wantedFwInfo.fwFamily === 'dut') && ['DUT0', 'DUT1', 'DUT2'].includes(devId.toUpperCase().substring(0, 4))) {
    // OK, dispositivos com o DEVID iniciado em DUT0, DUT1 e DUT2 podem receber firmware da coluna DUT
  } else if ((wantedFwInfo.fwFamily === 'dma0') && ['DMA1'].includes(devId.toUpperCase().substring(0, 4))) {
    // OK, dispositivos com DEVID iniciado em DMA1 podem receber versões de firmware da coluna DMA0
  } else {
    return { canUpdate: false, outMsg: `Não pode atualizar ${devId} pois a pasta do firmware (${wantedFwInfo.path}) não corresponde ao dev_id` };
  }

  // Legado tem formato: "1_3_4"
  // Refatorado tem formato: "v3.2.0", "v4.1.1-1-g21fcc67-dirty", "d80e580-dirty", "085427f"
  // Observei que atualmente versão major 1 e 2 é sempre legado, refatorado é a partir de versão major 3.
  const newIsLegacy = wantedFwInfo.fwVers.includes('_');
  const newIsRefactor = !newIsLegacy;

  // Não é permitido atualização de versão de uma major para outra; tanto downgrade quanto upgrade (ex: 2.x.x para 3.x.x ou vice versa)
  // Compatibilidade de Versões de major. Versões de firmware na linha 2_x_x, v3.x.x ou v4.x.x só podem receber versões da mesma linha.
  if (newMajor === currMajor) {
    // OK, caso padrão
  } else if ((currMajor === 1) && (newMajor === 2) && ['DAC2', 'DAC3', 'DAC4'].includes(devId.toUpperCase().substring(0, 4))) {
    // OK, dispositivos com o DEVID iniciado em DAC2, DAC3 e DAC4 E versão de firmware 1_x_x podem receber versões de firmware na linha 2_x_x
    // Antes esta regra se aplicava também a: 'dut', 'dut3', 'dam2', 'dam3'
  } else if ((!currMajor) && newIsRefactor) {
    // OK, dispositivos sem versão (tageados) podem atualizar apenas para versão que seja refatorada
  } else {
    return { canUpdate: false, outMsg: `Não pode atualizar ${devId} mudando da versão ${currFwInfo.fwInfo?.firmware_version} para ${wantedFwInfo.fwVers}` };
  }

  return { canUpdate: true, outMsg: '' };
}

export default withTransaction('AdmFirmware', 'component')(AdmFirmware);

import React, { useState, useEffect, useMemo } from 'react';

import { Helmet } from 'react-helmet';
import { WithContext as ReactTags } from 'react-tag-input';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import {
  DataTable, Button, EmptyWrapper, Loader, StatusBox, Checkbox, Select, InputSearch,
} from '~/components';
import { TableColumn } from '~/components/DataTable';
import { ModalWindow } from '~/components/ModalWindow';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import { SearchIcon } from '~/icons';
import { AdminLayout } from '~/pages/Admin/AdminLayout';
import { apiCall, ApiResps } from '~/providers';

import {
  DesktopTable,
  StyledSpan,
  StyledLink,
  SearchInput,
  IconWrapper,
  Label,
} from './styles';

import '~/assets/css/ReactTags.css';
import { withTransaction } from '@elastic/apm-rum-react';

const KeyCodes = {
  comma: 188,
  slash: 191,
  enter: [10, 13],
};

const delimiters = [...KeyCodes.enter, KeyCodes.comma, KeyCodes.slash];

export const DUTIrList = (): JSX.Element => {
  const [profile] = useState(getUserProfile);

  const [state, render, setState] = useStateVar(() => {
    const state = {
      actionOpts: [] as {}[],
      selectedDUTSource: '',
      wantSetIrSource: false,
      ownershipOpts: [
        { value: 'CLIENTS', label: 'De clientes' },
        { value: 'N-COMIS', label: 'Não-comissionados' }, // aqueles com DEV_ID default de firmware
        { value: 'N-ASSOC', label: 'Não-associados' }, // Aqueles que já tem DEV_ID próprio, mas não possuem cliente associado
        { value: 'MANUFAC', label: 'Comissionados em Fábrica' }, // Aqueles que já tem DEV_ID próprio, e possuem cliente SERDIA
        { value: 'D-TESTS', label: 'Em testes' }, // Aqueles que estão associados ao cliente DIEL ENERGIA LTDA.
        { value: 'ALLDEVS', label: 'Todos' },
      ],
      ownershipFilter: null as null|{ value: string },
      isLoading: false, // setIsLoading
      csvData: [], // setCsvData
      duts: [] as (ApiResps['/dut/get-duts-list']['list'][number] & { checked?: boolean })[],
      searchState: [] as { text: string }[], // setSearchState
      tablePage: 1,
      tablePageSize: 50,
      totalItems: 0,
      allChecked: false,
    };

    if (profile.viewAllClients) {
      state.ownershipFilter = state.ownershipOpts[0];
    }

    if (profile.manageAllClients) {
      state.actionOpts = [{ label: 'Copiar Códigos IR', value: 'set-ir' }];
    }
    return state;
  });

  async function applyActionToSelected(action, list) {
    try {
      const selectedDevs = list.filter((dev) => dev.checked);

      if (!selectedDevs.length) return;

      if (action === 'set-ir') {
        // const ids = selectedDevs.map((x) => x.DEV_ID);
        // console.log(`setting IR codes for ${ids}`);
        // history.push(`/painel/copy-ir/?ids=${encodeURIComponent(ids.join('*'))}`);
        state.wantSetIrSource = true;
        render();
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  async function confirmIRSource() {
    try {
      const selectedDevs = state.duts.filter((dev) => dev.checked);
      const irSourceDev = state.selectedDUTSource;
      const { list, dutCommandTypes } = await apiCall('/get-dut-ircodes-list', { devId: irSourceDev });

      const sourceIrCodes = list;
      await Promise.all(
        selectedDevs.map(async (dev) => {
          const response = await apiCall('/write-dut-command-by-ircode', { configs: sourceIrCodes, targetDutId: dev.DEV_ID });
          if (!response.success || response.success !== true) {
            toast.error(`Houve erro ao gravar códigos para ID ${dev.DEV_ID} no banco de dados!`);
          }
          else {
            try {
              const response = await apiCall('/resend-dut-ir-codes', {
                devId: dev.DEV_ID,
              });
              if (response.responses.some((x) => !x.success || x.success !== true)) {
                toast.error(`Houve erro ao gravar códigos IR no DUT ${dev.DEV_ID}`);
              }
            }
            catch (err) {
              toast.error(`Houve erro ao gravar códigos IR no DUT ${dev.DEV_ID}`);
            }
          }
        }),
      );
      // for (const dev of selectedDevs) { // sequential writing. I don't know whether I can put it all in a single Promise.all()
      //   const response = await apiCall('/write-dut-command-by-ircode', { configs: sourceIrCodes, targetDutId: dev.DEV_ID });
      //   if (!response.success || response.success !== true) {
      //     toast.error(`Houve erro ao gravar códigos para ID ${dev.DEV_ID} no banco de dados!`);
      //   }
      //   else {
      //     try {
      //       const response = await apiCall('/resend-dut-ir-codes', {
      //         devId: dev.DEV_ID,
      //       });
      //       if (response.responses.some((x) => !x.success || x.success !== true)) {
      //         toast.error(`Houve erro ao gravar códigos IR no DUT ${dev.DEV_ID}`);
      //       }
      //     }
      //     catch (err) {
      //       toast.error(`Houve erro ao gravar códigos IR no DUT ${dev.DEV_ID}`);
      //     }
      //   }
      // }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  const columns = useMemo(() => {
    const columns = [] as TableColumn[];

    if (profile.viewMultipleClients) {
      columns.push({
        Header: 'Cliente',
        accessor: 'col_CLIENT_NAME',
        Cell: (props) => (props.CLIENT_NAME ? <StyledSpan>{props.CLIENT_NAME}</StyledSpan> : '-'),
      });
    }
    columns.push({
      Header: 'Unidade',
      accessor: 'UNIT_NAME',
      Cell: (props) => <>{props.unit.id && props.unit.name ? <StyledLink to={`/analise/unidades/${props.unit.id}`}>{props.unit.name}</StyledLink> : '-'}</>,
    });
    columns.push({
      Header: 'Marca',
      accessor: 'MCHN_BRAND',
      Cell: (props) => <StyledSpan>{(props.MCHN_BRAND && props.MCHN_BRAND.length > 100 ? (props.MCHN_BRAND).slice(0, 100).concat('...') : props.MCHN_BRAND || '-')}</StyledSpan>,
    });
    columns.push({
      Header: 'Modelo',
      accessor: 'MCHN_MODEL',
      Cell: (props) => <StyledSpan>{(props.MCHN_MODEL && props.MCHN_MODEL.length > 100 ? (props.MCHN_MODEL).slice(0, 100).concat('...') : props.MCHN_MODEL || '-')}</StyledSpan>,
    });
    columns.push({
      Header: 'Dispositivo',
      accessor: 'devId',
      Cell: (props) => (
        <>
          {props.devId
            ? (
              <StyledLink to={`/analise/dispositivo/${props.devId}/informacoes`} style={props.damInop ? { color: 'red' } : {}}>
                {props.devId}
              </StyledLink>
            )
            : (
              '-'
            )}
        </>
      ),
    });
    columns.push({
      Header: 'Controle',
      accessor: 'Mode',
      Cell: (props) => (
        <>
          <StyledSpan>{props.mode}</StyledSpan>
        </>
      ),
    });
    columns.push({
      Header: 'Operação',
      accessor: 'State',
      Cell: (props) => (
        <>
          <StyledSpan>{props.relay}</StyledSpan>
        </>
      ),
    });
    columns.push({
      Header: 'Conexão',
      accessor: 'status',
      Cell: (props) => <StatusBox status={props.status}>{props.status}</StatusBox>,
    });

    if (profile.manageAllClients) {
      columns.push({
        Header: 'Última vez visto',
        accessor: 'col_lastseen',
        Cell: (props) => (props.lastCommTs || '-'),
      });
    }

    if (state.actionOpts.length > 0) {
      columns.push({
        Header: (
          <Checkbox
            checked={state.duts.every((dut) => !!dut.checked) && state.duts.length > 0}
            onClick={() => {
              setState({ allChecked: !(state.duts.every((dut) => !!dut.checked) && state.duts.length > 0) });
              for (const dut of state.duts) {
                dut.checked = state.allChecked;
              }
              render();
            }}
          />
        ),
        accessor: 'col_selection',
        Cell: (props) => <Checkbox checked={props.checked} onClick={() => { props.checked = !props.checked; render(); }} />,
      });
    }

    return columns;
  }, [(state.duts.every((dut) => !!dut.checked) && state.duts.length > 0)]);

  async function handleGetDUTS() {
    try {
      setState({ isLoading: true });

      const { list, totalItems } = await apiCall('/dut/get-duts-list', {
        onlyPossibleAutomation: true,
        SKIP: (state.tablePage - 1) * state.tablePageSize,
        LIMIT: state.tablePageSize,
        searchTerms: state.searchState.map((x) => x.text.toLowerCase()),
        ownershipFilter: (state.ownershipFilter && state.ownershipFilter.value) || undefined,
      });

      for (const dev of list) {
        // dev.State = descOper[dev.State] || dev.State;
        if (dev.Mode === 'Auto') dev.Mode = 'Automático';
        if (dev.lastCommTs) { dev.lastCommTs = dev.lastCommTs.replace('T', ' '); }

        Object.assign(dev, {
          state: dev.STATE_ID || '-',
          city: dev.CITY_NAME || '-',
          unit: { id: dev.UNIT_ID, name: dev.UNIT_NAME } || '-',
          // group: dev.machineName || '-',
          devId: dev.DEV_ID || '-',
          mode: dev.Mode || '-',
          relay: dev.State || '-',
          status: dev.status || '-',
        });
      }

      state.totalItems = totalItems;
      state.duts = list;
    } catch {
      toast.error('Não foi possível carregar os dados.');
    }
    setState({ isLoading: false });
  }

  const onPageChange = (page) => {
    state.tablePage = page;
    render();
    handleGetDUTS();
  };

  const handleSearchDelete = (i) => {
    state.tablePage = 1;
    state.searchState = state.searchState.filter((tag, index) => index !== i);
    render();
    handleGetDUTS();
  };

  const handleSearchAddition = (tag) => {
    state.tablePage = 1;
    state.searchState = [...state.searchState, tag];
    render();
    handleGetDUTS();
  };

  useEffect(() => {
    handleGetDUTS();
  }, [state.tablePage]);

  useEffect(() => {
    state.tablePage = 1;
    render();
    handleGetDUTS();
  }, [state.ownershipFilter]);

  useEffect(() => {
    handleGetDUTS();
  }, []);

  const selectedDevs = state.duts.filter((dev) => dev.checked);

  return (
    <>
      <Helmet>
        <title>Diel Energia - DUT IR</title>
      </Helmet>
      <AdminLayout />
      <Flex flexWrap="wrap" width={1} justifyContent="space-between">
        <Box width={1} pt={24} mb={24}>
          <Flex flexWrap="wrap" justifyContent="space-between">
            <Box minWidth="300px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
              <div>
                <SearchInput>
                  <div style={{ width: '100%' }}>
                    <Label>Pesquisar</Label>
                    <ReactTags
                      tags={state.searchState}
                      handleDelete={handleSearchDelete}
                      handleAddition={handleSearchAddition}
                      delimiters={delimiters}
                      allowDragDrop={false}
                      allowDeleteFromEmptyInput={false}
                      inputFieldPosition="top"
                      minQueryLength={2}
                      placeholder=""
                    />
                  </div>
                  <IconWrapper>
                    <SearchIcon />
                  </IconWrapper>
                </SearchInput>
              </div>
            </Box>
            {(profile.viewAllClients)
              && (
                <Box width={[1, 1, 1, 1, 1, 1 / 5]} minWidth="280px">
                  <Select
                    options={state.ownershipOpts}
                    value={state.ownershipFilter}
                    placeholder="Tipo"
                    onSelect={(opt) => { state.ownershipFilter = opt; render(); }}
                    notNull
                  />
                </Box>
              )}
            <Box width={[1, 1, 1, 1, 1, 1 / 5]} minWidth="280px">
              {(selectedDevs.length > 0) && (
              <Select
                options={state.actionOpts}
                value={null}
                placeholder={`${selectedDevs.length} selecionado(s)`}
                onSelect={(opt) => applyActionToSelected(opt.value, selectedDevs)}
              />
              )}
            </Box>
          </Flex>
        </Box>
      </Flex>
      {state.isLoading
        ? (
          <EmptyWrapper>
            <Loader variant="primary" size="large" />
          </EmptyWrapper>
        )
        : (
          <>
            <DesktopTable>
              {state.duts
                ? (
                  <DataTable
                    isUnit
                    columns={columns}
                    data={state.duts}
                    onPageChange={onPageChange}
                    currentPage={state.tablePage}
                    pageSize={state.tablePageSize}
                    totalItems={state.totalItems}
                  />
                )
                : (
                  <Flex justifyContent="center" alignItems="center">
                    <Box justifyContent="center" alignItems="center">
                      <StyledSpan>Não foi possível carregar os dados</StyledSpan>
                    </Box>
                  </Flex>
                )}
            </DesktopTable>
          </>
        )}
      {(state.wantSetIrSource) && (
      <ModalWindow onClickOutside={undefined}>
        <h3>Selecione o DUT origem dos comandos</h3>
        {/* <Select
          options={state.duts.map((dut) => {
            dut;
            return dut.devId;
          })}
          propLabel="NAME"
          value={state.selectedDUTSource}
          placeholder="DUT"
          onSelect={(e) => { state.selectedDUTSource = e; render(); }}
        /> */}
        <InputSearch
          id="search"
          name="search"
          placeholder="DUT de origem"
          value={state.selectedDUTSource}
          onChange={(e) => setState({ selectedDUTSource: e.target.value })}
        />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
        }}
        >
          <Button
            style={{ width: '140px' }}
            onClick={async () => {
              await confirmIRSource();
              state.wantSetIrSource = false; render();
            }}
            variant="primary"
          >
            Salvar
          </Button>
          <Button style={{ width: '140px', margin: '0 20px' }} onClick={() => { state.wantSetIrSource = false; render(); }} variant="grey">
            Cancelar
          </Button>
        </div>
      </ModalWindow>
      )}
    </>
  );
};

export default withTransaction('DUTIrList', 'component')(DUTIrList);

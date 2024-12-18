import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InputSearch } from '../../../components/InputSearch';
import {
  TableContainer,
  ChevronBottom,
  ChevronTop,
  HeaderRow,
  HeaderCell,
  Row,
  DataCell,
  TableBody,
  TableHead,
} from './styles';
import {
  ActionButton,
  Button,
  Checkbox,
  ModalWindow,
  Loader,
} from '~/components';
import { getUserProfile } from '~/helpers/userProfile';
import { DeleteOutlineIcon, EditIcon } from '~/icons';
import { colors } from '~/styles/colors';
import { Box, Flex } from 'reflexbox';
import { SearchInput, Label } from '~/pages/Analysis/styles';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { dynamicSort, Pagination } from '~/components/NewTable';
import { apiCall } from '~/providers';
import { toast } from 'react-toastify';
import { useStateVar } from '~/helpers/useStateVar';
import { getObjects } from '~/helpers/getObjetcs';
import { useParams } from 'react-router-dom';
import { SimpleButton } from '~/pages/Admin/AdmCities/styles';

export const TableDuts = ({
  list,
  vavsList,
  onEditClick,
  onDeleteClick,
  roomTypes,
  render,
  pageSize,
  setIsLoad,
}): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const [state, _renderVar, setState] = useStateVar(() => {
    const state = {
      selectOption: '' as any,
      searchText: '',
      currentPage: 1,
      sortOrder: '+',
      orderColum: '',
      isLoading: false,
      numSelect: 0,
      selectedRType: undefined,
    };
    return state;
  });
  const [filteredRows, setFilteredRows] = useState(list.concat(vavsList));
  const [listEnvironments, setEnvironments] = useState<{ DEV_ID: string, ENV_ID: number }[]>([]);
  const { t } = useTranslation();
  const routeParams = useParams<{ clientId: string }>();
  function getPages() {
    return filteredRows.map((item, index) => ({ ...item, key: `${index} ${item.DEV_ID} ${item.ENVIRONMENT_ID}` })).slice((state.currentPage - 1) * pageSize, state.currentPage * pageSize);
  }

  async function verifyRoute(arrayPromisse, clientId, type) {
    if (state.selectOption === 'deleteEnvironments') {
      await Promise.all(
        arrayPromisse.map((arr) => apiCall('/dut/delete-environments', { DEVS_INFO: arr, CLIENT_ID: clientId })),
      ).then(() => {
        toast.success(t('ambientesDeletadosComSucesso'));
        toast.info(t('dutsNaoForamDeletados'));
        setEnvironments([]);
        setState({ selectOption: '', selectedRType: undefined });
        render();
      }).catch((err) => {
        console.log(err);
        toast.error(t('houveErro'));
        setState({ selectOption: '' });
      });
    } else {
      await Promise.all(
        arrayPromisse.map((arr) => apiCall('/dut/set-dut-rtype-v2', { DEVS_INFO: arr, CLIENT_ID: clientId, RTYPE_ID: type === 'clear' ? null : state.selectedRType })),
      ).then(() => {
        toast.success(t('tipoAmbientesAlteradoSucesso'));
        toast.info(t('ambientesSemNomeDefinidoNaoForamAlterados'));
        setEnvironments([]);
        setState({ selectOption: '', selectedRType: undefined });
        render();
      }).catch((err) => {
        console.log(err);
        toast.error(t('houveErro'));
        setState({ selectOption: '' });
      });
    }
  }

  async function updateOrDelete(type) {
    if (listEnvironments.length > 0) {
      if (state.selectOption !== 'deleteEnvironments' && type !== 'clear' && !state.selectedRType) {
        toast.error(t('selecioneOTipoDeAmbiente'));
        return;
      }
      const arrayPromisse: { DEV_ID: string, ENV_ID: number }[][] = [];
      const clientId = (routeParams.clientId && Number(routeParams.clientId)) || null;
      for (let i = 0; i < listEnvironments.length; i += 100) {
        arrayPromisse.push(listEnvironments.slice(i, i + 100));
      }
      await verifyRoute(arrayPromisse, clientId, type);
      setState({ isLoading: true });
    } else {
      toast.error(t('deveSelecionarPeloMenos1Ambiente'));
      setState({ selectOption: '', selectedRType: undefined });
    }
    setState({ isLoading: false });
  }

  const getDataPerPage = useMemo(() => getPages(), [filteredRows, state.currentPage, pageSize]);
  useEffect(() => {
    setFilteredRows(list.concat(vavsList));
    setState({ currentPage: 1 });
  }, [list, vavsList]);

  useEffect(() => {
    setState({ numSelect: listEnvironments.length });
  }, [listEnvironments]);

  const onSearch = (e) => {
    setState({ searchText: e.target.value });

    if (e.target.value) {
      setFilteredRows(list.concat(vavsList).filter((row) => getObjects(row, e.target.value).length));
    } else {
      setFilteredRows(list.concat(vavsList));
    }

    setState({ orderColum: 'name' });
    setState({ sortOrder: '+' });
    setState({ currentPage: 1 });
  };

  const columnsEnvironment = [
    {
      label: t('nome'),
      value: 'name',
      accessor: 'ROOM_NAME',
    },
    {
      label: t('tipo'),
      value: 'type',
      accessor: 'RTYPE_NAME',
    },
    {
      label: t('unidade'),
      value: 'unit',
      accessor: 'UNIT_NAME',
    },
    {
      label: t('pais'),
      value: 'country',
      accessor: 'COUNTRY_NAME',
    },
    {
      label: t('estado'),
      value: 'state',
      accessor: 'STATE_ID',
    },
    {
      label: t('cidade'),
      value: 'city',
      accessor: 'CITY_NAME',
    },
  ];

  const handleSetOrderColumn = (column) => {
    let newSortOrder = '+';
    if (state.orderColum === column.value && state.sortOrder === '+') {
      newSortOrder = '-';
    }
    let sortedRows;
    if (state.orderColum === column.value && state.sortOrder === newSortOrder) {
      setState({ orderColum: '' });
      setState({ sortOrder: '' });
    } else {
      sortedRows = [...filteredRows].sort(dynamicSort(column, newSortOrder));
      setState({ orderColum: column.value });
      setState({ sortOrder: newSortOrder });
    }

    if (state.currentPage !== 1) {
      setState({ currentPage: 1 });
    }

    setFilteredRows(sortedRows);
  };

  const chevron = () => {
    if (state.sortOrder === '+') {
      return <ChevronTop />;
    }
    return <ChevronBottom />;
  };

  function checkItem(item) {
    const newItem = item.DEV_ID !== '-' ? 'DEV_ID' : 'ENV_ID';
    const value = newItem === 'ENV_ID' ? item.ENVIRONMENT_ID : item.DEV_ID;
    if (listEnvironments.some((dut) => dut[newItem] === value)) {
      setEnvironments(listEnvironments.filter((dev) => dev[newItem] !== value));
      item.checked = false;
    } else {
      item.checked = true;
      setEnvironments([...listEnvironments, {
        DEV_ID: item.DEV_ID,
        ENV_ID: item.ENVIRONMENT_ID,
      }]);
    }
  }
  function checkAllItems() {
    setFilteredRows(filteredRows.map((item) => ({ ...item, checked: true })));
    const notIncludes = filteredRows.filter((item) => {
      const key = item.DEV_ID !== '-' ? 'DEV_ID' : 'ENV_ID';
      const value = key === 'ENV_ID' ? item.ENVIRONMENT_ID : item.DEV_ID;
      return !listEnvironments.some((dut) => dut[key] === value);
    });
    setEnvironments([...listEnvironments, ...notIncludes.map((item) => ({
      DEV_ID: item.DEV_ID,
      ENV_ID: item.ENVIRONMENT_ID,
    }))]);
  }

  function notCheckAllItems() {
    setFilteredRows(filteredRows.map((item) => ({ ...item, checked: false })));
    const includes = listEnvironments.filter((item) => {
      const key = item.DEV_ID !== '-' ? 'DEV_ID' : 'ENVIRONMENT_ID';
      const value = key === 'ENVIRONMENT_ID' ? item.ENV_ID : item.DEV_ID;
      return !filteredRows.some((filterItem) => filterItem[key] === value);
    });
    setEnvironments([...includes]);
  }

  const onPreviousPage = () => {
    if (state.currentPage > 1) {
      setState({ currentPage: state.currentPage - 1 });
    }
  };

  const onNextPage = () => {
    if (state.currentPage * pageSize < filteredRows.length) {
      setState({ currentPage: state.currentPage + 1 });
    }
  };

  function isChecked() {
    return !filteredRows.some((item) => {
      const key = item.DEV_ID !== '-' ? 'DEV_ID' : 'ENV_ID';
      const value = key === 'ENV_ID' ? item.ENVIRONMENT_ID : item.DEV_ID;
      return !listEnvironments.some((dev) => dev[key] === value);
    });
  }

  function isCheckedItem(item) {
    const key = item.DEV_ID !== '-' ? 'DEV_ID' : 'ENV_ID';
    const value = key === 'ENV_ID' ? item.ENVIRONMENT_ID : item.DEV_ID;
    return listEnvironments.some((dev) => dev[key] === value);
  }

  if (state.isLoading) {
    return <Loader />;
  }

  return (
    <>
      {(profile.manageAllClients) && (
        <Flex flexWrap="wrap" flexDirection="row" width="100%" justifyContent="space-between" style={{ gap: 10 }} marginBottom="5px">
          <div />
          <SimpleButton variant="primary" onClick={() => { setState({ selectOption: 'deleteEnvironments' }); }}>Excluir Ambientes</SimpleButton>
        </Flex>
      )}
      <Flex flexWrap="wrap" flexDirection="row" width="100%" justifyContent="space-between" style={{ gap: 10 }}>
        <Box minWidth="200px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]} style={{ margin: 0 }}>
          <InputSearch
            id="searchDuts"
            name="search"
            placeholder={t('pesquisar')}
            value={state.searchText}
            onChange={onSearch}
            style={{
              margin: 0,
            }}
          />
        </Box>
        {
          profile.manageAllClients && (
            <SearchInput style={{ width: 300, margin: 0 }}>
              <div
                style={{
                  width: '100%',
                  paddingTop: 1,
                  paddingBottom: 3,
                  margin: 0,
                }}
              >
                <Label>{t('multiplasConfiguracoes')}</Label>
                <SelectSearch
                  options={[
                    {
                      value: 'setEnvironmentType',
                      name: t('definirTipoAmbiente'),
                    },
                  ]}
                  value={state.selectOption}
                  closeOnSelect
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={`${state.numSelect} ${t('selecionados')}`}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={(value) => { setState({ selectOption: value }); }}
                />
              </div>
            </SearchInput>
          )
        }
      </Flex>
      <br />
      <TableContainer>
        <TableHead>
          <HeaderRow>
            {profile.manageAllClients && (
              <Box
                backgroundColor="#4950CC"
                height={40}
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{
                  borderRadius: '10px 0 0 0',
                }}
              >
                <Checkbox
                  checked={isChecked()}
                  onClick={() => {
                    !isChecked() ? checkAllItems() : notCheckAllItems();
                  }}
                />
              </Box>
            )}
            {
              columnsEnvironment.map((column) => (
                <HeaderCell key={column.value} onClick={() => handleSetOrderColumn(column)}>
                  {column.label}
                  {' '}
                  {state.orderColum === column.value ? chevron() : ''}
                </HeaderCell>
              ))
            }
            {(profile.manageAllClients)
              && <HeaderCell />}
          </HeaderRow>
        </TableHead>
        <TableBody>
          {getDataPerPage.map((item) => (
            <Row key={`${item.DEV_ID}${item.ENVIRONMENT_ID}${item.ROOM_NAME}${item.UNIT_ID}`}>
              {profile.manageAllClients && (
                <DataCell>
                  <Checkbox
                    checked={isCheckedItem(item)}
                    onClick={() => {
                      checkItem(item);
                    }}
                  />
                </DataCell>
              )}
              <DataCell>{item.ROOM_NAME || item.DEV_ID || '-'}</DataCell>
              <DataCell>{item.RTYPE_NAME || '-'}</DataCell>
              <DataCell>{item.UNIT_NAME || '-'}</DataCell>
              <DataCell>{item.COUNTRY_NAME || '-'}</DataCell>
              <DataCell>{item.STATE_ID || '-'}</DataCell>
              <DataCell>{item.CITY_NAME || '-'}</DataCell>
              {(profile.manageAllClients)
                && (
                  <DataCell>
                    {item.ENVIRONMENT_ID ? (
                      <ActionButton onClick={() => { setIsLoad(true); onDeleteClick(item); checkItem(item); setIsLoad(false); }} variant="red-inv">
                        <DeleteOutlineIcon colors={colors.Red} />
                      </ActionButton>
                    ) : (
                      <ActionButton style={{ width: 35, padding: 5 }} variant="red-inv">
                        <DeleteOutlineIcon colors="gray" />
                      </ActionButton>
                    )}
                    <ActionButton onClick={() => onEditClick(item.unit, item)} variant="blue-inv">
                      <EditIcon color={colors.LightBlue} />
                    </ActionButton>
                  </DataCell>
                )}
            </Row>
          ))}
        </TableBody>
      </TableContainer>
      <Pagination
        currentPage={state.currentPage}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        filteredRows={filteredRows}
        pageSize={pageSize}
      />
      {
        ((state.selectOption === 'setEnvironmentType') || (state.selectOption === 'deleteEnvironments')) && (
          <ModalEnvironment
            state={state}
            setEnvironments={setEnvironments}
            setState={setState}
            t={t}
            render={render}
            roomTypes={roomTypes}
            listEnvironments={listEnvironments}
            updateOrDelete={updateOrDelete}
            selectedRType={state.selectedRType}
          />
        )
      }
    </>
  );
};

function ModalEnvironment({
  state,
  setState,
  roomTypes,
  listEnvironments,
  setEnvironments,
  render,
  t,
  updateOrDelete,
  selectedRType,
}) {
  const [isLoading, setsIsLoading] = useState(false);
  const title = state.selectOption === 'deleteEnvironments' ? t('deletarAmbientes') : t('definirTipoAmbiente');
  const send = state.selectOption === 'deleteEnvironments' ? t('deletar') : t('aplicar');
  return (
    <ModalWindow borderTop style={{ width: 400 }}>
      <h3>
        <strong>{title}</strong>
      </h3>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 10,
        padding: 20,
      }}
      >
        {
          state.selectOption !== 'deleteEnvironments' && (
            <>
              <SearchInput style={{ margin: 0, zIndex: 10 }}>
                <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
                  <Label>{t('multiplasConfiguracoes')}</Label>
                  <SelectSearch
                    options={roomTypes}
                    value={selectedRType}
                    printOptions="on-focus"
                    search
                    filterOptions={fuzzySearch}
                    placeholder={t('selecionarTipoAmbiente')}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={(value) => { setState({ selectedRType: value }); render(); }}
                  />
                </div>
              </SearchInput>
              <p
                style={{
                  color: 'blue',
                  width: '100%',
                  textDecoration: 'underline',
                  paddingLeft: 3,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (window.confirm(t('confirmaExcluirTipoAmbiente'))) {
                    setsIsLoading(true);
                    setState({ selectedRType: null });
                    updateOrDelete('clear');
                    setsIsLoading(false);
                  }
                }}
              >
                {t('limparAmbientes')}
              </p>
            </>
          )
        }
        {
          (state.selectOption === 'deleteEnvironments') && (
          <p
            style={{
              width: '100%',
              paddingLeft: 3,
            }}
          >
            {t('voceTemCertezaDeletarAmbientes')}
          </p>
          )
        }
        <Button variant={isLoading ? 'disabled' : 'primary'} onClick={() => { setsIsLoading(true); updateOrDelete(''); setsIsLoading(false); }}>{send}</Button>
        <p
          style={{ textDecoration: 'underline', color: '#6C6B6B', cursor: 'pointer' }}
          onClick={() => setState({ selectOption: '' })}
        >
          {t('cancelar')}
        </p>
      </div>
    </ModalWindow>
  );
}

import {
  useState, useEffect, useMemo,
} from 'react';
import { toast } from 'react-toastify';
import { Box, Flex } from 'reflexbox';
import { InputSearch } from '../InputSearch';
import { colors } from '../../styles/colors';
import {
  PaginationContainer,
  Page,
  ButtonPage,
  TableContainer,
  TableHead,
  HeaderRow,
  HeaderCell,
  HeaderCellOrder,
  ChevronTop,
  ChevronBottom,
  ChevronLeft,
  ChevronRight,
  TableBody,
  Row,
  DataCell,
  CheckboxStyle,
} from './styles';
import { useTranslation } from 'react-i18next';
import { getUserProfile } from '../../helpers/userProfile';
import {
  Checkbox, ModalWindow, Button,
} from '../index';
import { useStateVar } from '../../helpers/useStateVar';
import { SearchInput, Label } from '../../pages/Analysis/styles';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { useParams } from 'react-router-dom';
import { ApiResps, apiCall } from '../../providers';

export function dynamicSort(property, sortOrder) {
  return function (a, b) {
    const aa = a[property.accessor];
    const bb = b[property.accessor];

    // equal items sort equally
    if (aa === bb) {
      return 0;
    }
    // nulls sort after anything else
    if (aa === null || aa === undefined) {
      return 1;
    }
    if (bb === null || bb === undefined) {
      return -1;
    }
    // otherwise, if we're ascending, lowest sorts first
    if (sortOrder === '+') {
      return aa < bb ? -1 : 1;
    }
    // if descending, highest sorts first
    return aa < bb ? 1 : -1;
  };
}

type NewTableProps = {
  columns: any;
  data: any;
  pageSize: number;
  noSearchBar?: boolean;
  extraBtns?: JSX.Element[];
  hideEmptyTable?: boolean;
  checkBox?: boolean;
  multipleConfig?: boolean;
  supervisors?: {
    USER: string
    LAST_ACCESS: string
    NOME: string
    SOBRENOME: string
    perfil: string
    PERMS_U: string
    CLIENT_BIND: number
    FULLNAME: string
    clientName: string
    clientIds: number[]
    clientNames: string[]
    unitIds?: number[]
    RG: string
    COMMENTS: string
    PICTURE: string
    CITY_ID: string
    CITY_NAME: string
    STATE_ID: string
    STATE_NAME: string
    IS_ACTIVE: string
  }[],
  renderUnits?: () => void;
  keySearch?: string
}

export const NewTable = ({
  columns, data, pageSize, noSearchBar, extraBtns, hideEmptyTable, checkBox, multipleConfig, supervisors, renderUnits, keySearch,
}: NewTableProps): JSX.Element => {
  const { clientId } = useParams<{ clientId: string }>();
  const [profile] = useState(getUserProfile);
  const [orderColum, setOrderColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('+');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState(data);
  const [state, render, setState] = useStateVar(() => {
    const state = {
      selectedData: [] as {
        UNIT_ID: number,
        SUPERVISOR_ID: string,
      }[],
      supervisors: [] as { USER: string }[],
      selectOption: '' as string,
      checkedItems: [] as number[],
    };
    return state;
  });
  const { t } = useTranslation();

  useEffect(() => {
    setFilteredRows(data);
    setCurrentPage(1);
  }, [data]);

  function toogleChecked(item) {
    setFilteredRows(filteredRows.map((doc) => {
      if (item.UNIT_ID === doc.UNIT_ID) {
        return ({ ...doc, checked: !doc.checked });
      }
      return doc;
    }));
    if (!state.checkedItems.includes(item.UNIT_ID)) {
      setState({ checkedItems: [...state.checkedItems, item.UNIT_ID] });
    } else {
      setState({ checkedItems: state.checkedItems.filter((id) => id !== item.UNIT_ID) });
    }
  }

  function AllChecked(ischecked) {
    setFilteredRows(filteredRows.map((item) => ({ ...item, checked: ischecked })));
    if (ischecked) {
      const notIncludes = [...filteredRows.filter((item) => !state.checkedItems.includes(item.UNIT_ID))];
      const idsNotIncludes = notIncludes.map((item) => item.UNIT_ID);
      setState({ checkedItems: [...state.checkedItems, ...idsNotIncludes] });
    } else {
      const includes = filteredRows.map((item) => item.UNIT_ID);
      const filter = state.checkedItems.filter((item) => !includes.some((id) => id === item));
      setState({ checkedItems: filter });
    }
  }

  const getDataPerPage = useMemo(() => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredRows, currentPage, pageSize]);

  const chevron = (column: string) => {
    if (orderColum === column) {
      if (sortOrder === '+') {
        return <ChevronTop />;
      }

      return <ChevronBottom />;
    }
  };

  const handleSetOrderColumn = (column) => {
    let newSortOrder = '+';

    if (orderColum === column && sortOrder === '+') {
      newSortOrder = '-';
    }

    let sortedRows;
    if (orderColum === column && sortOrder === newSortOrder) {
      setOrderColumn('');
      setSortOrder('');
    } else {
      sortedRows = [...filteredRows].sort(dynamicSort(column, newSortOrder));
      setOrderColumn(column);
      setSortOrder(newSortOrder);
    }

    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    setFilteredRows(sortedRows);
  };

  function getObjects(obj, val) {
    const objects: any[] = [];
    for (const i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (obj[i] && typeof obj[i] === 'object') {
        continue;
      } else if (obj[i] && obj[i].toString().toLowerCase().includes(val.toString().toLowerCase())) {
        if (objects.lastIndexOf(obj) === -1) {
          objects.push(obj);
        }
      }
    }
    return objects;
  }

  const onSearch = (e) => {
    setSearchText(e.target.value);

    if (e.target.value) {
      setFilteredRows(data.filter((row) => getObjects(row, e.target.value).length));
    } else {
      setFilteredRows(data);
    }
    setOrderColumn('+');
    setSortOrder('');
    setCurrentPage(1);
  };

  const onPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const onNextPage = () => {
    if (currentPage * pageSize < filteredRows.length) {
      setCurrentPage(currentPage + 1);
    }
  };
  return (
    <>
      <Flex flexWrap="wrap" flexDirection="row" width="100%" justifyContent="space-between">
        {!noSearchBar && (
          <Box minWidth="200px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
            <InputSearch
              id={keySearch || 'search'}
              name="search"
              placeholder={t('pesquisar')}
              value={searchText}
              onChange={onSearch}
            />
          </Box>
        )}
        {
          (multipleConfig && profile.manageAllClients) && (
            <SearchInput
              style={{
                width: 300, margin: 0, marginRight: 20,
              }}
            >
              <div
                style={{
                  width: '100%',
                  paddingBottom: 4,
                  margin: 0,
                }}
              >
                <Label>{t('multiplasConfiguracoes')}</Label>
                <SelectSearch
                  options={[
                    {
                      value: 'setStatus',
                      name: t('definirStatus'),
                    },
                    {
                      value: 'setResponsible',
                      name: t('definirResponsavel'),
                    },
                    {
                      value: 'setWeeklyReport',
                      name: t('definirRelatorioSemanal'),
                    },
                  ]}
                  value={state.selectOption}
                  closeOnSelect
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={`${state.checkedItems.length} ${t('selecionados')}`}
                  onChange={(value: any) => { setState({ selectOption: value }); }}
                />
              </div>
            </SearchInput>
          )
        }
        {extraBtns?.length !== 0 && (
          extraBtns?.map((btn) => <Box minWidth="200px" mb={[16, 16, 16, 16, 16, 0]}>{btn}</Box>)
        )}
      </Flex>
      <br />
      {!(hideEmptyTable && data.length === 0) && (
        <>
          <TableContainer>
            <TableHead>
              <HeaderRow>
                {
                  (checkBox && profile.manageAllClients) && (
                    <CheckedAll filteredRows={filteredRows} state={state} AllChecked={(bool) => AllChecked(bool)} />
                  )
                }
                {columns.map((column, index) => (
                  column.checkable === true ? (
                    <HeaderCell style={{ width: column.width || 'auto', textAlign: 'left' }} key={`${column.name || index}`}>
                      {column.value}
                    </HeaderCell>
                  )
                    : column.sortable === false ? (
                      <HeaderCell style={{ width: column.width || 'auto' }} key={`${column.name || index}`}>
                        {column.value}
                      </HeaderCell>
                    ) : (
                      <HeaderCellOrder style={{ width: column.width || 'auto', textAlign: 'left' }} key={`${column.name || index}`} onClick={() => handleSetOrderColumn(column)}>
                        {column.value}
                        {' '}
                        {chevron(column)}
                      </HeaderCellOrder>
                    )
                ))}
              </HeaderRow>
            </TableHead>
            <TableBody>
              {getDataPerPage.map((row, index) => (
                <Row key={index}>
                  {
                    (checkBox && profile.manageAllClients) && (
                      <Checked item={row} setFilter={toogleChecked} filteredRows={filteredRows} state={state} />
                    )
                  }
                  {columns.map((cell) => (
                    <DataCell key={`${cell.name + index}`} style={{ width: cell.width || 'auto', textAlign: cell.textAlign || 'left' }}>
                      {!cell.render ? row[cell.accessor] : cell.render(row)}
                    </DataCell>
                  ))}
                </Row>
              ))}
            </TableBody>
          </TableContainer>
          <Pagination
            currentPage={currentPage}
            onNextPage={onNextPage}
            onPreviousPage={onPreviousPage}
            filteredRows={filteredRows}
            pageSize={pageSize}
          />
        </>
      )}
      {
        (state.selectOption === 'setStatus' || state.selectOption === 'setWeeklyReport' || state.selectOption === 'setResponsible') && (
          <ModalDefault
            state={state}
            setState={setState}
            t={t}
            supervisorList={supervisors}
            clientId={Number(clientId)}
            renderUnits={renderUnits}
            filteredRows={filteredRows}
          />
        )
      }
    </>
  );
};

export const Pagination = ({
  currentPage,
  onPreviousPage,
  onNextPage,
  pageSize,
  filteredRows,
}) => (
  <PaginationContainer>
    <ButtonPage
      style={{
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: currentPage > 1 ? colors.Blue300 : colors.Grey,
      }}
      onClick={onPreviousPage}
    >
      <ChevronLeft />
    </ButtonPage>
    <Page>{currentPage}</Page>
    <ButtonPage
      style={{
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: currentPage * pageSize < filteredRows.length ? colors.Blue300 : colors.Grey,
      }}
      onClick={onNextPage}
    >
      <ChevronRight />
    </ButtonPage>
  </PaginationContainer>
);

function ModalDefault({
  state, setState, t, supervisorList, clientId, renderUnits, filteredRows,
}) {
  const [selected, setSelected] = useState<any>();
  const [loading, setLoading] = useState(false);

  const allOfOption = {
    setStatus: {
      name: t('alterarStatusUnidade'),
      label: t('status'),
      placeholder: t('selecionarStatus'),
      options: [
        {
          name: 'Em Instalação',
          value: 'installation',
        },
        {
          name: 'Em Produção',
          value: 'operation',
        },
      ],
      multiple: false,
    },
    setWeeklyReport: {
      name: t('definirRelatorioSemanal'),
      label: t('relatorioSemanal'),
      placeholder: t('selecionarHabilitacao'),
      options: [
        {
          name: 'Habilitar',
          value: 'enable',
        },
        {
          name: 'Desabilitar',
          value: 'disable',
        },
      ],
      multiple: false,
    },
    setResponsible: {
      name: t('definirResponsavel'),
      label: t('responsavel'),
      placeholder: t('selecioneResponsavel'),
      options: (supervisorList || []).map((item) => ({ value: item.USER, name: `${item.NOME} ${item.SOBRENOME}` })),
      multiple: true,
    },
  };

  async function sendItems() {
    if (!selected && !state.selectedItemsList) {
      return;
    }
    setLoading(true);
    const itemsUnits = filteredRows.filter((item) => state.checkedItems.includes(item.UNIT_ID));
    const arrayPromisse = [] as (ApiResps['/clients/get-units-list'] & ({
      groups?: {}[]
      duts?: {}[]
      DACS_COUNT?: number
      DUTS_COUNT?: number
      DAMS_COUNT?: number
      DRIS_COUNT?: number
      disp?: number
    })[]);
    for (let i = 0; i < itemsUnits.length; i += 60) {
      arrayPromisse.push(itemsUnits.slice(i, i + 60));
    }
    await Promise.all(
      arrayPromisse.map((arr) => apiCall('/clients/multiple-configs-units', {
        UNITS_IDS: itemsUnits.map((item) => ({ UNIT_ID: item.UNIT_ID, SUPERVISOR_ID: item.SUPERVISOR_ID })),
        CLIENT_ID: clientId,
        TYPE: state.selectOption,
        SELECTED: !selected ? 'clear' : selected,
      })),
    ).then(() => {
      toast.success(t('unidadesAlteradasComSucesso'));
      renderUnits();
      setState({ selectOption: '' });
    }).catch((err) => {
      console.log(err);
      toast.error(t('houveErro'));
      setState({ selectOption: '' });
    });
    setLoading(false);
  }

  return (
    <ModalWindow borderTop style={{ width: 400 }}>
      <h3>
        <strong style={{ marginLeft: 20 }}>{allOfOption[state.selectOption].name}</strong>
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
        <SearchInput style={{ margin: 0, zIndex: 10 }}>
          <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
            <Label>{allOfOption[state.selectOption].label}</Label>
            <SelectSearch
              options={allOfOption[state.selectOption].options}
              value={selected}
              printOptions="on-focus"
              search
              filterOptions={fuzzySearch}
              multiple={allOfOption[state.selectOption].multiple}
              closeOnSelect={!allOfOption[state.selectOption].multiple}
              placeholder={allOfOption[state.selectOption].placeholder}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={(value) => { setSelected(value); }}
            />
          </div>
        </SearchInput>
        {
          state.selectOption === 'setResponsible' && (
            <p
              style={{
                color: 'blue',
                width: '100%',
                textDecoration: 'underline',
                paddingLeft: 3,
              }}
              onClick={() => { setSelected('clear'); sendItems(); }}
            >
              {t('limparResponsavel')}
            </p>
          )
        }
        <Button variant={loading ? 'disabled' : 'primary'} onClick={() => { sendItems(); }}>{t('aplicar')}</Button>
        <p
          style={{ textDecoration: 'underline', color: '#6C6B6B' }}
          onClick={() => setState({ selectOption: '' })}
        >
          {t('cancelar')}
        </p>
      </div>
    </ModalWindow>
  );
}

function Checked({
  item, setFilter, state,
}) {
  const [checked, setChecked] = useState(false);
  function toogleChecked() {
    setChecked(!checked);
    setFilter(item);
  }
  useEffect(() => {
    const object = state.checkedItems.find((id) => item.UNIT_ID === id);
    setChecked(object || false);
  }, [state.checkedItems]);
  return (
    <DataCell>
      <Checkbox
        checked={checked}
        onClick={() => {
          toogleChecked();
        }}
      />
    </DataCell>
  );
}

function CheckedAll({ filteredRows, state, AllChecked }) {
  function isChecked() {
    return !filteredRows.some((item) => !state.checkedItems.some((check) => check === item.UNIT_ID));
  }
  useEffect(() => {
  }, [state.checkedItems]);
  return (
    <CheckboxStyle
      style={{
        borderRadius: '10px 0 0 0',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#4950CC',
        justifyContent: 'center',
      }}
    >
      <Checkbox
        checked={isChecked()}
        onClick={() => {
          isChecked() ? AllChecked(false) : AllChecked(true);
        }}
      />
    </CheckboxStyle>
  );
}

import { useState, useEffect } from 'react';

import i18n from '~/i18n';

import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  Input, Button, SearchBox, Loader, InputSearch, NewTable, ModalWindow,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { DeleteOutlineIcon } from 'icons';
import { apiCall } from 'providers';
import { Box, Flex } from 'reflexbox';
import { AxiosError } from 'axios';

import { AdminLayout } from '../AdminLayout';
import {
  ContainerInputs,
  SelectButton,
  SimpleButton,
  CloseModal,
  ModalTitle,
  ModalCancel,
} from './styles';
import { withTransaction } from '@elastic/apm-rum-react';

const t = i18n.t.bind(i18n);

async function deleteCity(rowData) {
  if (!window.confirm(t('desejaExcluirCidade', { cityName: rowData.name }))) return;
  try {
    await apiCall('/dac/remove-city', { cityId: rowData.id });
    window.location.reload();
  } catch (err) {
    console.log(err);
    toast.error(t('houveErro'));
  }
}

const AdmCities = () => {
  const [state, render, setState] = useStateVar({
    loading: false, // setLoading
    cities: [] as {
      id: string
      state: string
      name: string
      lat: string
      lon: string
    }[], // set_cities
    citiesFiltered: [] as {
      id: string
      state: string
      name: string
      lat: string
      lon: string
    }[], // set_cities
    searchResults: [] as {
      ROW_ID?: string
      COUNTRY_NAME: string
      STATE_ID: string
      CITY_ID: string
      NAME: string
      LAT: number
      LONG: number
    }[], // set_searchResults
    globalCitiesSearchText: '', // set_searchText
    values: { // set_values
      CITY_ID: '',
      NAME: '',
      COUNTRY_NAME: '',
      COUNTRY_LAT: '',
      COUNTRY_LON: '',
      STATE_CODE: '',
      STATE_NAME: '',
      LAT: '',
      LON: '',
      STATE_LAT: '',
      STATE_LON: '',
    },
    searchState: '',
  });
  const [showModal, setShowModal] = useState(false);

  function setValue(newValues: Partial<(typeof state)['values']>) {
    Object.assign(state.values, newValues);
    render();
  }

  async function submitNewCity() {
    try {
      setState({ loading: true });
      await apiCall('/dac/add-new-city', state.values);
      window.location.reload();
    } catch (err) {
      console.log(err);
      const error = err as AxiosError;
      if (error.response?.status !== 500) {
        toast.error(error.response?.data);
      } else {
        toast.error(t('houveErro'));
      }
    } finally {
      setState({ loading: false });
    }
  }

  function fillCityInfo(row) {
    state.values.CITY_ID = row.CITY_ID;
    state.values.STATE_NAME = row.STATE_NAME;
    state.values.STATE_CODE = row.STATE_CODE;
    state.values.COUNTRY_NAME = row.COUNTRY_NAME;
    state.values.COUNTRY_LAT = row.COUNTRY_LAT;
    state.values.COUNTRY_LON = row.COUNTRY_LON;
    state.values.LAT = row.CITY_LAT ? String(row.CITY_LAT) : '';
    state.values.LON = row.CITY_LON ? String(row.CITY_LON) : '';
    state.values.STATE_LAT = row.STATE_LAT ? String(row.STATE_LAT) : '';
    state.values.STATE_LON = row.STATE_LON ? String(row.STATE_LON) : '';
    state.values.NAME = row.CITY_NAME && row.CITY_NAME.length > 1 ? row.CITY_NAME[0] + row.CITY_NAME.substr(1).toLowerCase() : row.CITY_NAME;
    render();
  }

  function searchCities() {
    (async function () {
      if (!state.globalCitiesSearchText) {
        setState({ searchResults: [] });
        return;
      }
      try {
        const { list } = await apiCall('/dac/search-city-info', { id: state.globalCitiesSearchText });
        state.searchResults = list;
        for (const row of state.searchResults) {
          row.ROW_ID = `${row.LAT}x${row.LONG}`;
        }
        render();
      } catch (err) {
        console.log(err);
        toast.error(t('houveErro'));
      }
    }());
  }

  useEffect(searchCities, [state.globalCitiesSearchText]);

  useEffect(() => {
    (async function () {
      try {
        const response = await apiCall('/dac/get-cities-list', {});
        setState({ cities: response.list, citiesFiltered: response.list });
      } catch (err) {
        console.log(err);
        toast.error(t('houveErro'));
      }
    }());
  }, []);

  const columns = [
    {
      name: 'country',
      value: t('pais'),
      accessor: 'country',
    },
    {
      name: 'state',
      value: t('estado'),
      accessor: 'state',
    },
    {
      name: 'id',
      value: 'ID',
      accessor: 'id',
    },
    {
      name: 'name',
      value: t('nome'),
      accessor: 'name',
    },
    {
      name: 'lat',
      value: t('latitude'),
      accessor: 'lat',
    },
    {
      name: 'lon',
      value: t('longitude'),
      accessor: 'lon',
    },
    {
      name: 'actions',
      value: t('acoes'),
      sortable: false,
      textAlign: 'center',
      width: 120,
      render: (props) => (
        <div>
          <DeleteOutlineIcon style={{ cursor: 'pointer' }} onClick={() => deleteCity(props)} colors={undefined} />
        </div>
      ),
    },
  ];

  const columnsSearch = [
    {
      name: 'country',
      value: t('pais'),
      accessor: 'COUNTRY_NAME',
    },
    {
      name: 'state',
      value: t('estado'),
      accessor: 'STATE_CODE',
    },
    {
      name: 'id',
      value: 'ID',
      accessor: 'CITY_ID',
    },
    {
      name: 'name',
      value: t('nome'),
      accessor: 'CITY_NAME',
    },
    {
      name: 'lat',
      value: 'Lat.',
      accessor: 'CITY_LAT',
    },
    {
      name: 'lon',
      value: 'Long.',
      accessor: 'CITY_LON',
    },
    {
      name: 'actions',
      value: t('acoes'),
      sortable: false,
      textAlign: 'center',
      width: 120,
      render: (props) => (
        <div>
          <SelectButton onClick={() => fillCityInfo(props)}>{t('selecionar').toLocaleUpperCase()}</SelectButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaCidades')}</title>
      </Helmet>
      <AdminLayout />
      {state.loading && <Loader variant="primary" />}
      {(!state.loading) && (
        <div>
          <br />
          <NewTable
            data={state.citiesFiltered}
            columns={columns}
            pageSize={20}
            extraBtns={[<SimpleButton variant="primary" onClick={() => setShowModal(true)}>{t('botaoAdicionarCidade')}</SimpleButton>]}
          />
        </div>
      )}
      {
        showModal && (
          <ModalWindow
            borderTop
            style={{ width: '45rem', minWidth: '300px' }}
            onClickOutside={() => {
              setShowModal(false);
              setState({
                searchResults: [],
                values: {
                  CITY_ID: '',
                  NAME: '',
                  COUNTRY_NAME: '',
                  COUNTRY_LAT: '',
                  COUNTRY_LON: '',
                  STATE_NAME: '',
                  STATE_CODE: '',
                  LAT: '',
                  LON: '',
                  STATE_LAT: '',
                  STATE_LON: '',
                },
                globalCitiesSearchText: '',
              });
            }}
          >
            <Flex justifyContent="center" flexDirection="column" alignItems="center">
              <Flex width={1} flexDirection="row" alignItems="center" justifyContent="center">
                <ModalTitle><b>{t('botaoAdicionarCidade')}</b></ModalTitle>
                <CloseModal
                  style={{ marginLeft: '10px', marginBottom: '5px' }}
                  onClick={() => {
                    setShowModal(false);
                    setState({
                      searchResults: [],
                      values: {
                        CITY_ID: '',
                        NAME: '',
                        COUNTRY_NAME: '',
                        COUNTRY_LAT: '',
                        COUNTRY_LON: '',
                        STATE_NAME: '',
                        STATE_CODE: '',
                        LAT: '',
                        LON: '',
                        STATE_LAT: '',
                        STATE_LON: '',
                      },
                      globalCitiesSearchText: '',
                    });
                  }}
                />
              </Flex>
              <Box justifyContent="center" width={1}>
                <ContainerInputs>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridColumnGap: '10px' }}>
                    <Input
                      style={{ margin: '8px 0px', height: '50px' }}
                      label={t('nome')}
                      value={state.values.NAME}
                      onChange={(e) => setValue({ NAME: e.target.value })}
                    />
                    <Input
                      style={{ margin: '8px 0px', height: '50px' }}
                      label="ID"
                      value={state.values.CITY_ID}
                      onChange={(e) => setValue({ CITY_ID: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridColumnGap: '10px' }}>
                    <Input
                      style={{ margin: '8px 0px', height: '50px' }}
                      label={t('latitudeCidade')}
                      value={state.values.LAT}
                      onChange={(e) => setValue({ LAT: e.target.value })}
                    />
                    <Input
                      style={{ margin: '8px 0px', height: '50px' }}
                      label={t('longitudeCidade')}
                      value={state.values.LON}
                      onChange={(e) => setValue({ LON: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridColumnGap: '10px' }}>
                    <Input
                      style={{ margin: '8px 0px', height: '50px' }}
                      label={t('nomeEstado')}
                      value={state.values.STATE_NAME}
                      onChange={(e) => { setValue({ STATE_NAME: e.target.value }); }}
                    />
                    <Input
                      style={{ margin: '8px 0px', height: '50px' }}
                      label={t('siglaEstado')}
                      value={state.values.STATE_CODE}
                      onChange={(e) => {
                        if (e.target.value.length <= 3) {
                          setValue({ STATE_CODE: e.target.value });
                        }
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridColumnGap: '10px' }}>
                    <Input
                      style={{ margin: '8px 0px', height: '50px' }}
                      label={t('latitudeEstado')}
                      value={state.values.STATE_LAT}
                      onChange={(e) => setValue({ STATE_LAT: e.target.value })}
                    />
                    <Input
                      style={{ margin: '8px 0px', height: '50px' }}
                      label={t('longitudeEstado')}
                      value={state.values.STATE_LON}
                      onChange={(e) => setValue({ STATE_LON: e.target.value })}
                    />
                  </div>
                  <Input
                    style={{ margin: '8px 0px', height: '50px' }}
                    label={t('pais')}
                    value={state.values.COUNTRY_NAME}
                    onChange={(e) => setValue({ COUNTRY_NAME: e.target.value })}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridColumnGap: '10px' }}>
                    <Input
                      style={{ margin: '8px 0px', height: '50px', flex: 1 }}
                      label="Latitude do País"
                      value={state.values.COUNTRY_LAT}
                      onChange={(e) => setValue({ COUNTRY_LAT: e.target.value })}
                    />
                    <Input
                      style={{ margin: '8px 0px', height: '50px', flex: 1 }}
                      label="Longitude do País"
                      value={state.values.COUNTRY_LON}
                      onChange={(e) => setValue({ COUNTRY_LON: e.target.value })}
                    />
                  </div>
                  <Button variant="primary" style={{ marginTop: '20px' }} onClick={submitNewCity}>
                    {t('botaoAdicionar')}
                  </Button>
                  <ModalCancel
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setShowModal(false);
                      setState({
                        searchResults: [],
                        values: {
                          CITY_ID: '',
                          NAME: '',
                          COUNTRY_NAME: '',
                          COUNTRY_LAT: '',
                          COUNTRY_LON: '',
                          STATE_CODE: '',
                          STATE_NAME: '',
                          LAT: '',
                          LON: '',
                          STATE_LAT: '',
                          STATE_LON: '',
                        },
                        globalCitiesSearchText: '',
                      });
                    }}
                  >
                    {t('botaoCancelar')}
                  </ModalCancel>
                </ContainerInputs>
              </Box>
              <Box justifyContent="center" width={1}>
                <InputSearch
                  style={{ width: '100%' }}
                  id="globalCitiesSearch"
                  name="globalCitiesSearch"
                  placeholder={t('consultarCidadesMundo')}
                  value={state.globalCitiesSearchText}
                  onChange={(e) => {
                    setState({ globalCitiesSearchText: e.target.value });
                  }}
                />
                {state.searchResults.length > 0 && (
                  <NewTable
                    data={state.searchResults}
                    columns={columnsSearch}
                    pageSize={15}
                    noSearchBar
                  />
                )}
              </Box>
            </Flex>
          </ModalWindow>
        )
      }
    </>
  );
};

const AdmCitiesWrapper = withRouter(AdmCities);

export { AdmCitiesWrapper as AdmCities };
export default withTransaction('AdmCities', 'component')(AdmCities);

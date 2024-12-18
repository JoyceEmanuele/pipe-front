import { useState } from 'react';

import LeafletIcon from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Helmet } from 'react-helmet';
import {
  Map, TileLayer, Marker, Popup,
} from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Flex, Box } from 'reflexbox';
import 'react-leaflet-markercluster/dist/styles.min.css';

import { useFilter } from 'hooks';
import MarkerIcon from '~/assets/img/marker.svg';
import {
  Button, EmptyWrapper, Loader,
} from '~/components';
import {
  CloseIcon,
  FilterIcon,
  ArrowDownIconV2,
  ArrowUpIconV2,
} from '~/icons';
import { AnalysisLayout } from '~/pages/Analysis/AnalysisLayout';
import { useTranslation } from 'react-i18next';
import {
  StyledSpan,
  MapCard,
  PopupContainer,
  Title,
  DesktopWrapper,
  MobileWrapper,
  ModalMobile,
  ModalTitle,
  ModalTitleContainer,
  ModalSection,
  ControlFilter,
  Label,
  ContainerSearch,
} from './styles';
import { useStateVar } from '~/helpers/useStateVar';
import { colors } from '~/styles/colors';
import SelectSearch from 'react-select-search';
import { CleanBtn, FiltersContainer } from '../Utilities/UtilityFilter/styles';
import { withTransaction } from '@elastic/apm-rum-react';
import { getUserProfile } from '~/helpers/userProfile';
import { AnalysisEmpty } from '../AnalysisEmpty';

export const Geolocation = (): JSX.Element => {
  const [center, setCenter] = useState([-15.533773, -55.62529]);
  const [zoom, setZoom] = useState(4);
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const profile = getUserProfile();
  const [state, render] = useStateVar(() => {
    const state = {
      showFilter: true as boolean,
      isDisabledButton: true as boolean,
      selectedUnit: '',
      selectedCountry: '',
      selectedState: '',
      selectedCity: '',
      needFilter: profile.manageAllClients || profile.manageSomeClient,
    };
    return state;
  });
  const {
    filters,
    citiesPositions,
    statesPositions,
    countriesPositions,
    isLoading,
    handleSelect,
    optionsCountry,
    optionsState,
    optionsCity,
    optionsUnits,
    duts_filt: duts,
    dacs_filt: machines,
  } = useFilter();

  const dutsAndMachines = [...duts, ...machines];

  delete LeafletIcon.Icon.Default.prototype._getIconUrl;

  const fac = (4 / 20) * 0.7 + 0.3;
  LeafletIcon.Icon.Default.mergeOptions({
    iconUrl: MarkerIcon,
    iconRetinaUrl: MarkerIcon,
    iconSize: [55 * fac, 60 * fac],
    iconAnchor: [(55 * fac) / 2, 60 * fac],
    shadowSize: [0, 0],
  });

  const trocouZoom = (e) => {
    // console.log('c', e)
    const map = e.target;
    const layers = map._layers;
    const fac = (map._zoom / 20) * 0.7 + 0.3;
    const i2 = new LeafletIcon.Icon.Default({
      iconSize: [55 * fac, 60 * fac],
      iconAnchor: [(55 * fac) / 2, 60 * fac],
    });
    for (const layerId in layers) {
      const layer = layers[layerId];
      // console.log(layer.setIcon, layer._setIcon, layer)
      if (!layer._icon) continue;
      const icon = layer._icon;
      if (!icon.className) continue;
      if (!icon.className.includes('leaflet-marker-icon')) continue;
      // icon.style.width = '30px'
      // icon.style.height = '30px'
      layer.setIcon(i2);
    }
  };

  const setToInitialStateMap = () => {
    setCenter([-14.235004, -51.92528]);
    return setZoom(4);
  };

  const handleMapGeolocation = () => {
    state.needFilter = false;
    state.showFilter = false;
    render();
  };

  const handleSelectGeolocation = ({ type, value }) => {
    state.isDisabledButton = false;
    handleSelect({ type, value });
    switch (type) {
      case 'country': return handleSelectCountry(value);
      case 'state': return handleSelectState(value);
      case 'city': return handleSelectCity(value);
      case 'unit': return handleSelectUnit(value);
    }
  };

  const handleSelectCountry = (value) => {
    const selectedCountry = value && countriesPositions.find((item) => item.name === value);
    if (selectedCountry) {
      setZoom(4);
      return setCenter([Number(selectedCountry.lat), Number(selectedCountry.lon)]);
    }
    return setToInitialStateMap();
  };

  const handleSelectState = (value) => {
    const selectedState = value && statesPositions.find((item) => item.fullName === value);
    if (selectedState) {
      setZoom(6);
      return setCenter([Number(selectedState.lat), Number(selectedState.lon)]);
    }

    const selectedCountry = filters.country && countriesPositions.find((item) => item.name === filters.country);
    if (selectedCountry) {
      setZoom(4);
      return setCenter([Number(selectedCountry.lat), Number(selectedCountry.lon)]);
    }

    return setToInitialStateMap();
  };

  const handleSelectCity = (value) => {
    const selectedCity = value && citiesPositions.find((item) => item.name === value);
    if (selectedCity) {
      setZoom(11);
      return setCenter([Number(selectedCity.lat), Number(selectedCity.lon)]);
    }

    const selectedState = filters.state && statesPositions.find((item) => item.fullName === filters.state);
    if (selectedState) {
      setZoom(6);
      return setCenter([Number(selectedState.lat), Number(selectedState.lon)]);
    }

    const selectedCountry = filters.country && countriesPositions.find((item) => item.name === filters.country);
    if (selectedCountry) {
      setZoom(4);
      return setCenter([Number(selectedCountry.lat), Number(selectedCountry.lon)]);
    }

    return setToInitialStateMap();
  };

  const handleSelectUnit = (value) => {
    const selectedUnit = value && dutsAndMachines.find((item) => item.UNIT_NAME === value);
    if (selectedUnit) {
      setCenter([Number(selectedUnit.LAT), Number(selectedUnit.LON)]);
      return setZoom(16);
    }

    const selectedCity = filters.city && citiesPositions.find((item) => item.name === filters.city);
    if (selectedCity) {
      setCenter([Number(selectedCity.lat), Number(selectedCity.lon)]);
      return setZoom(11);
    }

    const selectedState = filters.state && statesPositions.find((item) => item.fullName === filters.state);
    if (selectedState) {
      setCenter([Number(selectedState.lat), Number(selectedState.lon)]);
      return setZoom(6);
    }

    const selectedCountry = filters.country && countriesPositions.find((item) => item.name === filters.country);
    if (selectedCountry) {
      setZoom(4);
      return setCenter([Number(selectedCountry.lat), Number(selectedCountry.lon)]);
    }

    return setToInitialStateMap();
  };

  function clearFilters() {
    state.selectedCountry = '';
    state.selectedCity = '';
    state.selectedState = '';
    state.selectedUnit = '';
    state.needFilter = true;
    state.isDisabledButton = true;
    render();
  }

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaGeolocalizacao')}</title>
      </Helmet>
      <AnalysisLayout />
      {isLoading
        ? (
          <EmptyWrapper>
            <Loader variant="primary" size="large" />
          </EmptyWrapper>
        )
        : (
          <>
            <DesktopGeoFilter
              handleMapGeolocation={handleMapGeolocation}
              clearFilters={clearFilters}
              handleSelectGeolocation={handleSelectGeolocation}
              optionsCity={optionsCity}
              optionsCountry={optionsCountry}
              optionsState={optionsState}
              optionsUnits={optionsUnits}
              filters={filters}
              t={t}
              state={state}
              render={render}
            />
            <MobileGeoFilter
              setIsModalOpen={setIsModalOpen}
              isModalOpen={isModalOpen}
              clearFilters={clearFilters}
              handleSelectGeolocation={handleSelectGeolocation}
              optionsCity={optionsCity}
              optionsCountry={optionsCountry}
              optionsState={optionsState}
              optionsUnits={optionsUnits}
              filters={filters}
              t={t}
              state={state}
            />

            {state.needFilter
              ? <AnalysisEmpty />
              : (
                <MapCard>
                  <Map
                    center={center}
                    zoom={zoom}
                    minZoom={1}
                    maxZoom={20}
                    onzoomend={trocouZoom}
                    style={{ width: '100%', height: state.showFilter ? '45rem' : '50rem', zIndex: 0 }}
                  >
                    <TileLayer
                      url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
                    />
                    {dutsAndMachines.map(
                      (machine) => machine.LAT
                  && machine.LON && (
                    <Marker
                      riseOnHover
                      key={(machine as any).DAC_ID || (machine as any).DEV_ID}
                      position={[machine.LAT, machine.LON]}
                    >
                      <Popup>
                        <PopupContainer>
                          <StyledSpan>
                            <Title>{`${t('unidade')}: `}</Title>
                            <Link to={`/analise/unidades/${machine.UNIT_ID}`}>
                              {machine.UNIT_NAME}
                            </Link>
                          </StyledSpan>
                          <StyledSpan>
                            <Title>{`${t('estado')}: `}</Title>
                            {' '}
                            {machine.STATE_ID}
                          </StyledSpan>
                          <StyledSpan>
                            <Title>{`${t('cidade')}: `}</Title>
                            {' '}
                            {machine.CITY_NAME}
                          </StyledSpan>
                        </PopupContainer>
                      </Popup>
                    </Marker>
                      ),
                    )}
                  </Map>
                </MapCard>
              )}
          </>
        )}
    </>
  );
};

function FilterGeo({
  handleMapGeolocation,
  handleSelectGeolocation,
  t,
  optionsCountry,
  filters,
  optionsState,
  optionsUnits,
  optionsCity,
  state,
  clearFilters,
}) {
  return (
    <>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
      }}
      >
        <SearchsGeoloc
          handleSelectGeolocation={handleSelectGeolocation}
          optionsCity={optionsCity}
          optionsCountry={optionsCountry}
          optionsState={optionsState}
          optionsUnits={optionsUnits}
          filters={filters}
          t={t}
          state={state}
        />
        <Button
          style={{
            width: '120px',
            marginLeft: '20px',
            marginTop: 3,
            height: '50px',
          }}
          type="button"
          variant={(state.isDisabledButton || state.isLoading) ? 'disabled' : 'primary'}
          onClick={() => { handleMapGeolocation(); }}
        >
          {t('botaoAnalisar')}
        </Button>
      </div>
      <div>
        <CleanBtn onClick={() => { clearFilters(); }}>
          {t('limparFiltrosCap')}
        </CleanBtn>
      </div>
    </>
  );
}

function SearchsGeoloc({
  handleSelectGeolocation,
  t,
  optionsCountry,
  filters,
  optionsState,
  optionsUnits,
  optionsCity,
  state,
}) {
  const profile = getUserProfile();
  return (
    <>
      <ContainerSearch>
        <Label>{t('pais')}</Label>
        <SelectSearch
          name="country"
          onChange={(e) => { handleSelectGeolocation({ type: 'country', value: e }); state.selectedCountry = e; }}
          options={optionsCountry.map((item) => ({ value: item, name: item }))}
          value={state.selectedCountry}
          placeholder={t('pais')}
        />
      </ContainerSearch>
      <ContainerSearch>
        <Label>{t('estado')}</Label>
        <SelectSearch
          name="state"
          onChange={(e) => { handleSelectGeolocation({ type: 'state', value: e }); state.selectedState = e; }}
          options={optionsState.map((item) => ({ value: item, name: item }))}
          value={state.selectedState}
          disabled={profile.manageAllClients ? !filters.country : false}
          placeholder={t('estado')}
        />
      </ContainerSearch>
      <ContainerSearch>
        <Label>{t('cidade')}</Label>
        <SelectSearch
          name="city"
          onChange={(e) => { handleSelectGeolocation({ type: 'city', value: e }); state.selectedCity = e; }}
          options={optionsCity.map((item) => ({ value: item, name: item }))}
          value={state.selectedCity}
          disabled={profile.manageAllClients ? !filters.state : false}
          placeholder={t('cidade')}
        />
      </ContainerSearch>
      <ContainerSearch width={[1, 1, 1, 1, 1, 1 / 5]} minWidth="280px" pb={[14, 14, 14, 14, 14, 0]}>
        <Label>{t('unidade')}</Label>
        <SelectSearch
          name="unit"
          onChange={(e) => { handleSelectGeolocation({ type: 'unit', value: e }); state.selectedUnit = e; }}
          options={optionsUnits.map((item) => ({ value: item, name: item }))}
          value={state.selectedUnit}
          disabled={profile.manageAllClients ? !filters.city : false}
          placeholder={t('unidade')}
        />
      </ContainerSearch>
    </>
  );
}

function DesktopGeoFilter({
  handleMapGeolocation,
  clearFilters,
  handleSelectGeolocation,
  t,
  optionsCountry,
  filters,
  optionsState,
  optionsUnits,
  optionsCity,
  state,
  render,
}) {
  return (
    <DesktopWrapper>
      <FiltersContainer
        flexWrap={['wrap', 'wrap', 'wrap', 'nowrap', 'nowrap']}
        style={{
          borderBottom: state.showFilter ? `2px solid ${colors.Grey100}` : 'none',
          marginBottom: 20,
        }}
        bg={state.showFilter ? '#f8f8f8' : '#ffffff'}
        padding={`24px 20px ${state.showFilter ? '16px' : '0'} 20px`}
      >
        {
                  state.showFilter && (
                    <Flex
                      flexDirection="column"
                      justifyContent="center"
                      mt={state.showFilter ? 0 : -23}
                      alignItems="flex-start"
                      style={{
                        transition: 'visibility 0.5s, opacity 0.5s, background-color 0.5s, margin-top 1s',
                        visibility: state.showFilter ? 'visible' : 'hidden',
                        opacity: state.showFilter ? '1' : '0',
                      }}
                      flexWrap={['wrap', 'wrap', 'wrap', 'wrap', 'nowrap']}
                    >
                      <FilterGeo
                        handleMapGeolocation={handleMapGeolocation}
                        handleSelectGeolocation={handleSelectGeolocation}
                        optionsCity={optionsCity}
                        optionsCountry={optionsCountry}
                        optionsState={optionsState}
                        optionsUnits={optionsUnits}
                        filters={filters}
                        t={t}
                        state={state}
                        clearFilters={clearFilters}
                      />
                    </Flex>
                  )
                }
      </FiltersContainer>
      <ControlFilter style={{ marginBottom: '20px', width: '110px' }} onClick={() => { state.showFilter = !state.showFilter; render(); }}>
        <FilterIcon style={{ marginRight: 4 }} />
        {t('filtros')}
        {state.showFilter ? <ArrowDownIconV2 width="8" heigth="7" style={{ marginLeft: 4 }} /> : <ArrowUpIconV2 width="8" heigth="7" style={{ marginLeft: 4 }} />}
      </ControlFilter>
    </DesktopWrapper>
  );
}

function MobileGeoFilter({
  setIsModalOpen,
  isModalOpen,
  clearFilters,
  handleSelectGeolocation,
  t,
  optionsCountry,
  filters,
  optionsState,
  optionsUnits,
  optionsCity,
  state,
}) {
  return (
    <>
      <MobileWrapper>
        <Flex mb={24} mt={24}>
          <Box width={1}>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              {t('filtrarPor')}
            </Button>
          </Box>
        </Flex>
      </MobileWrapper>
      <ModalMobile isModalOpen={isModalOpen}>
        <Flex mb={32}>
          <Box width={1}>
            <ModalSection>
              <ModalTitleContainer>
                <ModalTitle>{t('filtrarPor')}</ModalTitle>
                <CloseIcon size="11px" onClick={() => setIsModalOpen(false)} />
              </ModalTitleContainer>
            </ModalSection>
          </Box>
        </Flex>
        <Flex flexWrap="wrap" pl={16} pr={16}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            justifyContent: 'space-between',
          }}
          >
            <SearchsGeoloc
              handleSelectGeolocation={handleSelectGeolocation}
              optionsCity={optionsCity}
              optionsCountry={optionsCountry}
              optionsState={optionsState}
              optionsUnits={optionsUnits}
              filters={filters}
              t={t}
              state={state}
            />
          </div>
          <Box width={1}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { clearFilters(); }}
              style={{
                marginBottom: 10,
                marginTop: 10,
              }}
            >
              {t('limparFiltrosCap')}
            </Button>
            <Button type="button" variant={(state.isDisabledButton || state.isLoading) ? 'disabled' : 'primary'} onClick={() => { setIsModalOpen(false); state.needFilter = false; }}>
              {t('botaoFiltrar')}
            </Button>
          </Box>
        </Flex>
      </ModalMobile>
    </>
  );
}

export default withTransaction('Geolocation', 'component')(Geolocation);

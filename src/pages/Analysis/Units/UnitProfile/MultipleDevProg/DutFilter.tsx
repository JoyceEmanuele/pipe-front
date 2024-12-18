import {
  ReactElement, useCallback, useEffect, useMemo,
} from 'react';
import { Box, Flex } from 'reflexbox';
import { IconWrapperSearch, Label, SearchInput } from '../styles';
import { useTranslation } from 'react-i18next';
import { useStateVar } from 'helpers/useStateVar';
import { getCitiesList, getStatesList, getUnitsList } from 'helpers/genericHelper';
import SelectSearch, { SelectSearchOption } from 'react-select-search';
import { SearchIcon } from 'icons';
import { delimiters } from './constants';
import { WithContext as ReactTags } from 'react-tag-input';
import { ClearFilterButton } from './components/ClearFilterButton';
import { Button } from 'components';

export interface SelectedFilterDutOptions {
  searchState?: {text: string}[],
  connections?: string[],
  units?: string[],
  states?: string[],
  cities?: string[],
  dutAutConfigs?: string[],
  dutControlOperations?: string[],
  hasProgrammingMult?: boolean,
}

interface DutFilterProps {
  isFiltering: boolean;
  onClickFilter: (filterOptions: SelectedFilterDutOptions) => void;
  clientId?: number;
  unitId?: number;
}

const flexGrowFields = [1, 1, 1, 0, 0];

export const DutFilter = ({
  isFiltering,
  onClickFilter,
  clientId,
  unitId,
}: DutFilterProps): ReactElement => {
  const { t } = useTranslation();

  const [state, render] = useStateVar({
    searchState: [] as { text: string }[],
    selectedConnections: [] as string[],
    unitsListOpts: [] as {name: string, value: string, clientId: number}[],
    statesListOpts: [] as {name: string, value: string}[],
    citiesListOpts: [] as {name: string, value: string}[],
    selectedCityOpts: [] as string[],
    selectedStateOpts: [] as string[],
    selectedUnitOpts: [] as string[],
    selectedDutControlOperations: [] as string[],
    selectedDutAutConfigurations: ['IR'] as string[],
    selectedProgrammingMult: 'Todos' as ('Com Programacao'|'Sem Programacao'|'Todos'),
  });

  const connectionsOptions = useMemo(() => [
    { value: 'ONLINE', name: t('online') },
    { value: 'LATE', name: t('late') },
    { value: 'OFFLINE', name: t('offline') },
  ], []);

  const dutControlOperationOptions = useMemo(() => [
    { label: t('modoEco'), value: '1_CONTROL' },
    { label: t('modoSobDemanda'), value: '2_SOB_DEMANDA' },
    { label: t('modoBackup'), value: '3_BACKUP' },
    { label: t('modoBloqueio'), value: '4_BLOCKED' },
    { label: t('modoBackupEco'), value: '5_BACKUP_CONTROL' },
    { label: t('modoEco2'), value: '6_BACKUP_CONTROL_V2' },
    { label: t('modoForcado'), value: '7_FORCED' },
  ], []);

  const dutAutCfgOptions = useMemo(() => [
    { label: t('infraVermelhoPadrao'), value: 'IR' },
    { label: t('rele'), value: 'RELAY' },
    { label: t('desabilitada'), value: 'DISABLED' },
  ], []);

  const getStateUnitCitiesList = async (clientId: number): Promise<void> => {
    if (state.unitsListOpts.length > 0 && state.statesListOpts.length > 0 && state.citiesListOpts.length > 0) {
      return;
    }

    await Promise.all([
      getStatesList(state, render),
      getUnitsList(state, render),
      getCitiesList(state, render),
    ]);
    state.unitsListOpts = state.unitsListOpts.filter((unit) => unit.clientId === clientId);

    render();
  };

  const handleSearchDelete = useCallback((i: number): void => {
    state.searchState = state.searchState.filter((tag, index) => index !== i);
    render();

    if (unitId) { onClickFilter({}); }
  }, []);

  const handleSearchAddition = useCallback((tag: {text: string}): void => {
    state.searchState = [...state.searchState, tag];
    render();

    if (unitId) { onClickFilter({}); }
  }, []);

  const filterOptions = useCallback((options: SelectSearchOption[]) => (
    query: string,
  ): SelectSearchOption[] => {
    if (options.length > 0) {
      return options
        .filter((item) => {
          if (item.name?.length > 0) {
            return (
              (item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')))
              || state.selectedUnitOpts.includes(item.name) || state.selectedStateOpts.includes(item.name) || state.selectedCityOpts.includes(item.name)
            );
          }
          return false;
        });
    }
    return options;
  }, []);

  const onFilterStateChange = useCallback((states):void => {
    state.selectedStateOpts = states;
    render();
  }, []);

  const onFilterCityChange = useCallback((cities): void => {
    state.selectedCityOpts = cities;
    render();
  }, []);

  const onFilterUnitChange = useCallback((units): void => {
    state.selectedUnitOpts = units;
    render();
  }, []);

  const onFilterConnectionsChange = useCallback((connections): void => {
    state.selectedConnections = connections;
    render();
  }, []);

  const onFilterDutControlOperations = (controlOperations) => {
    state.selectedDutControlOperations = controlOperations;
    render();
  };

  const onFilterProgrammingMultChange = (programmingMult) => {
    state.selectedProgrammingMult = programmingMult;
    render();
  };

  const onFilterDutAutConfigurations = (dutAutConfigurations) => {
    state.selectedDutAutConfigurations = dutAutConfigurations;
    render();
  };

  const clearFilters = useCallback((): void => {
    state.selectedUnitOpts = [];
    state.selectedCityOpts = [];
    state.selectedStateOpts = [];
    state.selectedConnections = [];
    state.selectedDutControlOperations = [];
    state.selectedDutAutConfigurations = ['IR'];
    state.selectedProgrammingMult = 'Todos';
    render();
  }, []);

  function onClickFilterButton():void {
    let hasProgrammingMult: boolean|undefined;
    if (state.selectedProgrammingMult === 'Com Programacao') hasProgrammingMult = true;
    if (state.selectedProgrammingMult === 'Sem Programacao') hasProgrammingMult = false;
    onClickFilter({
      searchState: state.searchState,
      cities: state.selectedCityOpts,
      connections: state.selectedConnections,
      states: state.selectedStateOpts,
      units: state.selectedUnitOpts,
      dutAutConfigs: state.selectedDutAutConfigurations,
      dutControlOperations: state.selectedDutControlOperations,
      hasProgrammingMult,
    });
  }

  useEffect(() => {
    if (clientId) {
      getStateUnitCitiesList(clientId);
    }
  }, []);

  return (
    <Flex
      flexWrap="nowrap"
      flexDirection="column"
    >
      {clientId && (
      <Flex
        alignItems={['center', 'center', 'center', 'center', 'flex-start']}
        justifyContent="space-between"
        flexDirection={['column', 'column', 'column', 'column', 'row']}
        mt={15}
        mb={15}
      >
        <Flex flexDirection="column" style={{ gap: '8px' }}>
          <Flex
            flexWrap="wrap"
            flexDirection="row"
            alignItems="left"
            style={{ gap: '8px 15px' }}
          >
            <Box
              flexGrow={flexGrowFields}
              width={['auto', 'auto', '300px', '300px', '300px']}
            >
              <SearchInput>
                <div style={{ width: '100%' }}>
                  <Label>{t('pesquisar')}</Label>
                  <ReactTags
                    tags={state.searchState}
                    handleDelete={(tag) => {
                      handleSearchDelete(tag);
                      if (unitId) {
                        onClickFilter({
                          searchState: state.searchState,
                        });
                      }
                    }}
                    handleAddition={(tag) => {
                      handleSearchAddition(tag);
                      if (unitId) {
                        onClickFilter({
                          searchState: state.searchState,
                        });
                      }
                    }}
                    delimiters={delimiters}
                    allowDragDrop={false}
                    allowDeleteFromEmptyInput={false}
                    inputFieldPosition="top"
                    minQueryLength={2}
                    placeholder=""
                  />
                </div>
                <IconWrapperSearch>
                  <SearchIcon />
                </IconWrapperSearch>
              </SearchInput>
            </Box>
            <Box width="300px" marginTop="0.8px" flexGrow={flexGrowFields}>
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('estado')}</Label>
                  <SelectSearch
                    options={state.statesListOpts}
                    value={state.selectedStateOpts}
                    printOptions="on-focus"
                    search
                    multiple
                    filterOptions={filterOptions}
                    onChange={onFilterStateChange}
                    placeholder={t('selecioneOsEstados')}
                    disabled={isFiltering}
                    closeOnSelect={false}
                  />
                </div>
              </SearchInput>
            </Box>
            <Box width="300px" marginTop="0.8px" flexGrow={flexGrowFields}>
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('cidade')}</Label>
                  <SelectSearch
                    options={state.citiesListOpts}
                    value={state.selectedCityOpts}
                    printOptions="on-focus"
                    search
                    multiple
                    filterOptions={filterOptions}
                    onChange={onFilterCityChange}
                    placeholder={t('selecioneAsCidades')}
                    disabled={isFiltering}
                    closeOnSelect={false}
                  />
                </div>
              </SearchInput>
            </Box>
            <Box width="300px" marginTop="0.8px" flexGrow={flexGrowFields}>
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('unidades')}</Label>
                  <SelectSearch
                    options={state.unitsListOpts}
                    value={state.selectedUnitOpts}
                    printOptions="on-focus"
                    search
                    multiple
                    filterOptions={filterOptions}
                    onChange={onFilterUnitChange}
                    placeholder={t('selecioneAsUnidades')}
                    disabled={isFiltering}
                    closeOnSelect={false}
                  />
                </div>
              </SearchInput>
            </Box>
            <Box width="300px" marginTop="0.8px" flexGrow={flexGrowFields}>
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('conexao')}</Label>
                  <SelectSearch
                    options={connectionsOptions}
                    value={state.selectedConnections}
                    printOptions="on-focus"
                    search
                    multiple
                    filterOptions={filterOptions}
                    onChange={onFilterConnectionsChange}
                    placeholder={t('selecioneAConexao')}
                    disabled={isFiltering}
                    closeOnSelect={false}
                  />
                </div>
              </SearchInput>
            </Box>
            <Box width="300px" marginTop="0.8px" flexGrow={flexGrowFields}>
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('tipoAutomacao')}</Label>
                  <SelectSearch
                    options={dutAutCfgOptions.map(({ label, value }) => ({ name: label, value }))}
                    value={state.selectedDutAutConfigurations?.length > 0 ? state.selectedDutAutConfigurations : ['IR']}
                    printOptions="on-focus"
                    search
                    multiple
                    filterOptions={filterOptions}
                    onChange={onFilterDutAutConfigurations}
                    placeholder={t('tipoAutomacao')}
                    disabled={isFiltering}
                    closeOnSelect={false}
                  />
                </div>
              </SearchInput>
            </Box>
            <Box width="300px" marginTop="0.8px" flexGrow={flexGrowFields}>
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('tipoControle')}</Label>
                  <SelectSearch
                    options={[
                      ...dutControlOperationOptions.map(({ label, value }) => ({ name: label, value })),
                      { name: t('semModoDeControle'), value: '0_NO_CONTROL' },
                    ]}
                    value={state.selectedDutControlOperations}
                    printOptions="on-focus"
                    search
                    multiple
                    filterOptions={filterOptions}
                    onChange={onFilterDutControlOperations}
                    placeholder={t('tipoControle')}
                    disabled={isFiltering}
                    closeOnSelect={false}
                  />
                </div>
              </SearchInput>
            </Box>
            <Box width="300px" marginTop="0.8px" flexGrow={[1, 1, 1, 0, 0]}>
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('temProgramacaoMultipla')}</Label>
                  <SelectSearch
                    options={[
                      { value: 'Com Programacao', name: t('sim') },
                      { value: 'Sem Programacao', name: t('nao') },
                      { value: 'Todos', name: t('todos') },
                    ]}
                    value={state.selectedProgrammingMult ?? 'Todos'}
                    printOptions="on-focus"
                    search
                    filterOptions={filterOptions}
                    onChange={onFilterProgrammingMultChange}
                    placeholder={t('selecione')}
                    disabled={isFiltering}
                  />
                </div>
              </SearchInput>
            </Box>
          </Flex>
          <Flex width="100%" justifyContent="space-between">
            <ClearFilterButton onClick={clearFilters} />
          </Flex>
        </Flex>
        <Button
          style={{
            width: '110px',
            minWidth: '100px',
          }}
          type="button"
          variant={(isFiltering) ? 'disabled' : 'primary'}
          onClick={onClickFilterButton}
        >
          {t('filtrar')}
        </Button>
      </Flex>
      )}
    </Flex>
  );
};

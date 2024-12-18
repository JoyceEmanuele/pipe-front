import {
  memo,
  ReactElement, useCallback, useEffect, useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'reflexbox';
import { IconWrapperSearch, Label, SearchInput } from '../styles';
import { WithContext as ReactTags } from 'react-tag-input';
import { delimiters } from './constants';
import { SearchIcon } from 'icons';
import SelectSearch, { SelectSearchOption } from 'react-select-search';
import { Button } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { ClearFilterButton } from './components/ClearFilterButton';
import { getStateUnitCitiesList } from './helpers/filter';

export interface SelectedFilterDamOptions {
  searchState?: {text: string}[],
  connections?: string[],
  ecoModes?: string[],
  controlModes?: string[],
  programming?: string,
  units?: string[],
  states?: string[],
  cities?: string[]
}

interface DamFilterProps {
  isFiltering: boolean;
  onClickFilter: (filterOptions: SelectedFilterDamOptions) => void;
  clientId?: number;
  unitId?: number;
}

const flexGrowFields = [1, 1, 1, 0, 0];

export const DamFilter = memo(({
  clientId,
  isFiltering,
  onClickFilter,
  unitId,
}: DamFilterProps): ReactElement => {
  const { t } = useTranslation();
  const [state, render] = useStateVar({
    searchState: [] as { text: string }[],
    selectedConnections: [] as string[],
    selectedEcoModes: [] as string[],
    selectedControlModes: [] as string[],
    selectedProgramming: 'Todos' as string,
    unitsListOpts: [] as {name: string, value: string, clientId: number}[],
    statesListOpts: [] as {name: string, value: string}[],
    citiesListOpts: [] as {name: string, value: string}[],
    selectedCityOpts: [] as string[],
    selectedStateOpts: [] as string[],
    selectedUnitOpts: [] as string[],
  });

  const programmingOptions = useMemo(() => [
    { value: 'Com Programacao', name: t('comProgramacao') },
    { value: 'Sem Programacao', name: t('semProgramacao') },
    { value: 'Todos', name: t('todos') },
  ], []);

  const controlModesOptions = useMemo(() => [
    { value: 'Automático', name: t('automatico') },
    { value: 'Local', name: t('local') },
    { value: 'Manual', name: t('manual') },
    { value: 'Sem controle', name: t('semControle') },
  ], []);

  const ecoModesOptions = useMemo(() => [
    { value: 'habilitado', name: t('habilitado') },
    { value: 'desabilitado', name: t('desabilitado') },
  ], []);

  const connectionsOptions = useMemo(() => [
    { value: 'ONLINE', name: t('online') },
    { value: 'LATE', name: t('late') },
    { value: 'OFFLINE', name: t('offline') },
  ], []);

  const handleSearchDelete = useCallback((i: number): void => {
    state.searchState = state.searchState.filter((tag, index) => index !== i);
    render();

    if (unitId) { onClickFilterButton(); }
  }, []);

  const handleSearchAddition = useCallback((tag: {text: string}): void => {
    state.searchState = [...state.searchState, tag];
    render();

    if (unitId) { onClickFilterButton(); }
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

  const onFilterEcoModesChange = useCallback((ecoModes): void => {
    state.selectedEcoModes = ecoModes;
    render();
  }, []);

  const onFilterControlModesChange = useCallback((controlModes): void => {
    state.selectedControlModes = controlModes;
    render();
  }, []);

  const onFilterProgrammingChange = useCallback((programming): void => {
    state.selectedProgramming = programming;
    render();
  }, []);

  const clearFilters = useCallback((): void => {
    state.selectedUnitOpts = [];
    state.selectedCityOpts = [];
    state.selectedStateOpts = [];
    state.selectedConnections = [];
    state.selectedEcoModes = [];
    state.selectedControlModes = [];
    render();
  }, []);

  function onClickFilterButton():void {
    onClickFilter({
      searchState: state.searchState,
      cities: state.selectedCityOpts,
      connections: state.selectedConnections,
      controlModes: state.selectedControlModes,
      ecoModes: state.selectedEcoModes,
      programming: state.selectedProgramming,
      states: state.selectedStateOpts,
      units: state.selectedUnitOpts,
    });
  }

  useEffect(() => {
    getStateUnitCitiesList(state, render, clientId);
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
              width="90%"
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
                    <Label>{t('modoEco')}</Label>
                    <SelectSearch
                      options={ecoModesOptions}
                      value={state.selectedEcoModes}
                      printOptions="on-focus"
                      search
                      multiple
                      filterOptions={filterOptions}
                      onChange={onFilterEcoModesChange}
                      placeholder={t('modoEco')}
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
                      options={controlModesOptions}
                      value={state.selectedControlModes}
                      printOptions="on-focus"
                      search
                      multiple
                      filterOptions={filterOptions}
                      onChange={onFilterControlModesChange}
                      placeholder={t('tipoControle')}
                      disabled={isFiltering}
                      closeOnSelect={false}
                    />
                  </div>
                </SearchInput>
              </Box>
              <Box width="300px" marginTop="0.8px" flexGrow={flexGrowFields}>
                <SearchInput>
                  <div style={{ width: '100%', paddingTop: 3 }}>
                    <Label>{t('programacao')}</Label>
                    <SelectSearch
                      options={programmingOptions}
                      value={state.selectedProgramming ?? 'Todos'}
                      printOptions="on-focus"
                      search
                      filterOptions={filterOptions}
                      onChange={onFilterProgrammingChange}
                      placeholder={t('selecioneTipo')}
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
            variant={isFiltering ? 'disabled' : 'primary'}
            onClick={onClickFilterButton}
          >
            {t('filtrar')}
          </Button>
        </Flex>
      )}
    </Flex>
  );
});

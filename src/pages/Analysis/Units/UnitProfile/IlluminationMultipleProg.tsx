import SelectSearch, { SelectSearchOption } from 'react-select-search';
import { Flex, Box } from 'reflexbox';
import {
  Button,
  Checkbox,
  Loader,
  ModalWindow,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { useTranslation } from 'react-i18next';
import { ArrowDownIconV2, ArrowUpIconV2, SearchIcon } from 'icons';
import { toast } from 'react-toastify';
import {
  Label,
  SearchInput,
  IconWrapperSearch,
  UnderlineBtn,
  StyledLink,
} from './styles';
import { WithContext as ReactTags } from 'react-tag-input';
import { useEffect, useState } from 'react';
import { SmallTrashIcon } from '~/icons/Trash';
import {
  DALSchedule,
  DalExceptionForm, DalSchedForm, ExceptionInfo, ExceptionSchedCard, SchedCard, ScheduleInfo, parseDamProgToDalProg,
} from '../../SchedulesModals/DAL_Schedule';
import { ApiResps, apiCall } from '~/providers';
import { AxiosError } from 'axios';
import { SchedulesList } from '../../SchedulesModals/DAM_Schedule';
import { FullProg_v4 } from '~/providers/types';
import { getCachedDevInfo } from '~/helpers/cachedStorage';
import { SmallWarningIcon } from '~/icons/WarningIcon';
import { LoaderWithText } from '~/components/LoaderWithText';
import ReactTooltip from 'react-tooltip';
import i18n from '../../../../i18n';
import { useHistory } from 'react-router-dom';
import { validateStringTimeInterval } from '~/helpers/validateTime';

interface IlluminationMultipleProgProperties {
  clientId?: number;
  unitId?: number;
}

const KeyCodes = {
  comma: 188,
  slash: 191,
  enter: [10, 13],
};

const delimiters = [...KeyCodes.enter, KeyCodes.comma, KeyCodes.slash];

function filterString(stringsToCheck: string[], searchState: { text: string }[], searchPartial?: boolean) {
  const checkedWords = [] as string[];
  for (const stringToCheck of stringsToCheck) {
    for (const searchItem of searchState) {
      if (stringToCheck) {
        const index = stringToCheck.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').indexOf(searchItem.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
        if (index >= 0) {
          checkedWords.push(searchItem.text);
        }
      }
    }
  }

  if (searchPartial) {
    return passedSomeSearch(checkedWords, searchState);
  }

  return passedAllSearchs(checkedWords, searchState);
}

function passedAllSearchs(stringsPassed: string[], searchState: { text: string }[]) {
  for (const searchItem of searchState) {
    if (!stringsPassed.includes(searchItem.text)) {
      return false;
    }
  }

  return true;
}

function passedSomeSearch(stringsPassed: string[], searchState: { text: string }[]) {
  for (const searchItem of searchState) {
    if (stringsPassed.includes(searchItem.text)) {
      return true;
    }
  }

  return false;
}

const handleProgFilter = (hasSchedule: boolean, selectedProgs: string | null) => {
  if (selectedProgs === 'Todos') return true;

  if (selectedProgs === 'Com programação' && hasSchedule) return true;
  if (selectedProgs === 'Sem programação' && !hasSchedule) return true;

  return false;
};

async function checkDevOnline(devId: string, illumId: number, devsErrors) {
  const t = i18n.t.bind(i18n);

  const devInfo = await getCachedDevInfo(devId);

  if (devInfo.status !== 'ONLINE') {
    if (devsErrors.findIndex((x) => x.DEVICE_CODE === devId && x.Motivo === t('dispositivoOfflineWithDevId', { devId: '' })) === -1) {
      devsErrors.push({ DEVICE_CODE: devId, ILLUMINATION_ID: illumId, Motivo: t('dispositivoOfflineWithDevId', { devId: '' }) });
      toast.error(t('dispositivoOfflineWithDevId', { devId }));
    }
  }
}

const filterBySearchState = (illum: ApiResps['/dal-dam/get-illumination-list'][number], searchState: { text: string}[]): boolean => (searchState.length === 0 || filterString([illum.STATE_NAME, illum.UNIT_NAME, illum.CITY_NAME, illum.ILLUMINATION_NAME, illum.DEVICE_CODE], searchState, true));

const filterIlluminations = (list: ApiResps['/dal-dam/get-illumination-list'], searchState: { text: string }[], selectedsStates: string[], selectedsCities: string[], selectedsUnits: string[], selectedProgs: string | null) => (
  list.filter((illum) => filterBySearchState(illum, searchState))
    .filter((illum) => (selectedsStates.length === 0 ? true : selectedsStates.includes(illum.STATE_NAME)))
    .filter((illum) => (selectedsCities.length === 0 ? true : selectedsCities.includes(illum.CITY_NAME)))
    .filter((illum) => (selectedsUnits.length === 0 ? true : selectedsUnits.includes(illum.UNIT_NAME)))
    .filter((illum) => (!selectedProgs ? true : handleProgFilter(illum.HAS_SCHEDULE, selectedProgs)))
);

export const IlluminationMultipleProgFilter = ({
  state, render, clientId,
}): JSX.Element => {
  const { t } = useTranslation();
  function handleSearchDelete(i) {
    state.searchState = state.searchState.filter((tag, index) => index !== i);
    render();
  }

  function handleSearchAddition(tag) {
    state.searchState = [...state.searchState, tag];
    render();
  }

  function toggleSelectAllIlluminations() {
    // @ts-ignore
    if (filterIlluminations(state.illuminations, state.searchState, state.selectedsStates, state.selectedsCities, state.selectedsUnits, state.selectedProgs).every((illum) => illum.checked)) {
      // @ts-ignore
      filterIlluminations(state.illuminations, state.searchState, state.selectedsStates, state.selectedsCities, state.selectedsUnits, state.selectedProgs).forEach((illum) => illum.checked = false);
      Object.keys(state.illuminationsGroupedBySite).forEach((unit) => {
        state.illuminationsGroupedBySite[unit].CHECKED = false;
      });
    } else {
      // @ts-ignore
      filterIlluminations(state.illuminations, state.searchState, state.selectedsStates, state.selectedsCities, state.selectedsUnits, state.selectedProgs).forEach((illum) => illum.checked = true);
      Object.keys(state.illuminationsGroupedBySite).forEach((unit) => {
        state.illuminationsGroupedBySite[unit].CHECKED = true;
      });
    }
    render();
  }
  const filterOptions = (options: SelectSearchOption[]) => (
    query: string,
  ): SelectSearchOption[] => {
    if (options.length > 0) {
      return options
        .filter((item) => {
          if (item.name?.length > 0) {
            return (
              (item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')))
              || state.selectedsUnits.includes(item.name) || state.selectedsStates.includes(item.name) || state.selectedsCities.includes(item.name)
            );
          }
          return false;
        });
    }
    return options;
  };

  const onFilterStateChange = (states) => {
    state.selectedsStates = states;
    render();
  };

  const onFilterCityChange = (cities) => {
    state.selectedsCities = cities;
    render();
  };

  const onFilterUnitChange = (units) => {
    state.selectedsUnits = units;
    render();
  };

  const onFilterProgChange = (prog) => {
    state.selectedProgs = prog;
    render();
  };

  const clearProgFilter = () => {
    state.selectedProgs = null;
    render();
  };

  const clearUnitFilter = () => {
    state.selectedsUnits = [];
    render();
  };

  const clearCityFilter = () => {
    state.selectedsCities = [];
    render();
  };

  const clearStateFilter = () => {
    state.selectedsStates = [];
    render();
  };

  const isAllIlluminationsSelecteds = () => (
    state.illuminations.every((illum) => illum.checked)
  );

  return (
    <>
      {(state.illuminations.length > 0) && (
      <Flex
        flexWrap="nowrap"
        flexDirection="column"
        mt="20px"
        width="98%"
      >
        <Flex flexDirection="column" width="100%">
          <span style={{ fontWeight: 'bold', fontSize: '20px' }}>{t('selecionarCircuitosTitulo')}</span>
          <span style={{ color: '#8b8b8b' }}>
            {t('selecionarCircuitos')}
          </span>
          <Box alignSelf="end">
            <Checkbox
              size={20}
              label={t('Selecionar todos')}
              checked={isAllIlluminationsSelecteds()}
              onClick={() => { toggleSelectAllIlluminations(); render(); }}
            />
          </Box>
        </Flex>
        <Flex
          flexWrap="nowrap"
          flexDirection="row"
          alignItems="left"
          mt={15}
          mb={15}
        >
          <div style={{ width: '342px', marginRight: '20px' }}>
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
          </div>
          {clientId
          && (
          <>
            <Box width="240px" marginTop="0.8px" marginRight="20px">
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('estado')}</Label>
                  <SelectSearch
                    options={Array.from(state.illuminations.reduce((set, dev) => { if (!set.has(dev.STATE_NAME)) { set.add(dev.STATE_NAME); } return set; }, new Set())).map((unit) => ({ name: unit as string, value: unit as string }))}
                    value={state.selectedsStates}
                    printOptions="on-focus"
                    search
                    multiple
                    filterOptions={filterOptions}
                    onChange={onFilterStateChange}
                    placeholder={t('selecioneOsEstados')}
                    disabled={state.isLoading}
                    closeOnSelect={false}
                  />
                </div>
              </SearchInput>
              <UnderlineBtn
                onClick={clearStateFilter}
              >
                {t('limparFiltro')}
              </UnderlineBtn>
            </Box>
            <Box width="240px" marginTop="0.8px" marginRight="20px">
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('cidade')}</Label>
                  <SelectSearch
                    options={Array.from(state.illuminations.reduce((set, dev) => { if (!set.has(dev.CITY_NAME)) { set.add(dev.CITY_NAME); } return set; }, new Set())).map((unit) => ({ name: unit as string, value: unit as string }))}
                    value={state.selectedsCities}
                    printOptions="on-focus"
                    search
                    multiple
                    filterOptions={filterOptions}
                    onChange={onFilterCityChange}
                    placeholder={t('selecioneAsCidades')}
                    disabled={state.isLoading}
                    closeOnSelect={false}
                  />
                </div>
              </SearchInput>
              <UnderlineBtn
                onClick={clearCityFilter}
              >
                {t('limparFiltro')}
              </UnderlineBtn>
            </Box>
            <Box width="240px" marginTop="0.8px" marginRight="20px">
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('unidades')}</Label>
                  <SelectSearch
                    options={Array.from(state.illuminations.reduce((set, dev) => { if (!set.has(dev.UNIT_NAME)) { set.add(dev.UNIT_NAME); } return set; }, new Set())).map((unit) => ({ name: unit as string, value: unit as string }))}
                    value={state.selectedsUnits}
                    printOptions="on-focus"
                    search
                    multiple
                    filterOptions={filterOptions}
                    onChange={onFilterUnitChange}
                    placeholder={t('selecioneAsUnidades')}
                    disabled={state.isLoading}
                    closeOnSelect={false}
                  />
                </div>
              </SearchInput>
              <UnderlineBtn
                onClick={clearUnitFilter}
              >
                {t('limparFiltro')}
              </UnderlineBtn>
            </Box>
            <Box width="240px" marginTop="0.8px">
              <SearchInput>
                <div style={{ width: '100%', paddingTop: 3 }}>
                  <Label>{t('programacao')}</Label>
                  <SelectSearch
                    options={[[t('comProgramacao'), 'Com programação'], [t('semProgramacao'), 'Sem programação'], [t('todos'), 'Todos']].map((opt) => ({ name: opt[0] as string, value: opt[1] as string }))}
                    value={state.selectedProgs}
                    printOptions="on-focus"
                    search
                    filterOptions={filterOptions}
                    onChange={onFilterProgChange}
                    placeholder={t('selecioneTipo')}
                    disabled={state.isLoading}
                    closeOnSelect={false}
                  />
                </div>
              </SearchInput>
              <UnderlineBtn
                onClick={clearProgFilter}
              >
                {t('limparFiltro')}
              </UnderlineBtn>
            </Box>
          </>
          )}
        </Flex>
      </Flex>
      )}
    </>
  );
};

export const IlluminationMultipleProgItemList = ({
  unitId, state, render, clientId,
}): JSX.Element => {
  const { t } = useTranslation();

  const changeCircuitStatus = (illuminationId: number, illumDevId: number) => {
    state.illuminations.forEach((illum) => {
      if (illum.ILLUMINATION_ID === illuminationId && illum.ILLUM_DEV_ID === illumDevId) {
        illum.checked = !illum.checked;
        render();
      }
    });
    let isAllChecked = true;
    state.illuminations.forEach((illum) => {
      if (illum.UNIT_ID === Number(unitId)) {
        if (!illum.checked) isAllChecked = false;
      }
    });
    state.illuminationsGroupedBySite[unitId].CHECKED = isAllChecked;
    render();
  };

  const handleAllFromUnit = () => {
    state.illuminations.forEach((illum) => {
      if (illum.UNIT_ID === state.illuminationsGroupedBySite[unitId].UNIT_ID) {
        illum.checked = state.illuminationsGroupedBySite[unitId].CHECKED;
      }
    });
    render();
  };

  const cutText = (text: string, size: number) => (text?.length > size ? `${text.slice(0, size)}...` : text);

  return (
    <Flex width="96%" marginBottom="10px" flexDirection="column">
      {clientId && (
        <Flex backgroundColor="#F0F0F0" onClick={(e) => { e.stopPropagation(); state.illuminationsGroupedBySite[unitId].COLLAPSED = !state.illuminationsGroupedBySite[unitId].COLLAPSED; render(); }} color="#8b8b8b" fontSize="12px" width="100%" flexDirection="row" alignItems="center" justifyContent="space-between" style={{ borderRadius: '12px', cursor: 'pointer' }} padding="10px">
          <Flex flexDirection="row" alignItems="center">
            <Checkbox
              size={20}
              checked={state.illuminationsGroupedBySite[unitId].CHECKED}
              onClick={(e) => { e.stopPropagation(); state.illuminationsGroupedBySite[unitId].CHECKED = !state.illuminationsGroupedBySite[unitId].CHECKED; render(); handleAllFromUnit(); }}
            />
            <Flex flexDirection="column" width="80px" ml="10px">
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
                {t('estado')}
              </span>
              <span>
                {state.illuminationsGroupedBySite[unitId].STATE_NAME || '-'}
              </span>
            </Flex>
            <Flex flexDirection="column" width="150px" ml="20px">
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
                {t('cidade')}
              </span>
              <span data-tip data-for={`city${unitId}`}>
                {cutText(state.illuminationsGroupedBySite[unitId].CITY_NAME || '-', 20)}
              </span>
              {state.illuminationsGroupedBySite[unitId].CITY_NAME?.length >= 20 && (
                <ReactTooltip
                  id={`city${unitId}`}
                  place="top"
                  effect="solid"
                  delayHide={100}
                  offset={{ top: 0, left: 10 }}
                  textColor="#000000"
                  border
                  backgroundColor="rgba(256, 256, 256, 1)"
                >
                  <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                    <span
                      style={{
                        fontSize: '95%',
                      }}
                    >
                      {state.illuminationsGroupedBySite[unitId].CITY_NAME}
                    </span>
                  </Flex>
                </ReactTooltip>
              )}
            </Flex>
            <Flex flexDirection="column" width="250px" ml="20px">
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
                {t('unidade')}
              </span>
              <div
                style={{
                  width: '410px',
                }}
              >
                <StyledLink
                  data-tip
                  data-for={unitId}
                  to={`/analise/unidades/${unitId}`}
                  style={{
                    marginLeft: '0px',
                    textDecoration: 'underline',
                  }}
                  color="#8b8b8b"
                >
                  {cutText(state.illuminationsGroupedBySite[unitId].UNIT_NAME || '-', 30)}
                </StyledLink>
              </div>
              {state.illuminationsGroupedBySite[unitId].UNIT_NAME?.length >= 30 && (
                <ReactTooltip
                  id={unitId}
                  place="top"
                  effect="solid"
                  delayHide={100}
                  offset={{ top: 0, left: 10 }}
                  textColor="#000000"
                  border
                  backgroundColor="rgba(256, 256, 256, 1)"
                >
                  <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                    <span
                      style={{
                        fontSize: '95%',
                      }}
                    >
                      {state.illuminationsGroupedBySite[unitId].UNIT_NAME}
                    </span>
                  </Flex>
                </ReactTooltip>
              )}
            </Flex>
          </Flex>
          <Flex alignItems="center" mr="10px">
            {!state.illuminationsGroupedBySite[unitId].COLLAPSED && <ArrowDownIconV2 color="#8b8b8b" width="10" heigth="10" />}
            {state.illuminationsGroupedBySite[unitId].COLLAPSED && <ArrowUpIconV2 color="#8b8b8b" width="10" heigth="10" />}
          </Flex>
        </Flex>
      )}
      {!state.illuminationsGroupedBySite[unitId].COLLAPSED && (
        <Flex flexDirection="column" color="#8b8b8b" padding="10px" width={['100%', '100%', '100%', '85%']}>
          <Flex marginBottom="6px">
            <span style={{
              fontWeight: 'bold',
              marginLeft: '30px',
              flex: '1.5',
              fontSize: '12px',
            }}
            >
              {t('circuitoDeIluminacao')}
            </span>
            <span style={{ fontWeight: 'bold', flex: '0.5', fontSize: '12px' }}>
              {t('Dispositivo')}
            </span>
            <span style={{
              fontWeight: 'bold',
              flex: '0.5',
              textAlign: 'center',
              fontSize: '12px',
            }}
            >
              {t('porta')}
            </span>
            <span style={{
              fontWeight: 'bold',
              flex: '0.5',
              textAlign: 'center',
              fontSize: '12px',
            }}
            >
              {t('programacao')}
            </span>
          </Flex>
          {state.illuminationsGroupedBySite[unitId].ILLUMINATIONS.map((illum) => (
            <Flex marginBottom="6px" key={unitId}>
              <Checkbox
                size={20}
                checked={illum.checked}
                onClick={() => { changeCircuitStatus(illum.ILLUMINATION_ID, illum.ILLUM_DEV_ID); }}
              />
              <div
                style={{
                  flex: '1.5',
                }}
              >
                <StyledLink
                  to={`/analise/utilitario/iluminacao/${illum.ILLUMINATION_ID}/informacoes`}
                  style={{
                    marginLeft: '10px',
                    textDecoration: 'underline',
                  }}
                  color="#8b8b8b"
                  data-tip
                  data-for={illum.ILLUMINATION_NAME}
                >
                  {cutText(illum.ILLUMINATION_NAME || '-', 45)}
                </StyledLink>
              </div>
              {illum.ILLUMINATION_NAME?.length >= 45 && (
                <ReactTooltip
                  id={illum.ILLUMINATION_NAME}
                  place="top"
                  effect="solid"
                  delayHide={100}
                  offset={{ top: 0, left: 10 }}
                  textColor="#000000"
                  border
                  backgroundColor="rgba(256, 256, 256, 1)"
                >
                  <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                    <span
                      style={{
                        fontSize: '95%',
                      }}
                    >
                      {illum.ILLUMINATION_NAME}
                    </span>
                  </Flex>
                </ReactTooltip>
              )}
              <div
                style={{
                  flex: '0.5',
                  paddingLeft: '4px',
                  paddingRight: '10px',
                }}
              >
                <StyledLink
                  to={`/analise/dispositivo/${illum.DEVICE_CODE}/informacoes`}
                  style={{
                    textDecoration: 'underline',
                  }}
                  color="#8b8b8b"
                >
                  {illum.DEVICE_CODE || '-' }
                </StyledLink>
              </div>
              <span style={{ flex: '0.5', textAlign: 'center' }}>{illum.PORT || '-' }</span>
              <div style={{ flex: '0.5', display: 'flex', justifyContent: 'center' }}>
                <DALSchedule
                  deviceCode={illum.DEVICE_CODE}
                  illumId={Number(illum.ILLUMINATION_ID)}
                  illumName={illum.NAME}
                  canEdit={false}
                  isModal
                  onlyIcon
                />
              </div>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export const IlluminationMultipleProgList = ({
  state, render, clientId,
}): JSX.Element => {
  const [allCollapsed, setAllCollapsed] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    Object.keys(state.illuminationsGroupedBySite).forEach((unit) => {
      state.illuminationsGroupedBySite[unit].COLLAPSED = allCollapsed;
    });
    render();
  }, [allCollapsed]);
  return (
    <Flex flexDirection="column" alignItems="center" paddingTop="10px" style={{ border: '1px solid #D2D3E2', borderRadius: '5px' }} width="98%">
      {clientId && (
      <Flex width="96%" marginBottom="10px" marginTop="10px">
        <UnderlineBtn onClick={() => setAllCollapsed(!allCollapsed)}>
          {allCollapsed ? t('expandirUnidades') : t('recolherUnidades')}
        </UnderlineBtn>
      </Flex>
      )}
      {
        Object.keys(state.illuminationsGroupedBySite).map((unitId) => (
          <IlluminationMultipleProgItemList unitId={unitId} state={state} key={unitId} render={render} clientId={clientId} />
        ))
      }
    </Flex>
  );
};

const HandleIllumScheds = (props): JSX.Element => {
  const [state, render, setState] = useStateVar({
    illumScheds: [] as ScheduleInfo[],
    showExcepts: false,
    larguraPage: window.innerWidth,
    openModal: null as null | string,
    modalEditSchedule: null as null | {
      schedId: number | undefined
      addEdit: 'Add' | 'Edit'
      title: string
      active: boolean
      start_time: string
      start_time_error: string
      end_time: string
      end_time_error: string
      selectedDays: {
        mon?: boolean
        tue?: boolean
        wed?: boolean
        thu?: boolean
        fri?: boolean
        sat?: boolean
        sun?: boolean
      }
      status: boolean
      index: number
    },
    illumExceptions: [] as ExceptionInfo[],
    modalEditException: null as null | {
      exceptionId: number | undefined
      addEdit: 'Add' | 'Edit'
      title: string
      active: boolean
      start_time: string
      start_time_error: string
      end_time: string
      end_time_error: string
      status: boolean
      exceptionDate: string
      repeatYearly: boolean
      index: number
    },
    loadingSet: false,
    damDevSched: { week: {}, exceptions: {} } as FullProg_v4,
    selectedDam: '' as string,
    isLoading: false as boolean,
    dalSchedsToEdit: { } as {[key: string]: {[key: string]: {schedId: number, delete: boolean, days: string}[]}},
    dalExceptsToDelete: { } as {[key: string]: {[key: string]: number[]}},
    needDamMultipleScheds: false,
    needOverwriteDamSchedule: false,
    illuminationsWithNumberExceptions: [] as { ILLUMINATION_ID: number, DEVICE_CODE: string, numberExceptions: number }[],
  });
  const { t } = useTranslation();
  const history = useHistory();

  document.body.onresize = function () {
    setState({ larguraPage: document.body.clientWidth });
  };
  function editAddProgramming(index: number) {
    if (state.showExcepts) editAddException(index);
    else editAddSched(index);
  }

  function generateDaysObject(days) {
    return {
      mon: days ? days.mon : false,
      tue: days ? days.tue : false,
      wed: days ? days.wed : false,
      thu: days ? days.thu : false,
      fri: days ? days.fri : false,
      sat: days ? days.sat : false,
      sun: days ? days.sun : false,
    };
  }

  function editAddSched(index: number, item?: ScheduleInfo) {
    try {
      const days = item?.DAYS && JSON.parse(item.DAYS);
      state.modalEditSchedule = {
        schedId: item?.ID,
        addEdit: item ? 'Edit' : 'Add',
        title: (item?.TITLE) ?? '',
        active: item ? (item.ACTIVE === '1') : true,
        start_time: item ? item.BEGIN_TIME : '',
        start_time_error: '',
        end_time: item ? item.END_TIME : '',
        end_time_error: '',
        selectedDays: !state.showExcepts ? generateDaysObject(days) : {},
        status: item ? item.STATUS === '1' : true,
        index,
      };
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  async function addNewSched() {
    if (!state.modalEditSchedule) return;
    state.illumScheds?.push({
      ILLUMINATION_ID: null as any,
      TITLE: state.modalEditSchedule.title,
      DAYS: JSON.stringify(state.modalEditSchedule.selectedDays),
      STATUS: state.modalEditSchedule.status ? '1' : '0',
      BEGIN_TIME: state.modalEditSchedule.start_time,
      END_TIME: state.modalEditSchedule.end_time,
      ACTIVE: state.modalEditSchedule.active ? '1' : '0',
    });
    render();
  }

  async function editSched(index) {
    if (!state.modalEditSchedule) return;
    const sched = state.illumScheds?.[index];
    state.illumScheds?.splice(index, 1, {
      ...sched,
      ILLUMINATION_ID: null as any,
      TITLE: state.modalEditSchedule.title,
      DAYS: JSON.stringify(state.modalEditSchedule.selectedDays),
      STATUS: (state.modalEditSchedule?.status ? '1' : '0'),
      BEGIN_TIME: (state.modalEditSchedule?.start_time),
      END_TIME: (state.modalEditSchedule?.end_time),
      ACTIVE: (state.modalEditSchedule?.active ? '1' : '0'),

    });
    render();
  }

  function saveEditNewSched(index) {
    try {
      setState({ loadingSet: true });
      if (!state.modalEditSchedule) {
        setState({ loadingSet: false });
        return;
      }
      if (state.modalEditSchedule.title === '') {
        setState({ loadingSet: false });
        return toast.error(t('erroDigiteNomeProgramacao'));
      }
      if (!state.showExcepts && state.modalEditSchedule.selectedDays && Object.values(state.modalEditSchedule.selectedDays).every((item) => item === false)) {
        setState({ loadingSet: false });
        return toast.error(t('erroSelecionePeloMenosUmDia'));
      }

      if (!validateStringTimeInterval({
        startTime: state.modalEditSchedule.start_time,
        endTime: state.modalEditSchedule.end_time,
      }, t)) {
        setState({ loadingSet: false });
        return;
      }

      if (state.modalEditSchedule.addEdit === 'Add') {
        addNewSched();
      } else if (state.modalEditSchedule.addEdit === 'Edit') {
        editSched(index);
      }
      state.modalEditSchedule = null;
      setState({ loadingSet: false });
      render();
      toast.success(t('sucessoAdicionarProgramacao'));
    } catch (err) {
      const error = err as AxiosError;
      toast.error(error?.response?.data);
      setState({ loadingSet: false });
    }
  }

  function editAddException(index: number, item?: ExceptionInfo) {
    try {
      state.modalEditException = {
        exceptionId: item?.ID,
        addEdit: item ? 'Edit' : 'Add',
        title: (item?.TITLE) ?? '',
        start_time: item ? item.BEGIN_TIME : '',
        start_time_error: '',
        end_time: item ? item.END_TIME : '',
        end_time_error: '',
        status: item ? item.STATUS === '1' : true,
        active: item ? !!(item && item.ACTIVE === '1') : true,
        exceptionDate: (item && item.EXCEPTION_DATE) || '',
        repeatYearly: !!(item && item.REPEAT_YEARLY === '1'),
        index,
      };
      render();
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  function deleteSchedule(sched: ScheduleInfo, index: number) {
    state.illumScheds?.splice(index, 1);
    render();
    toast.success(t('sucessoRemoverProgramacao'));
  }

  async function deleteException(sched: ExceptionInfo, index: number) {
    state.illumExceptions?.splice(index, 1);
    render();
  }

  function addNewException() {
    if (!state.modalEditException) return;
    state.illumExceptions?.push({
      ILLUMINATION_ID: null as any,
      TITLE: state.modalEditException.title,
      ACTIVE: state.modalEditException.active ? '1' : '0',
      BEGIN_TIME: state.modalEditException.start_time,
      END_TIME: state.modalEditException.end_time,
      EXCEPTION_DATE: state.modalEditException.exceptionDate,
      REPEAT_YEARLY: state.modalEditException.repeatYearly ? '1' : '0',
      STATUS: state.modalEditException.status ? '1' : '0',
    });
  }

  async function editException(index) {
    if (!state.modalEditException) return;
    const exception = state.illumExceptions?.[index];
    state.illumExceptions?.splice(index, 1, {
      ...exception,
      ILLUMINATION_ID: null as any,
      TITLE: state.modalEditException.title,
      ACTIVE: state.modalEditException.active ? '1' : '0',
      BEGIN_TIME: state.modalEditException?.start_time,
      END_TIME: state.modalEditException?.end_time,
      EXCEPTION_DATE: state.modalEditException.exceptionDate,
      REPEAT_YEARLY: state.modalEditException.repeatYearly ? '1' : '0',
      STATUS: state.modalEditException.status ? '1' : '0',
    });
  }

  function saveEditNewException(index) {
    try {
      if (!state.modalEditException) return;
      if (state.modalEditException.title === '') return toast.error(t('erroDigiteNomeProgramacao'));

      if ((state.modalEditException.exceptionDate.length !== 10 || state.modalEditException.exceptionDate.includes('_'))) {
        return toast.error(t('erroDataExcecaoObrigatoria'));
      }

      if (!validateStringTimeInterval({
        startTime: state.modalEditException.start_time,
        endTime: state.modalEditException.end_time,
      }, t)) {
        return;
      }

      if (state.modalEditException.addEdit === 'Add') {
        addNewException();
      } else if (state.modalEditException.addEdit === 'Edit') {
        editException(index);
      }
      state.modalEditException = null;
      render();
      toast.success(t('sucessoAdicionarProgramacao'));
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  const clearAllAdded = () => {
    if (state.showExcepts) {
      state.illumExceptions = [];
    } else {
      state.illumScheds = [];
    }
    state.openModal = null;
    render();
  };

  interface DaySched {
    BEGIN_TIME: string;
    END_TIME: string;
    DAYS: string;
    ID?: number;
  }

  const getNewSchedDays = (convergence: DaySched,
    newSched: DaySched) => {
    let newDays;
    if (newSched?.ID) {
      newDays = JSON.parse(newSched.DAYS);
      const convergenceDays = JSON.parse(convergence.DAYS);
      for (const day of Object.keys(convergenceDays)) {
        if (convergenceDays[day]) newDays[day] = false;
      }
    } else if (convergence?.ID) {
      newDays = JSON.parse(convergence.DAYS);
      const convergenceDays = JSON.parse(newSched.DAYS);
      for (const day of Object.keys(convergenceDays)) {
        if (convergenceDays[day]) newDays[day] = false;
      }
    }

    return newDays;
  };

  function checkConvergence(
    currentScheds: DaySched[],
    newSched: DaySched,
  ) {
    const convergence = currentScheds.find((x) => (
      compareTimes(newSched, x)
    ));

    if (convergence) {
      const newDays = getNewSchedDays(convergence, newSched);
      let deleteSched = true;
      if (newDays !== undefined) {
        for (const day of Object.keys(newDays)) {
          if (newDays[day]) deleteSched = false;
        }
      }

      return {
        foundConvergence: true, schedId: newSched?.ID ?? convergence?.ID, days: JSON.stringify(newDays), deleteSched,
      };
    }
    return {
      foundConvergence: false, schedId: undefined, days: undefined, deleteSched: false,
    };
  }

  const getDalScheds = (persisted?: ScheduleInfo[]) => {
    let scheds = state.illumScheds;
    if (persisted) {
      scheds = scheds.concat(persisted);
    }
    return scheds;
  };

  const checkDalSchedsCardsConflicts = (persisted?: ScheduleInfo[]) => {
    const daysProgs = {
      sun: [],
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
    } as {[day: string]:DaySched[]};
    const ans = {
      hasConflict: false,
      schedsIdToEdit: [] as {schedId: number, delete: boolean, days: string}[],
    };
    const scheds = getDalScheds(persisted);
    for (const sched of scheds) {
      const days = JSON.parse(sched.DAYS) || {};
      for (const [day, selected] of Object.entries(days)) {
        if (!selected) continue;
        const dayScheds = daysProgs[day];
        const checkConvAns = checkConvergence(dayScheds, sched);
        if (checkConvAns.foundConvergence) {
          ans.hasConflict = true;
          if (checkConvAns.schedId && !ans.schedsIdToEdit.find((s) => s.schedId === checkConvAns.schedId)) {
            ans.schedsIdToEdit.push({
              schedId: checkConvAns.schedId, delete: checkConvAns.deleteSched, days: checkConvAns.days,
            });
          }
        }
        dayScheds.unshift(sched);
      }
    }
    return ans;
  };

  interface DayExcept {
    BEGIN_TIME: string;
    END_TIME: string;
    ID?: number;
  }

  const compareTimes = (time_1: DayExcept, time_2: DayExcept) => ((time_1.BEGIN_TIME <= time_2.BEGIN_TIME && time_2.BEGIN_TIME <= time_1.END_TIME)
  || (time_2.BEGIN_TIME <= time_1.BEGIN_TIME && time_1.BEGIN_TIME <= time_2.END_TIME)
  || (time_1.BEGIN_TIME <= time_2.BEGIN_TIME && time_2.END_TIME <= time_1.END_TIME)
  || (time_2.BEGIN_TIME <= time_1.BEGIN_TIME && time_1.END_TIME <= time_2.END_TIME));

  const hasHoursConflicts = (excepts: DayExcept[]) => {
    const ans = {
      foundConvergence: false,
      exceptsIds: [] as number[],
    };
    for (let i = 0; i < excepts.length; i++) {
      for (let j = i + 1; j < excepts.length; j++) {
        if (compareTimes(excepts[i], excepts[j])) {
          ans.foundConvergence = true;
          if (excepts[i]?.ID) {
            ans.exceptsIds.push(excepts[i].ID as number);
          }
          if (excepts[j]?.ID) {
            ans.exceptsIds.push(excepts[j].ID as number);
          }
        }
      }
    }
    return ans;
  };

  const handleDayExceptsInsertion = (dayExcepts: {[date: string]: {[year: string]: DayExcept[]}}, dateDM: string, except: ExceptionInfo) => {
    if (except.REPEAT_YEARLY === '1') {
      if (!dayExcepts[dateDM]?.YEARLY) {
        dayExcepts[dateDM].YEARLY = [{ BEGIN_TIME: except.BEGIN_TIME, END_TIME: except.END_TIME, ID: except.ID }];
      } else {
        dayExcepts[dateDM].YEARLY.push({ BEGIN_TIME: except.BEGIN_TIME, END_TIME: except.END_TIME, ID: except.ID });
      }
    } else {
      const dateY = except.EXCEPTION_DATE.slice(6, 10);
      if (!dayExcepts[dateDM]?.[dateY]) {
        dayExcepts[dateDM][dateY] = [{ BEGIN_TIME: except.BEGIN_TIME, END_TIME: except.END_TIME, ID: except.ID }];
      } else {
        dayExcepts[dateDM][dateY].push({ BEGIN_TIME: except.BEGIN_TIME, END_TIME: except.END_TIME, ID: except.ID });
      }
    }
  };

  const getDayExcepts = (persisted?: ExceptionInfo[]) => {
    let excepts = state.illumExceptions;
    if (persisted) {
      excepts = excepts.concat(persisted);
    }

    const dayExcepts = {} as {[date: string]: {[year: string]: DayExcept[]}};
    for (const except of excepts) {
      if (except.ACTIVE === '0') continue;
      const dateDM = except.EXCEPTION_DATE.slice(0, 5);
      if (!dayExcepts[dateDM]) dayExcepts[dateDM] = {};

      handleDayExceptsInsertion(dayExcepts, dateDM, except);
    }

    return dayExcepts;
  };

  const checkNotYearlyExcept = (dayExcepts: {[date: string]: {[year: string]: DayExcept[]}}, date: string, yearlyExcepts: DayExcept[], ans: { hasConflict: boolean, exceptsIdToDelete: number[] }) => {
    for (const year of Object.keys(dayExcepts[date])) {
      if (year === 'YEARLY') continue;
      const excepts = dayExcepts[date][year].concat(yearlyExcepts);
      const checkExceptsConvergence = hasHoursConflicts(excepts);
      if (checkExceptsConvergence.foundConvergence) {
        ans.hasConflict = true;
        if (checkExceptsConvergence.exceptsIds.length) {
          ans.exceptsIdToDelete = ans.exceptsIdToDelete.concat(checkExceptsConvergence.exceptsIds);
        }
      }
    }
  };

  const checkDalCardsExceptsConflicts = (persisted?: ExceptionInfo[]) => {
    const ans = {
      hasConflict: false,
      exceptsIdToDelete: [] as number[],
    };

    const dayExcepts = getDayExcepts(persisted);

    for (const date of Object.keys(dayExcepts)) {
      const yearlyExcepts = dayExcepts[date]?.YEARLY || [];
      const checkExceptsConvergence = hasHoursConflicts(yearlyExcepts);
      if (checkExceptsConvergence.foundConvergence) {
        ans.hasConflict = true;
        if (checkExceptsConvergence.exceptsIds.length) {
          ans.exceptsIdToDelete = ans.exceptsIdToDelete.concat(checkExceptsConvergence.exceptsIds);
        }
      }
      checkNotYearlyExcept(dayExcepts, date, yearlyExcepts, ans);
    }
    ans.exceptsIdToDelete = ans.exceptsIdToDelete.filter((e) => e !== undefined);
    return ans;
  };

  function checkDalCardsExceptsLimits(dalCode: string, illumination_id, exceptions) {
    const existingIndex = state.illuminationsWithNumberExceptions.findIndex((item) => item.ILLUMINATION_ID === illumination_id && item.DEVICE_CODE === dalCode);
    if (exceptions?.length + state.illumExceptions.length > 8) {
      if (existingIndex !== -1) {
        state.illuminationsWithNumberExceptions[existingIndex] = {
          ILLUMINATION_ID: illumination_id,
          DEVICE_CODE: dalCode,
          numberExceptions: exceptions?.length + state.illumExceptions.length,
        };
      } else {
        state.illuminationsWithNumberExceptions.push({
          ILLUMINATION_ID: illumination_id,
          DEVICE_CODE: dalCode,
          numberExceptions: exceptions?.length + state.illumExceptions.length,
        });
      }
    } else if (existingIndex !== -1) {
      state.illuminationsWithNumberExceptions.splice(existingIndex, 1);
    }
    render();
  }

  const checkNeedMultipleCards = () => {
    const scheds = state.illumScheds;
    const daysWithProg = {
      sun: false,
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
    };
    for (const sched of scheds) {
      const days = JSON.parse(sched.DAYS);
      for (const day of Object.keys(days)) {
        if (days[day]) {
          if (daysWithProg[day]) return true;
          daysWithProg[day] = true;
        }
      }
    }

    const excepts = state.illumExceptions;
    const daysWithExcepts = {};
    for (const except of excepts) {
      if (daysWithExcepts[except.EXCEPTION_DATE]) return true;
      daysWithExcepts[except.EXCEPTION_DATE] = true;
    }

    return false;
  };

  const checkDamSchedConvergence = (scheds: ScheduleInfo[]) => {
    const daysWithProg = {
      sun: false,
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
    };

    for (const sched of scheds) {
      const days = JSON.parse(sched.DAYS);
      for (const day of Object.keys(days)) {
        if (days[day]) {
          daysWithProg[day] = true;
        }
      }
    }

    const newScheds = state.illumScheds;
    for (const sched of newScheds) {
      const days = JSON.parse(sched.DAYS);
      for (const day of Object.keys(days)) {
        if (days[day] && daysWithProg[day]) return true;
        if (days[day]) {
          daysWithProg[day] = true;
        }
      }
    }

    return false;
  };

  const checkDamExceptConvergence = (excepts: ExceptionInfo[]) => {
    const daysWithExcepts = {};

    for (const except of excepts) {
      if (!daysWithExcepts[except.EXCEPTION_DATE]) daysWithExcepts[except.EXCEPTION_DATE] = true;
    }

    const newExcepts = state.illumExceptions;
    for (const except of newExcepts) {
      if (daysWithExcepts[except.EXCEPTION_DATE]) return true;
    }

    return false;
  };

  const checkDamConvergence = ({ scheds, excepts }: {scheds: ScheduleInfo[], excepts: ExceptionInfo[]}) => {
    if (checkDamSchedConvergence(scheds)) return true;

    if (checkDamExceptConvergence(excepts)) return true;

    return false;
  };

  const validateDalScheds = async (illum: ApiResps['/dal-dam/get-illumination-list'][number]) => {
    try {
      const { scheds, exceptions } = await apiCall('/dal/get-dal-scheds', { DAL_CODE: illum.DEVICE_CODE, ILLUMINATION_ID: illum.ILLUMINATION_ID });

      const dalSchedValidation = checkDalSchedsCardsConflicts(scheds);

      if (dalSchedValidation.hasConflict) {
        if (dalSchedValidation.schedsIdToEdit.length) {
          if (!state.dalSchedsToEdit[illum.DEVICE_CODE]) state.dalSchedsToEdit[illum.DEVICE_CODE] = {};
          state.dalSchedsToEdit[illum.DEVICE_CODE][illum.ILLUMINATION_ID] = dalSchedValidation.schedsIdToEdit;
        }
        render();
      }

      const dalExceptsValidation = checkDalCardsExceptsConflicts(exceptions);
      if (dalExceptsValidation.hasConflict) {
        if (dalExceptsValidation.exceptsIdToDelete.length) {
          if (!state.dalExceptsToDelete[illum.DEVICE_CODE]) state.dalExceptsToDelete[illum.DEVICE_CODE] = {};
          state.dalExceptsToDelete[illum.DEVICE_CODE][illum.ILLUMINATION_ID] = [...new Set(dalExceptsValidation.exceptsIdToDelete)];
          render();
        }
      }

      checkDalCardsExceptsLimits(illum.DEVICE_CODE, illum.ILLUMINATION_ID, exceptions);
    } catch (err) {
      console.log(err);
    }
  };

  const validateDevsScheds = async (selectedDevList: ApiResps['/dal-dam/get-illumination-list']) => {
    let needDamMultipleScheds = false;
    let needOverwriteDamSchedule = false;
    for (const illum of selectedDevList) {
      if (illum.DEVICE_CODE.startsWith('DAL')) {
        await validateDalScheds(illum);
      } else if (illum.DEVICE_CODE.startsWith('DAM')) {
        if (checkNeedMultipleCards() || needDamMultipleScheds) {
          needDamMultipleScheds = true;
          continue;
        } else if (!needOverwriteDamSchedule) {
          const sched = await apiCall('/dam/get-sched', { damId: illum.DEVICE_CODE });
          const persistedSched = parseDamProgToDalProg(sched.desired);

          if (checkDamConvergence(persistedSched)) {
            needOverwriteDamSchedule = true;
          }
        }
      }
    }

    return { needDamMultipleScheds, needOverwriteDamSchedule };
  };

  const validateScheds = async () => {
    setState({
      isLoading: true,
      dalExceptsToDelete: {},
      dalSchedsToEdit: {},
      needDamMultipleScheds: false,
      needOverwriteDamSchedule: false,
    });
    render();

    if (checkDalSchedsCardsConflicts().hasConflict) {
      toast.error(t('conflitoDalSched'));
      setState({
        isLoading: false, needOverwriteDamSchedule: false, needDamMultipleScheds: false,
      });
      return false;
    }

    if (checkDalCardsExceptsConflicts().hasConflict) {
      toast.error(t('conflitoDalExcept'));
      setState({
        isLoading: false, needOverwriteDamSchedule: false, needDamMultipleScheds: false,
      });
      return false;
    }

    const selectedDevList = props.state.illuminations.filter((dev) => dev.checked);

    if (selectedDevList.length === 0) {
      toast.warn(t('semDispositivoSelecionad'));
      setState({
        isLoading: false, needOverwriteDamSchedule: false, needDamMultipleScheds: false,
      });
      return false;
    }
    const { needDamMultipleScheds, needOverwriteDamSchedule } = await validateDevsScheds(selectedDevList);

    setState({
      isLoading: false, needOverwriteDamSchedule, needDamMultipleScheds,
    });
    render();
    return true;
  };

  const formatStringToDate = (str: string) => (`${str.substring(6, 10)}-${str.substring(3, 5)}-${str.substring(0, 2)}`);

  const handleNewDalSaving = async (devCode: string, illumId: number, illum: ApiResps['/dal-dam/get-illumination-list'][number], devsErrors: { DEVICE_CODE: string, ILLUMINATION_ID: number, Motivo: string }[]) => {
    const scheds: {
      DAL_CODE: string;
      ILLUMINATION_ID: number;
      SCHED_ID?: number;
      TITLE?: string;
      ACTIVE?: string;
      BEGIN_TIME?: string;
      END_TIME?: string;
      DAYS?: string;
      STATUS?: string;
      INSERT?: boolean;
      EDIT?: boolean;
      DELETE?: boolean
    }[] = [];
    if (state.dalSchedsToEdit[devCode]?.[illumId]?.length) {
      for (const sched of state.dalSchedsToEdit[devCode][illumId]) {
        if (sched.delete) {
          scheds.push({
            SCHED_ID: sched.schedId,
            DAL_CODE: devCode,
            ILLUMINATION_ID: illumId,
            DELETE: true,
          });
        } else {
          scheds.push({
            SCHED_ID: sched.schedId,
            DAL_CODE: devCode,
            ILLUMINATION_ID: illumId,
            DAYS: sched.days || undefined,
            EDIT: true,
          });
        }
      }
    }

    for (const sched of state.illumScheds) {
      scheds.push({
        DAL_CODE: devCode,
        ILLUMINATION_ID: illum.ILLUMINATION_ID,
        TITLE: sched.TITLE,
        ACTIVE: sched.ACTIVE,
        BEGIN_TIME: sched.BEGIN_TIME,
        END_TIME: sched.END_TIME,
        DAYS: sched.DAYS,
        STATUS: sched.STATUS,
        INSERT: true,
      });
    }

    const excepts : {
      EXCEPTION_ID?: number;
      DAL_CODE: string;
      ILLUMINATION_ID: number;
      TITLE?: string;
      ACTIVE?: string;
      BEGIN_TIME?: string;
      END_TIME?: string;
      EXCEPTION_DATE?: string;
      REPEAT_YEARLY?: string;
      STATUS?: string;
      INSERT?: boolean;
      DELETE?: boolean
    }[] = [];

    if (state.dalExceptsToDelete[devCode]?.[illumId]?.length) {
      for (const id of state.dalExceptsToDelete[devCode][illumId]) {
        excepts.push({
          EXCEPTION_ID: id,
          DAL_CODE: devCode,
          ILLUMINATION_ID: illum.ILLUMINATION_ID,
          DELETE: true,
        });
      }
    }

    for (const except of state.illumExceptions) {
      excepts.push({
        DAL_CODE: devCode,
        ILLUMINATION_ID: illum.ILLUMINATION_ID,
        TITLE: except.TITLE,
        ACTIVE: except.ACTIVE,
        BEGIN_TIME: except.BEGIN_TIME,
        END_TIME: except.END_TIME,
        STATUS: except.STATUS,
        EXCEPTION_DATE: formatStringToDate(except.EXCEPTION_DATE),
        REPEAT_YEARLY: except.REPEAT_YEARLY,
        INSERT: true,
      });
    }
    try {
      await apiCall('/dal/handle-multiple-illumination-sched', {
        ILLUMINATION_ID: illum.ILLUMINATION_ID, DAL_CODE: illum.DEVICE_CODE, SCHEDS: scheds, EXCEPTIONS: excepts,
      });
    } catch (err) {
      devsErrors.push({ DEVICE_CODE: illum.DEVICE_CODE, ILLUMINATION_ID: illumId, Motivo: t('erroApagarExcept') });
    }
  };

  const handleDamWithoutMultipleScheds = async (devCode: string) => {
    let desired;
    try {
      const sched = await apiCall('/dam/get-sched', { damId: devCode });
      desired = sched.desired;
    } catch (err) {
      console.log(err);
      return;
    }

    for (const sched of state.illumScheds) {
      const days = JSON.parse(sched.DAYS);
      for (const day of Object.keys(days)) {
        if (!days[day]) continue;
        desired.week[day] = {
          permission: sched.STATUS === '1' ? 'allow' : 'forbid',
          start: sched.BEGIN_TIME,
          end: sched.END_TIME,
        };
      }
    }
    if (!desired.exceptions) {
      desired.exceptions = {};
    }
    for (const except of state.illumExceptions) {
      desired.exceptions[formatStringToDate(except.EXCEPTION_DATE)] = {
        permission: except.STATUS === '1' ? 'allow' : 'forbid',
        start: except.BEGIN_TIME,
        end: except.END_TIME,
      };
    }
    try {
      await apiCall('/dam/set-programming-v3', { damId: devCode, week: desired.week, exceptions: desired.exceptions });
    } catch (err) {
      console.log(err);
    }
    return true;
  };

  function checkIlluminationExceptions(DEVICE_CODE: string, ILLUMINATION_NAME: string, ILLUMINATION_ID: number, devsErrors) {
    const exceptionsInfo = state.illuminationsWithNumberExceptions.find((x) => x.DEVICE_CODE === DEVICE_CODE && x.ILLUMINATION_ID === ILLUMINATION_ID);
    if (exceptionsInfo) {
      devsErrors.push({ DEVICE_CODE, ILLUMINATION_ID, Motivo: t('dispositivoExcedeuLimiteExcecao', { devId: DEVICE_CODE, illuminationName: ILLUMINATION_NAME }) });
      toast.error(t('dispositivoExcedeuLimiteExcecao', { devId: DEVICE_CODE, illuminationName: ILLUMINATION_NAME }));
    }
  }

  async function handleDalSchedules(
    devCode: string,
    illum: ApiResps['/dal-dam/get-illumination-list'][number] & { checked: boolean},
    illumId: number,
    devsErrors: { DEVICE_CODE: string, ILLUMINATION_ID: number, Motivo: string }[],
  ) {
    if (devCode.startsWith('DAL')) {
      await handleNewDalSaving(devCode, illumId, illum, devsErrors);
    } else if (devCode.startsWith('DAM') && !state.needDamMultipleScheds) {
      await handleDamWithoutMultipleScheds(devCode);
    } else if (devCode.startsWith('DAM') && state.needDamMultipleScheds) {
      illum.checked = false;
    }
  }

  function redirectAfterSuccess() {
    if (props.clientId) {
      history.push(`/painel/programacao-multipla/devs?idcliente=${props.clientId}&type=iluminacao`);
    }
    if (props.unitId) {
      history.push(`/analise/unidades/perfil/${props.unitId}/editar-unidade?aba=programacao-multipla`);
    }
    document.location.reload();
  }

  const sendIllumSched = async () => {
    setState({ isLoading: true });
    const devsErrors = [] as { DEVICE_CODE: string, ILLUMINATION_ID: number, Motivo: string }[];

    const selectedDevList = props.state.illuminations.filter((dev) => dev.checked);

    try {
      setState({ isLoading: true });

      await Promise.all(selectedDevList.map(async (illum) => {
        const devCode = illum.DEVICE_CODE;
        const illumId = illum.ILLUMINATION_ID;

        await checkDevOnline(illum.DEVICE_CODE, illum.ILLUMINATION_ID, devsErrors);

        checkIlluminationExceptions(illum.DEVICE_CODE, illum.ILLUMINATION_NAME, illum.ILLUMINATION_ID, devsErrors);

        if (devsErrors.find((erro) => erro.DEVICE_CODE === devCode && erro.ILLUMINATION_ID === illumId)) {
          setState({ isLoading: false, openModal: null });
          return;
        }

        await handleDalSchedules(devCode, illum, illumId, devsErrors);
      }));
      if (devsErrors.length > 0) {
        throw new Error();
      } else {
        setState({
          isLoading: false, openModal: null, illumExceptions: [], illumScheds: [],
        });
        toast.success(t('progEnviadaSucesso'));
        redirectAfterSuccess();
        render();
      }
    }
    catch (err) {
      console.log(err);
      let message = t('erroProgDispositivos');
      devsErrors.forEach(({ DEVICE_CODE, Motivo }) => {
        if (!message.includes(DEVICE_CODE)) {
          console.log(`${DEVICE_CODE}:${Motivo}`);
          message += `\n${DEVICE_CODE}`;
          return DEVICE_CODE;
        }
      });

      const pendingIllumns = devsErrors.map(({ ILLUMINATION_ID }) => (ILLUMINATION_ID));

      const refreshIlumnsList = props.state.illuminations.map((illum) => {
        if (!pendingIllumns.includes(illum.ILLUMINATION_ID)) {
          illum.checked = false;
        }
        return illum;
      });

      props.state.illuminations = refreshIlumnsList;
      props.render();
      setState({ isLoading: false, openModal: null });
      toast.error(message, { closeOnClick: false, draggable: false, duration: 10000 });
      return;
    }
    render();
  };

  const handleSaveSched = async () => {
    try {
      const valid = await validateScheds();
      render();
      if (valid) {
        state.openModal = 'saving-confirmation';
        render();
      }
    } catch (err) {
      console.log(err);
      setState({ isLoading: false });
    }
  };
  const basedOnExcept = (trueOpt, falseOpt) => (state.showExcepts ? trueOpt : falseOpt);

  if (state.isLoading) return <LoaderWithText text={t('validandoCards')} />;

  return (
    <Flex width="98%" flexDirection="column" mt="40px">
      <Flex flexDirection="column" width="100%">
        <span style={{ fontWeight: 'bold', fontSize: '20px' }}>{t('gerenciarProgramacoes')}</span>
        <Flex justifyContent="space-between">
          <Box width="500px" color="#8b8b8b">
            {t('acoesCircuitos')}
          </Box>
          <Flex flexDirection="row">
            <Button style={{ width: '260px', fontSize: '10px' }} onClick={() => { editAddProgramming(0); }} variant="primary">
              {state.showExcepts ? t('adicionarExcept') : t('adicionarSched')}
            </Button>
            <Button style={{ width: '260px', marginLeft: '10px' }} onClick={() => { state.openModal = 'clear-all-added'; render(); }} variant="red-inv-border">
              <Flex alignItems="center" justifyContent="center">
                <SmallTrashIcon color="#DC0E01" />
                <span style={{ marginLeft: '10px', fontSize: '10px' }}>{state.showExcepts ? t('limparExceptsAdicionadas') : t('limparSchedAdicionadas')}</span>
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '150px 6px 150px auto',
          height: '5px',
          marginTop: '24px',
        }}
      >
        <span
          style={{
            borderTop: '1px solid #D2D3E2',
            borderRight: '1px solid #D2D3E2',
            borderLeft: '1px solid #D2D3E2',
            borderRadius: '6px 6px 0 0',
            backgroundColor: basedOnExcept('#F0F0F0', 'transparent'),
          }}
        />
        <span />
        <span
          style={{
            border: '1px solid #D2D3E2',
            borderBottom: 'none',
            borderRadius: '6px 6px 0 0',
            backgroundColor: basedOnExcept('transparent', '#F0F0F0'),
          }}
        />
        <span />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '150px 6px 150px auto' }}>
        <span
          style={{
            borderRight: '1px solid #D2D3E2',
            borderLeft: '1px solid #D2D3E2',
            textAlign: 'center',
            fontSize: '90%',
            borderBottom: basedOnExcept('1px solid #D2D3E2', 'none'),
            backgroundColor: basedOnExcept('#F0F0F0', 'transparent'),
            cursor: basedOnExcept('pointer', undefined),
            fontWeight: basedOnExcept('normal', 'bold'),
            padding: '4px 1px',
          }}
          onClick={() => {
            setState({ showExcepts: !state.showExcepts });
          }}
        >
          {t('programacoes')}
        </span>
        <span
          style={{
            borderBottom: '1px solid #D2D3E2',
          }}
        />
        <span
          style={{
            borderLeft: '1px solid #D2D3E2',
            borderRight: '1px solid #D2D3E2',
            textAlign: 'center',
            fontSize: '90%',
            borderBottom: basedOnExcept('none', '1px solid #D2D3E2'),
            backgroundColor: basedOnExcept('transparent', '#F0F0F0'),
            cursor: basedOnExcept(undefined, 'pointer'),
            fontWeight: basedOnExcept('bold', 'normal'),
            padding: '4px 1px',
          }}
          onClick={() => {
            setState({ showExcepts: !state.showExcepts });
          }}
        >
          {t('excecoes')}
        </span>
        <span
          style={{
            borderBottom: '1px solid #D2D3E2',
          }}
        />
      </div>
      <div style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        border: '1px solid #D2D3E2',
        borderTop: 'none',
        minHeight: (state.showExcepts && state.illumExceptions?.length) || (!state.showExcepts && state.illumScheds?.length) ? 0 : 500,
      }}
      >
        {!state.showExcepts && state.illumScheds?.map((sched, index) => (
          <div key={sched.ID} style={{ width: '48%' }}>
            <SchedCard canEdit sched={sched} onEdit={() => editAddSched(index, sched)} onDelete={() => deleteSchedule(sched, index)} larguraPage={state.larguraPage} />
          </div>
        ))}
        {state.showExcepts && state.illumExceptions?.length && state.illumExceptions?.length > 0 ? (
          <>
            <Flex
              flexDirection="row"
              style={{
                marginLeft: '10px',
                wordBreak: 'normal',
                width: '100%',
                marginRight: '10%',
                gap: '5px',
              }}
              justifyContent="space-between"
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  width: '167px',
                }}
              >
                {t('titulo')}
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '13px',
                  width: '76px',
                }}
              >
                {t('Data')}
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '13px',
                  width: '75px',
                }}
              >
                {t('repetirTodoAno')}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  width: '65px',
                }}
              >
                {t('inicio')}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  width: '70px',
                }}
              >
                {t('fim')}
              </div>
            </Flex>
            {state.illumExceptions?.map((exception, index) => (
              <Flex
                key={exception.ID}
                width="100%"
                style={{
                  marginTop: '5px',
                }}
                flexDirection="column"
              >
                <ExceptionSchedCard sched={exception} canEdit onEdit={() => editAddException(index, exception)} onDelete={() => deleteException(exception, index)} />
              </Flex>
            ))}
          </>
        ) : null}
      </div>
      <Flex marginTop="10px" alignItems="center" justifyContent="flex-start">
        <Button
          style={{ width: '90px', padding: '8px 15px' }}
          variant={state.isLoading ? 'disabled' : 'primary'}
          onClick={handleSaveSched}
        >
          {t('SALVAR').toUpperCase()}
        </Button>
      </Flex>
      {(state.openModal != null) && (
        <ModalWindow style={{ padding: '0', overflowX: 'hidden', width: state.openModal === 'saving-confirmation' ? '550px' : '455px' }} borderTop onClickOutside={() => setState({ openModal: null })}>
          {state.openModal === 'clear-all-added'
          && (
            <Flex flexDirection="column" justifyContent="center" alignItems="center" padding="80px">
              <Box width="100%">
                <Flex>
                  <SmallTrashIcon color="#DC0E01" />
                  <h4 style={{ fontWeight: 'bold', marginLeft: '10px' }}>{state.showExcepts ? t('botaoLimparExcecao') : t('botaoLimparProgramacao') }</h4>
                </Flex>
                <p style={{ color: '#8b8b8b', hyphens: 'auto' }}>
                  {t('confirmacaoLimparTudoPt1')}
                  &nbsp;
                  {state.showExcepts ? t('excecoes').toLowerCase() : t('programacoes').toLowerCase()}
                  &nbsp;
                  {t('confirmacaoLimparTudoPt2')}
                  &nbsp;
                  <span style={{ fontWeight: 'bold' }}>{t('confirmacaoLimparTudoPt3')}</span>
                  &nbsp;
                  {t('confirmacaoLimparTudoPt4')}
                </p>
                <Flex marginTop="40px" alignItems="center" justifyContent="space-between">
                  <Button
                    style={{ width: '200px' }}
                    variant="secondary"
                    onClick={clearAllAdded}
                  >
                    {t('limpar').toUpperCase()}
                  </Button>
                  <UnderlineBtn onClick={() => setState({ openModal: null })}>
                    {t('cancelar')}
                  </UnderlineBtn>
                </Flex>
              </Box>
            </Flex>
          )}
          {state.openModal === 'saving-confirmation'
          && (
            <Flex flexDirection="column" justifyContent="center" alignItems="center" padding="40px">
              <Box width="100%">
                <Flex>
                  <SmallWarningIcon />
                  <h4 style={{ fontWeight: 'bold', marginLeft: '10px' }}>{t('desejaSalvar')}</h4>
                </Flex>
                <ul style={{ color: '#8b8b8b', hyphens: 'auto' }}>
                  {state.needOverwriteDamSchedule && <li>{t('alertaConflitoProgDams')}</li>}
                  {state.needDamMultipleScheds && <li>{t('alertaPrecisaMultiplosCards')}</li>}
                  {Object.keys(state.dalSchedsToEdit).length !== 0 && <li>{t('alertaSubstituicaoSchedDal')}</li>}
                  {Object.keys(state.dalExceptsToDelete).length !== 0 && <li>{t('alertaSubstituicaoExceptDal')}</li>}
                </ul>
                <Flex marginTop="40px" alignItems="center" justifyContent="space-between">
                  <Button
                    style={{ width: '200px' }}
                    variant="primary"
                    onClick={sendIllumSched}
                  >
                    {t('prosseguir')}
                  </Button>
                  <UnderlineBtn onClick={() => setState({ openModal: null })}>
                    {t('cancelar')}
                  </UnderlineBtn>
                </Flex>
              </Box>
            </Flex>
          )}
        </ModalWindow>
      )}
      {state.openModal === 'dam-schedule' && (
        <SchedulesList
          hideId
          damId={state.selectedDam}
          devSched={state.damDevSched}
          isLoading={state.isLoading}
          readOnly
          wantDelException={null}
          wantSaveVent={null}
          wantAddProg={null}
          wantEditDay={null}
          wantRemoveDay={null}
        />
      )}
      {(state.modalEditSchedule) && (
      <div style={{ zIndex: 3 }}>
        <ModalWindow style={{ padding: '18px', width: '400px' }} borderTop onClickOutside={() => { setState({ modalEditSchedule: null }); }}>
          <DalSchedForm
            modalEditSchedule={state.modalEditSchedule}
            isException={false}
            loadingSet={state.loadingSet}
            onConfirm={saveEditNewSched}
            onCancel={() => { setState({ modalEditSchedule: null }); }}
            larguraPage={state.larguraPage}
          />
        </ModalWindow>
      </div>
      )}
      {(state.modalEditException) && (
      <div style={{ zIndex: 3 }}>
        <ModalWindow style={{ padding: '16px', width: '400px' }} borderTop onClickOutside={() => { setState({ modalEditException: null }); }}>
          <DalExceptionForm
            modalEditException={state.modalEditException}
            isException
            onConfirm={saveEditNewException}
            onCancel={() => { setState({ modalEditSchedule: null }); }}
          />
        </ModalWindow>
      </div>
      )}
    </Flex>
  );
};

export const IlluminationMultipleProg = ({ clientId, unitId }: IlluminationMultipleProgProperties): JSX.Element => {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    searchState: [] as { text: string }[],
    selectedsUnits: [] as string[],
    selectedsCities: [] as string[],
    selectedsStates: [] as string[],
    selectedProgs: null as string | null,
    openModal: null as string | null,
    clearAllExcepts: false,
    clearAllScheds: false,
    isLoading: false,
    isFetching: false,
    illuminations: [] as ApiResps['/dal-dam/get-illumination-list'],
    illuminationsGroupedBySite: {} as {[key: string]: {
      ILLUMINATIONS: ApiResps['/dal-dam/get-illumination-list']
      STATE_NAME: string,
      CITY_NAME: string,
      UNIT_NAME: string,
      UNIT_ID: number,
      COLLAPSED: boolean,
    }},
  });

  const groupIlluminations = () => {
    const groupedIlums = {};
    filterIlluminations(state.illuminations, state.searchState, state.selectedsStates, state.selectedsCities, state.selectedsUnits, state.selectedProgs)
      .forEach((illum) => {
        // @ts-ignore
        if (!illum.checked) illum.checked = false;
        if (!groupedIlums[illum.UNIT_ID]) {
          groupedIlums[illum.UNIT_ID] = {
            STATE_NAME: illum.STATE_NAME,
            UNIT_NAME: illum.UNIT_NAME,
            CITY_NAME: illum.CITY_NAME,
            UNIT_ID: illum.UNIT_ID,
            COLLAPSED: false,
            ILLUMINATIONS: [illum],
            // @ts-ignore
            CHECKED: illum.checked,
          };
        } else {
          groupedIlums[illum.UNIT_ID].ILLUMINATIONS.push(illum);
          // @ts-ignore
          if (!illum.checked) groupedIlums[illum.UNIT_ID].CHECKED = false;
        }
      });

    setState({ illuminationsGroupedBySite: groupedIlums });
  };

  const getIlluminations = async () => {
    setState({ isFetching: true });
    const list = await apiCall('/dal-dam/get-illumination-list', {
      ...(clientId && {
        clientIds: [clientId],
      }),
      ...(unitId && {
        unitIds: [unitId],
      }),
    });

    setState({ isFetching: false, illuminations: list });
    groupIlluminations();
    render();
  };

  useEffect(() => {
    getIlluminations();
  }, []);

  useEffect(() => {
    groupIlluminations();
  }, [state.searchState, state.selectedsUnits, state.selectedsStates, state.selectedsCities, state.selectedProgs]);

  const handleClearAllDam = async (illum: ApiResps['/dal-dam/get-illumination-list'][number], devsErrors: { DEVICE_CODE: string, ILLUMINATION_ID: number, Motivo: string }[]) => {
    if (state.clearAllScheds) {
      try {
        await apiCall('/dam/delete-all-schedules', { damId: illum.DEVICE_CODE });
      }
      catch (err) {
        devsErrors.push({ DEVICE_CODE: illum.DEVICE_CODE, ILLUMINATION_ID: illum.ILLUMINATION_ID, Motivo: 'Error ao limpar todas as programações' });
      }
      if (devsErrors.find((erro) => erro.DEVICE_CODE === illum.DEVICE_CODE && erro.ILLUMINATION_ID === illum.ILLUMINATION_ID)) {
        return;
      }
    }

    if (state.clearAllExcepts) {
      try {
        await apiCall('/dam/delete-all-exceptions', { damId: illum.DEVICE_CODE });
      }
      catch (err) {
        devsErrors.push({ DEVICE_CODE: illum.DEVICE_CODE, ILLUMINATION_ID: illum.ILLUMINATION_ID, Motivo: 'Error ao limpar todas as programações' });
      }
    }
  };

  const handleClearAllDal = async (illum: ApiResps['/dal-dam/get-illumination-list'][number], devsErrors: { DEVICE_CODE: string, ILLUMINATION_ID: number, Motivo: string }[]) => {
    if (state.clearAllScheds) {
      try {
        await apiCall('/dal/delete-illumination-all-scheds', { DAL_CODE: illum.DEVICE_CODE, ILLUMINATION_ID: illum.ILLUMINATION_ID, FROM_MULTIPLE_PROGRAMMING: true });
      }
      catch (err) {
        devsErrors.push({ DEVICE_CODE: illum.DEVICE_CODE, ILLUMINATION_ID: illum.ILLUMINATION_ID, Motivo: 'Error ao limpar todas as programações' });
      }
    }

    if (devsErrors.find((erro) => erro.DEVICE_CODE === illum.DEVICE_CODE && erro.ILLUMINATION_ID === illum.ILLUMINATION_ID)) {
      return;
    }

    if (state.clearAllExcepts) {
      try {
        await apiCall('/dal/delete-illumination-all-exceptions', { DAL_CODE: illum.DEVICE_CODE, ILLUMINATION_ID: illum.ILLUMINATION_ID, FROM_MULTIPLE_PROGRAMMING: true });
      }
      catch (err) {
        devsErrors.push({ DEVICE_CODE: illum.DEVICE_CODE, ILLUMINATION_ID: illum.ILLUMINATION_ID, Motivo: 'Error ao limpar todas as exceções' });
      }
    }
  };

  async function clearAllPersisted() {
    setState({ isLoading: true });
    // @ts-ignore
    const selectedDevList = state.illuminations.filter((dev) => dev.checked);
    const devsErrors = [] as { DEVICE_CODE: string, ILLUMINATION_ID: number, Motivo: string }[];

    if (selectedDevList.length === 0) {
      toast.warn(t('semDispositivoSelecionad'));
      setState({ isLoading: false });
      return;
    }

    try {
      await Promise.all(selectedDevList.map(async (illum) => {
        await checkDevOnline(illum.DEVICE_CODE, illum.ILLUMINATION_ID, devsErrors);

        if (devsErrors.find((erro) => erro.DEVICE_CODE === illum.DEVICE_CODE && erro.ILLUMINATION_ID === illum.ILLUMINATION_ID)) {
          setState({ isLoading: false, openModal: null });
          return;
        }

        if (illum.DEVICE_CODE.startsWith('DAL')) {
          await handleClearAllDal(illum, devsErrors);
        } else if (illum.DEVICE_CODE.startsWith('DAM')) {
          await handleClearAllDam(illum, devsErrors);
        }
      }))
        .catch((err) => console.log(err));

      if (devsErrors.length > 0) {
        throw new Error();
      } else {
        toast.success(t('progEnviadaSucesso'));
        setState({ isLoading: false, openModal: null });
        render();
        await getIlluminations();
      }
    }
    catch (err) {
      console.log(err);
      let message = t('erroProgDispositivos');
      devsErrors.forEach(({ DEVICE_CODE, Motivo }) => {
        if (!message.includes(DEVICE_CODE)) {
          console.log(`${DEVICE_CODE}:${Motivo}`);
          message += `\n${DEVICE_CODE}`;
          return DEVICE_CODE;
        }
      });
      const pendingIllums = devsErrors.map(({ ILLUMINATION_ID }) => (ILLUMINATION_ID));

      const refreshIllumnsList = state.illuminations.map((illum) => {
        if (!pendingIllums.includes(illum.ILLUMINATION_ID)) {
          // @ts-ignore
          illum.checked = false;
        }
        return illum;
      });
      setState({ illuminations: refreshIllumnsList, isLoading: false, openModal: null });

      toast.error(message, { closeOnClick: false, draggable: false, duration: 10000 });
      return;
    }
    render();
  }

  if (state.isLoading) return <LoaderWithText text="Limpando existentes. Aguarde um pouco... " />;

  if (state.isFetching) {
    return (
      <Loader />
    );
  }

  return (
    <>
      {(state.illuminations.length > 0) && (
        <>
          <IlluminationMultipleProgFilter state={state} render={render} clientId={clientId} />
          <IlluminationMultipleProgList state={state} render={render} clientId={clientId} />
          <Flex width="98%" justifyContent="flex-end" marginTop="15px">
            <Button style={{ width: '260px', fontSize: '10px' }} variant="red-inv-border" onClick={() => setState({ openModal: 'clear-all', clearAllExcepts: false, clearAllScheds: false })}>
              <Flex alignItems="center" justifyContent="center">
                <SmallTrashIcon color="#DC0E01" />
                <span style={{ marginLeft: '10px' }}>{t('limparExistentesUpper')}</span>
              </Flex>
            </Button>
          </Flex>
          <HandleIllumScheds clientId={clientId} unitId={unitId} state={state} render={render} getIlluminations={getIlluminations} />
          {(state.openModal != null) && (
            <ModalWindow style={{ padding: '0', overflowX: 'hidden', width: '455px' }} borderTop onClickOutside={() => setState({ openModal: null, clearAllExcepts: false, clearAllScheds: false })}>
              {state.openModal === 'clear-all'
              && (
                <Flex flexDirection="column" justifyContent="center" alignItems="center" padding="80px">
                  <Box width="100%">
                    <Flex>
                      <SmallTrashIcon color="#DC0E01" />
                      <h4 style={{ fontWeight: 'bold', marginLeft: '10px' }}>{t('limparExistentes')}</h4>
                    </Flex>
                    <p style={{ color: '#8b8b8b', hyphens: 'auto' }}>
                      {t('confirmacaoLimpezaPt1')}
                      &nbsp;
                      <span style={{ fontWeight: 'bold' }}>{t('confirmacaoLimpezaPt2')}</span>
                      &nbsp;
                      {t('confirmacaoLimpezaPt3')}
                    </p>
                    <Flex alignItems="center" justifyContent="space-between">
                      <Checkbox
                        size={20}
                        checked={state.clearAllScheds}
                        label={t('programacoes')}
                        onClick={() => { setState({ clearAllScheds: !state.clearAllScheds }); }}
                        style={{ color: '#8b8b8b' }}
                      />
                      <Checkbox
                        size={20}
                        checked={state.clearAllExcepts}
                        label={t('excecoes')}
                        onClick={() => { setState({ clearAllExcepts: !state.clearAllExcepts }); }}
                        style={{ color: '#8b8b8b' }}
                      />
                    </Flex>
                    <Flex marginTop="40px" alignItems="center" justifyContent="space-between">
                      <Button
                        style={{ width: '200px' }}
                        variant="secondary"
                        onClick={() => {
                          state.openModal = null;
                          render();
                          clearAllPersisted();
                        }}
                      >
                        {t('limpar')}
                      </Button>
                      <UnderlineBtn onClick={() => setState({ openModal: null, clearAllExcepts: false, clearAllScheds: false })}>
                        {t('cancelar')}
                      </UnderlineBtn>
                    </Flex>
                  </Box>
                </Flex>
              )}
            </ModalWindow>
          )}
        </>
      )}
    </>
  );
};

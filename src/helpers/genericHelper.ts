import { t } from 'i18next';
import { toast } from 'react-toastify';
import { apiCall } from '../providers';
import { getCachedDevInfo } from './cachedStorage';
import { getUserProfile } from './userProfile';

export function setValueState(key) {
  const profile = getUserProfile();
  if (profile.permissions.isAdminSistema) {
    return [];
  }
  if (sessionStorage.key(key) !== null && sessionStorage.getItem(key) !== null) {
    if (sessionStorage.getItem(key)!.split(',').length > 1) {
      const newList = sessionStorage.getItem(key)?.split(',');
      return newList;
    }
    return sessionStorage.getItem(key)!;
  }
  return [];
}

export async function getCitiesList(state, render): Promise<void> {
  try {
    const { list: citiesList } = await apiCall('/dac/get-cities-list', {});
    state.citiesListOpts = citiesList.map((city) => ({
      value: city.id.toString(),
      name: city.name,
      stateId: city.stateId,
    }));
    state.selectedCityOpts = setValueState('filterCity')!;
    render();
  } catch (err) {
    console.log(err);
    toast.error(t('ErroCidades'));
  }
}

export async function getUnitsList(state, render): Promise<void> {
  try {
    const profile = getUserProfile();
    const { list: unitsList } = await apiCall('/clients/get-units-list-basic', {
      INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients || !!profile.permissions.isInstaller,
    });
    state.unitsListOpts = unitsList.map((unit) => ({
      value: unit.UNIT_ID.toString(),
      name: unit.UNIT_NAME,
      clientId: unit.CLIENT_ID,
      city: unit.CITY_ID,
      state: unit.STATE_ID,
    }));
    state.selectedUnitOpts = setValueState('filterUnit')!;
    render();
  } catch (err) {
    console.log(err);
    toast.error(t('erroUnidades'));
  }
}

export async function getClientsList(state, render): Promise<void> {
  try {
    const { list: clientsList } = await apiCall('/clients/get-clients-list', { INCLUDE_CITIES: true, INCLUDE_STATES: true });
    state.clientsListOpts = clientsList.map((client) => ({
      value: client.CLIENT_ID.toString(),
      name: client.NAME,
      cities: client.CITIES,
      states: client.STATES,
    }));
    state.selectedClientOpts = setValueState('filterClient')!;
    render();
  } catch (err) {
    console.log(err);
    toast.error(t('erroUnidades'));
  }
}

export async function getStatesList(state, render): Promise<void> {
  try {
    const { list: statesList } = await apiCall('/dac/get-states-list', {});
    state.statesListOpts = statesList.map((state) => ({
      value: state.id.toString(),
      name: state.name,
    }));
    state.selectedStateOpts = setValueState('filterStates')!;
    render();
  } catch (err) {
    console.log(err);
    toast.error(t('ErroEstados'));
  }
}

export async function getDeviceInfo(devId: string, state: { devInfo, isLoading: boolean }, setState: (props: { devInfo?, isLoading?: boolean }) => void): Promise<void> {
  if (!state.devInfo) {
    try {
      state.devInfo = await getCachedDevInfo(devId, {});
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }
  setState({ isLoading: false });
}

export async function getCountry(state, render, typeValueName) {
  try {
    const { list: statesList } = await apiCall('/dac/get-countries-list', {});
    state.countryListOpts = statesList.map((state) => ({
      value: typeValueName?.includes('pais') ? state.name : state.id,
      name: state.name,
    }));
    render();
  } catch (err) {
    console.log(err);
    toast.error(t('ErroEstados'));
  }
}

export function ajustParams(param) {
  if (typeof param === 'string') {
    return [param];
  }
  return param;
}

export async function getSupervisorsList(state, render): Promise<void> {
  try {
    const { list: supervisors } = await apiCall('/clients/get-unit-supervisors', { UNIT_IDS: state.unitsListOpts?.map((x) => Number(x.value)) });
    const formattedData = supervisors.map((supervisor) => ({
      name: `${supervisor.NOME} ${supervisor.SOBRENOME}`,
      value: supervisor.USER_ID,
      unit_id: supervisor.UNIT_ID,
    }));

    const list = [] as { name: string; value: string; unit_ids: number[] }[];
    formattedData.forEach((supervisorOptions) => {
      const { name, value, unit_id } = supervisorOptions;
      const existingSupervisor = list.find((item) => item.name === name && item.value === value);

      if (existingSupervisor) {
        if (!existingSupervisor.unit_ids.includes(unit_id)) {
          existingSupervisor.unit_ids.push(unit_id);
        }
      } else {
        list.push({ name, value, unit_ids: [unit_id] });
      }
    });

    state.selectedSupervisorOpts = setValueState('filterSupervisor')!;
    state.supervisorListOpts = list;
    render();
  } catch (err) {
    console.log(err);
    toast.error(t('erroSupervisor'));
  }
}

export async function getClassesList(state, render): Promise<void> {
  try {
    const { list: classesList } = await apiCall('/clients/get-classes-list', { });

    const listClasses = [] as { name: string; value: string; }[];
    const listClassesNames = [] as { name: string; value: string; class: string, units: number[] }[];

    classesList.forEach((item) => {
      const exists = listClasses.some((listItem) => listItem.value === item.class.CLASS_TYPE);
      if (!exists) {
        listClasses.push({ name: item.class.CLASS_TYPE, value: item.class.CLASS_TYPE });
      }

      const existsName = listClassesNames.some((listItem) => listItem.class === item.class.CLASS_NAME);
      if (!existsName) {
        listClassesNames.push({
          name: item.class.CLASS_NAME,
          value: item.class.CLASS_NAME,
          class: item.class.CLASS_TYPE,
          units: item.units.map((unit) => unit.UNIT_ID),
        });
      }
    });

    state.classesNamesListOpts = listClassesNames;
    state.classesListOpts = listClasses;

    const selectedClass = setValueState('filterClass')!;
    state.selectedClassesOpts = selectedClass;
    state.selectedClassesNamesOpts = setValueState('filterClassName')!;
    state.classesNamesFilterListOpts = listClassesNames.filter((x) => !selectedClass?.length || selectedClass === x.class);
    render();
  } catch (err) {
    console.log(err);
    toast.error(t('erroClasse'));
  }
}

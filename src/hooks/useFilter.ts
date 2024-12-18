import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { toast } from 'react-toastify';

import { useStateVar } from '~/helpers/useStateVar';
import { apiCall, ApiResps } from '~/providers';

import { getUserProfile } from '~/helpers/userProfile';

const profile = getUserProfile();

export const useFilter = () => {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    isLoading: true,
    dacs_all: [] as ApiResps['/dac/get-dacs-list']['list'],
    duts_all: [] as ApiResps['/dut/get-duts-list']['list'],
    dams_all: [] as ApiResps['/dam/get-dams-list']['list'],
    dacs_filt: [] as ApiResps['/dac/get-dacs-list']['list'],
    duts_filt: [] as ApiResps['/dut/get-duts-list']['list'],
    dams_filt: [] as ApiResps['/dam/get-dams-list']['list'],
    countriesPositions: [] as ApiResps['/dac/get-countries-list']['list'],
    statesPositions: [] as ApiResps['/dac/get-states-list']['list'],
    citiesPositions: [] as ApiResps['/dac/get-cities-list']['list'],
    optionsCountry: [] as string[],
    optionsState: [] as string[],
    optionsCity: [] as string[],
    optionsUnits: [] as string[],
    filters: {
      country: null as null|string,
      state: null as null|string,
      city: null as null|string,
      unit: null as null|string,
    },
  });

  async function handleGetDacs() {
    const permissionsIncludeInstallationUnit = !!profile.manageAllClients || !!profile.permissions.isInstaller;
    try {
      const [
        responseDacs,
        responseDuts,
        responseCountries,
        responseStates,
        responseCities,
      ] = await Promise.all([
        apiCall('/dac/get-dacs-list', {
          includeHealthDesc: true,
          includeCapacityKW: true,
          INCLUDE_INSTALLATION_UNIT: permissionsIncludeInstallationUnit,
        }),
        apiCall('/dut/get-duts-list', {
          INCLUDE_INSTALLATION_UNIT: permissionsIncludeInstallationUnit,
        }),
        apiCall('/dac/get-countries-list', {}),
        apiCall('/dac/get-states-list', {}),
        apiCall('/dac/get-cities-list', {}),
      ]);

      state.dacs_all = (responseDacs && responseDacs.list.filter((item) => item.STATE_NAME && item.CITY_NAME && item.UNIT_NAME)) || [];
      state.duts_all = (responseDuts && responseDuts.list.filter((item) => item.STATE_NAME && item.CITY_NAME && item.UNIT_NAME)) || [];
      state.countriesPositions = (responseCountries?.list) || [];
      state.statesPositions = (responseStates?.list) || [];
      state.citiesPositions = (responseCities?.list) || [];
    } catch (err) {
      console.log(err);
      toast.error(t('erroCarregarDadosMaquinasAmbientesMonitorados'));
    }
    handleSelect();
    setState({ isLoading: false });
  }

  function handleSelect(filter?: { type, value }) {
    if (filter?.type === 'country') {
      state.filters.state = '';
      state.filters.city = '';
      state.filters.unit = '';
      state.filters.country = filter.value || '';
    }

    else if (filter?.type === 'state') {
      state.filters.city = '';
      state.filters.unit = '';
      state.filters.state = filter?.value || '';
    }

    else if (filter?.type === 'city') {
      state.filters.unit = '';
      state.filters.city = filter?.value || '';
    }

    else if (filter?.type === 'unit') {
      state.filters.unit = filter?.value || '';
    }

    state.dacs_filt = handleFilterChanged(state.dacs_all.filter((item) => item.DAC_ID));
    state.duts_filt = handleFilterChanged(state.duts_all.filter((item) => item.DEV_ID));
    state.dams_filt = state.dams_all;

    const options = [...state.dacs_filt, ...state.duts_filt];
    state.optionsCountry = Array.from(new Set(handleFilterCountry(options)));
    if (!filter?.type || filter?.type === 'country') state.optionsState = Array.from(new Set(handleFilterState(options)));
    if (!filter?.type || filter?.type === 'country' || filter?.type === 'state') state.optionsCity = Array.from(new Set(handleFilterCity(options)));
    if (!filter?.type || filter?.type === 'country' || filter?.type === 'state' || filter?.type === 'city') state.optionsUnits = Array.from(new Set(handleFilterUnit(options)));

    render();
  }

  function handleFilterChanged<T extends { COUNTRY_NAME: string, STATE_NAME: string, CITY_NAME: string, UNIT_NAME: string }>(array: T[]) {
    return array.filter((item) => {
      if (state.filters.country && state.filters.country !== item.COUNTRY_NAME) {
        return false;
      }
      if (state.filters.state && state.filters.state !== item.STATE_NAME) {
        return false;
      }
      if (state.filters.city && state.filters.city !== item.CITY_NAME) {
        return false;
      }
      if (state.filters.unit && state.filters.unit !== item.UNIT_NAME) {
        return false;
      }
      return true;
    });
  }

  function handleFilterCountry(array: { UNIT_NAME: string, CITY_NAME: string, STATE_NAME: string, COUNTRY_NAME: string }[]): string[] {
    return array.filter((item) => {
      if (state.filters.state && state.filters.state !== item.STATE_NAME) {
        return false;
      }
      if (state.filters.city && state.filters.city !== item.CITY_NAME) {
        return false;
      }
      if (state.filters.unit && state.filters.unit !== item.UNIT_NAME) {
        return false;
      }

      return true;
    })
      .map((item) => item.COUNTRY_NAME).sort();
  }

  function handleFilterState(array: { UNIT_NAME: string, CITY_NAME: string, STATE_NAME: string, COUNTRY_NAME: string }[]): string[] {
    return array.filter((item) => {
      if (state.filters.country && state.filters.country !== item.COUNTRY_NAME) {
        return false;
      }
      if (state.filters.city && state.filters.city !== item.CITY_NAME) {
        return false;
      }
      if (state.filters.unit && state.filters.unit !== item.UNIT_NAME) {
        return false;
      }

      return true;
    })
      .map((item) => item.STATE_NAME).sort();
  }

  function handleFilterCity(array: { UNIT_NAME: string, CITY_NAME: string, STATE_NAME: string, COUNTRY_NAME: string }[]): string[] {
    return array.filter((item) => {
      if (state.filters.country && state.filters.country !== item.COUNTRY_NAME) {
        return false;
      }
      if (state.filters.state && state.filters.state !== item.STATE_NAME) {
        return false;
      }
      if (state.filters.unit && state.filters.unit !== item.UNIT_NAME) {
        return false;
      }

      return true;
    })
      .map((item) => item.CITY_NAME).sort();
  }

  function handleFilterUnit(array: { UNIT_NAME: string, CITY_NAME: string, STATE_NAME: string, COUNTRY_NAME: string }[]): string[] {
    return array.filter((item) => {
      if (state.filters.country && state.filters.country !== item.COUNTRY_NAME) {
        return false;
      }
      if (state.filters.state && state.filters.state !== item.STATE_NAME) {
        return false;
      }
      if (state.filters.city && state.filters.city !== item.CITY_NAME) {
        return false;
      }

      return true;
    })
      .map((item) => item.UNIT_NAME).sort();
  }

  useEffect(() => {
    handleGetDacs();
  }, []);

  return { ...state, handleSelect };
};

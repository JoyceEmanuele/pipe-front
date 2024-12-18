import { getCitiesList, getStatesList, getUnitsList } from '~/helpers/genericHelper';

type Option = {
  value: string;
  name: string;
}

interface StateListOpts {
  unitsListOpts: (Option & { clientId: number})[];
  statesListOpts: Option[];
  citiesListOpts: Option[];
}

export const getStateUnitCitiesList = async (state:StateListOpts, render: () => void, clientId?: number): Promise<void> => {
  if (clientId) {
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
  }
};
